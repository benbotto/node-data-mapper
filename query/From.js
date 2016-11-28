'use strict';

require('insulin').factory('ndm_From',
  ['ndm_assert', 'ndm_ConditionLexer', 'ndm_ConditionParser',
  'ndm_ConditionCompiler', 'ndm_Query', 'ndm_TableMetaList', 'ndm_Column'],
  ndm_FromProducer);

function ndm_FromProducer(assert, ConditionLexer, ConditionParser,
  ConditionCompiler, Query, TableMetaList, Column) {

  /**
   * A From can be used to create a SELECT, DELETE, or UPDATE query.
   * @extends Query
   */
  class From extends Query {
    /**
     * Initialize the From instance.  WHERE and JOINs can be applied.
     * @param {Database} database - A Database instance that will be queried.
     * @param {Escaper} escaper - An instance of an Escaper matching the
     * database type (i.e.  MySQLEscaper or MSSQLEscaper).
     * @param {QueryExecuter} queryExecuter - A QueryExecuter instance.
     * @param {TableMetaList~TableMeta|string} meta - Either a TableMeta
     * instance containing information about the table to query from, or a
     * string that can be parsed using the parseFromString method.
     */
    constructor(database, escaper, queryExecuter, meta) {
      super(database, escaper, queryExecuter);

      // These are for building conditions (WHERE and ON conditions).
      this._condLexer    = new ConditionLexer();
      this._condParser   = new ConditionParser();
      this._condCompiler = new ConditionCompiler(this.escaper);

      // This is the list of tables that are added.  The first table is the
      // FROM table, and all the other tables are added via JOINs.
      this._tableMetaList = new TableMetaList(this.database);

      // Add the FROM table.  
      if (typeof meta === 'string')
        this._tableMetaList.addTable(this.parseFromString(meta));
      else
        this._tableMetaList.addTable(meta);
    }

    /**
     * Parse the string fromStr and return a table meta object.
     * @param {string} fromStr - A from string, in the format
     * &lt;table-name&gt;[ [as ]&lt;table-alias&gt;].  For example, any of
     * these is valid: 'users'; 'users u'; 'users as u'; 'users AS u'.
     * @return {TableMetaList~TableMeta} A meta object that has "table" and
     * "as" set.
     */
    parseFromString(fromStr) {
      let matches, table, as;

      // table t.
      if ((matches = fromStr.match(/^(\w+)\s+(\w+)$/)))
        [, table, as] = matches;
      // table
      else if ((matches = fromStr.match(/^\w+$/)))
        table = as = fromStr;
      // table as t
      else if ((matches = fromStr.match(/^(\w+)\s+(?:as|AS)\s+(\w+)$/)))
        [, table, as] = matches;
      else
        throw new Error('From must be in the format: <table-name>[ [as ]<table-alias>].');

      return {table, as};
    }

    /**
     * Parse the string joinStr and return a table meta object.
     *
     * If a parent alias is provided, there must be exactly 1 relationship
     * between the parent table and the child table, or an exception shall be
     * raised.
     *
     * If the parent table owns the primary key, the relType will be single
     * (e.g. it is a many-to-one relationship).
     *
     * If the child table owns the primary key, the relType will be many (it is
     * a one-to-many relationship).
     *
     * @param {string} joinStr - A join string, in the format
     * [&lt;parent-table-alias&gt;.]&lt;table-name&gt;[ [as ]&lt;table-alias&gt;].
     * For example, any of these is valid (assuming 'u' is a valid parent table
     * alias): 'u.phone_numbers'; 'u.phone_numbers pn'; 'u.phone_numbers as pn';
     * 'u.phone_numbers AS pn'; 'phone_numbers'; 'phone_numbers pn';
     * 'phone_numbers as pn'; 'phone_numbers AS pn'.
     * @return {TableMetaList~TableMeta} A meta object that has at least
     * "table" and "as" set. "parent", "relType" and "cond" will also be set if
     * a parent table alias is provided.
     */
    parseJoinString(joinStr) {
      const parentRE = /^(\w+)\./;

      let matches, parent, meta;

      // Check for a parent.
      if ((matches = joinStr.match(parentRE))) {
        [, parent] = matches;
        joinStr = joinStr.replace(parentRE, '');
      }

      // Without a parent, the remaining string is the same as a from string.
      try {
        meta = this.parseFromString(joinStr);
      }
      catch (ex) { // jshint:ignore line
        // The error is customized.
        throw new Error('Join must be in the format: ' +
          '[<parent-table-alias>.]<table-name>[ [as ]<table-alias>].');
      }

      // If there is a parent alias provided, figoure out how to join the two
      // tables.
      if (parent) {
        const parTblMeta = this._tableMetaList.tableMetas.get(parent);
        const parTblName = parTblMeta.table.name;
        const fks        = this.database.relStore.getRelationships(
          meta.table, parTblName);
        let   parCol, childCol;

        assert(fks.length === 1,
          'Automatic joins can only be performed if there is exactly one '+
          'relationship between the parent and child tables.');

        if (fks[0].table === parTblName) {
          // Parent owns the foreign key.
          parCol       = Column.createFQColName(parent,  fks[0].column);
          childCol     = Column.createFQColName(meta.as, fks[0].references.column);
          meta.relType = 'single';
        }
        else {
          // Child owns the foreign key.
          parCol       = Column.createFQColName(parent,  fks[0].references.column);
          childCol     = Column.createFQColName(meta.as, fks[0].column);
          meta.relType = 'many';
        }

        meta.cond   = {$eq: {[parCol]: childCol}};
        meta.parent = parent;
      }

      return meta;
    }

    /**
     * Helper method to get the meta data of the FROM table, which is the first
     * table in the _tables map.
     * @protected
     * @return {TableMetaList~TableMeta} A meta object describing the table.
     */
    getFromMeta() {
      return this._tableMetaList.tableMetas.values().next().value;
    }

    /**
     * Helper method to get the meta data of the JOIN'd in tables.
     * @protected
     * @return {TableMetaList~TableMeta[]} A meta object describing the table.
     */
    getJoinMeta() {
      // All but the first table (the first table is the FROM table).
      return Array.from(this._tableMetaList.tableMetas.values()).slice(1);
    }

    /**
     * Add a where condition.
     * @param {Condition} cond - The condition object.  For the format specs,
     * reference ConditionCompiler.
     * @param {Object} params - An object of key-value pairs that are used to
     * replace parameters in the query.
     * @return {this}
     */
    where(cond, params) {
      const fromMeta = this.getFromMeta();
      let   tokens, tree, columns; 

      assert(fromMeta.cond === null,
        'where already performed on query.');

      // Lex and parse the condition.
      tokens  = this._condLexer.parse(cond);
      tree    = this._condParser.parse(tokens);

      // Make sure that each column in the condition is available for selection.
      columns = this._condCompiler.getColumns(tree);
      for (let i = 0; i < columns.length; ++i) {
        assert(this._tableMetaList.isColumnAvailable(columns[i]),
          `The column "${columns[i]}" is not available for a where condition.`);
      }

      fromMeta.cond = this._condCompiler.compile(tree, params);
      return this;
    }

    /**
     * Join a table.
     * @param {TableMetaList~TableMeta} meta - The table metadata.
     * @param {Object} params - An object of key-value pairs that are used to
     * replace parameters in the query.
     * @return {this}
     */
    join(meta, params) {
      // "on" is a convenience alias for "cond", as "on" is more intuitive when
      // joining tables.
      const on = meta.on || meta.cond;

      let tokens, tree;

      // The joinType is required.
      assert(meta.joinType, 'joinType is required.');

      if (on) {
        // Lex, parse, and compile the condition.
        tokens    = this._condLexer.parse(on);
        tree      = this._condParser.parse(tokens);
        meta.cond = this._condCompiler.compile(tree, params);
      }

      // Add the JOIN table.
      this._tableMetaList.addTable(meta);

      // Make sure that each column used in the join is available (e.g. belongs to
      // one of the tables in the query).
      if (on) {
        this._condCompiler.getColumns(tree).forEach(function(col) {
          assert(this._tableMetaList.isColumnAvailable(col),
            `The column "${col}" is not available for an on condition.`);
        }, this);
      }

      return this;
    }

    /**
     * Private helper method for joins.
     * @private.
     * @param {TableMetaList~TableMeta} meta - The table metadata.
     * @param {Object} params - An object of key-value pairs that are used to
     * replace parameters in the query.
     * @param {From.JOIN_TYPE} joinType - The type of join.
     * @return {this}
     */
    _join(meta, params, joinType) {
      if (typeof meta === 'string')
        meta = this.parseJoinString(meta);
      meta.joinType = joinType;
      return this.join(meta, params);
    }

    /**
     * Inner join a table.
     * @param {TableMetaList~TableMeta} meta - The table metadata.
     * @param {Object} params - An object of key-value pairs that are used to
     * replace parameters in the query.
     * @return {this}
     */
    innerJoin(meta, params) {
      return this._join(meta, params, From.JOIN_TYPE.INNER);
    }

    /**
     * Left outer join a table.
     * @param {TableMetaList~TableMeta} meta - The table metadata.
     * @param {Object} params - An object of key-value pairs that are used to
     * replace parameters in the query.
     * @return {this}
     */
    leftOuterJoin(meta, params) {
      return this._join(meta, params, From.JOIN_TYPE.LEFT_OUTER);
    }

    /**
     * Right outer join a table.
     * @param {TableMetaList~TableMeta} meta - The table metadata.
     * @param {Object} params - An object of key-value pairs that are used to
     * replace parameters in the query.
     * @return {this}
     */
    rightOuterJoin(meta, params) {
      return this._join(meta, params, From.JOIN_TYPE.RIGHT_OUTER);
    }

    /**
     * Get the FROM portion of the query as a string.
     * @return {string} The FROM portion of the query (FROM &lt;table&gt; AS
     * &lt;alias&gt;), escaped.
     */
    getFromString() {
      const fromMeta  = this.getFromMeta();
      const fromName  = this.escaper.escapeProperty(fromMeta.table.name);
      const fromAlias = this.escaper.escapeProperty(fromMeta.as);

      return `FROM    ${fromName} AS ${fromAlias}`;
    }

    /**
     * Get the JOIN parts of the query string.
     * @return {string} The JOIN parts of the query, escaped.
     */
    getJoinString() {
      const joins = [];

      // Add any JOINs.  The first table is the FROM table, hence the initial
      // next() call on the table iterator.
      this.getJoinMeta().forEach(function(tblMeta) {
        const joinName  = this.escaper.escapeProperty(tblMeta.table.name);
        const joinAlias = this.escaper.escapeProperty(tblMeta.as);
        let   sql       = `${tblMeta.joinType} ${joinName} AS ${joinAlias}`;
        
        if (tblMeta.cond)
          sql += ` ON ${tblMeta.cond}`;
        joins.push(sql);
      }, this);

      return joins.join('\n');
    }

    /**
     * Get the WHERE portion of the query string.
     * @return {string} The WHERE part of the query, or a blank string if there
     * is no where clause.
     */
    getWhereString() {
      const fromMeta = this.getFromMeta();
      return fromMeta.cond ? `WHERE   ${fromMeta.cond}` : '';
    }

    /**
     * Get the SQL that represents the query.
     * @return {string} The actual SQL query (FROM, JOINS, and WHERE).
     */
    toString() {
      const parts = [
        this.getFromString(),
        this.getJoinString(),
        this.getWhereString()
      ];

      return parts
        .filter(part => part !== '')
        .join('\n');
    }
  }

  /**
   * @typedef From.JOIN_TYPE
   * @constant
   * @static
   * @type {Object}
   * @property {string} INNER - INNER JOIN.
   * @property {string} LEFT_OUTER - LEFT OUTER JOIN.
   * @property {string} RIGHT_OUTER - RIGHT OUTER JOIN.
   */
  From.JOIN_TYPE = {
    INNER:       'INNER JOIN',
    LEFT_OUTER:  'LEFT OUTER JOIN',
    RIGHT_OUTER: 'RIGHT OUTER JOIN'
  };

  return From;
}

