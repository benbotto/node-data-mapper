'use strict';

require('insulin').factory('ndm_From',
  ['ndm_assert', 'ndm_ConditionLexer', 'ndm_ConditionParser',
  'ndm_ConditionCompiler', 'ndm_Query', 'ndm_TableMetaList'],
  ndm_FromProducer);

function ndm_FromProducer(assert, ConditionLexer, ConditionParser,
  ConditionCompiler, Query, TableMetaList) {

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
     * @param {object|string} meta - Either the name of the table to query
     * from, or a meta object describing the table:
     * @param {string} meta.table - The table name.
     * @param {string} meta.as - A unique alias for the table, which provides a
     * convient short-hand notation when querying, and also is used to prevent
     * ambiguity if the same table is referenced multiple times (for example,
     * via joins).
     * @param {string} meta.mapTo - The table mapping.  That is, the name of
     * the property in the resulting normalised object.
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
        this._tableMetaList.addTable({table: meta});
      else
        this._tableMetaList.addTable(meta);
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
     * @param {object} params - An object of key-value pairs that are used to
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
          `The column alias ${columns[i]} is not available for a where condition.`);
      }

      fromMeta.cond = this._condCompiler.compile(tree, params);
      return this;
    }

    /**
     * Join a table.
     * @param {TableMetaList~TableMeta} meta - The table metadata.
     * @param {object} params - An object of key-value pairs that are used to
     * replace parameters in the query.
     * @return {this}
     */
    join(meta, params) {
      let tokens, tree;

      // The joinType is required.
      assert(meta.joinType, 'joinType is required.');

      if (meta.on) {
        // Lex, parse, and compile the condition.
        tokens    = this._condLexer.parse(meta.on);
        tree      = this._condParser.parse(tokens);
        meta.cond = this._condCompiler.compile(tree, params);
      }

      // Add the JOIN table.
      this._tableMetaList.addTable(meta);

      // Make sure that each column used in the join is available (e.g. belongs to
      // one of the tables in the query).
      if (meta.on) {
        this._condCompiler.getColumns(tree).forEach(function(col) {
          assert(this._tableMetaList.isColumnAvailable(col),
            `The column alias ${col} is not available for an on condition.`);
        }, this);
      }

      return this;
    }

    /**
     * Inner join a table.
     * @param {TableMetaList~TableMeta} meta - The table metadata.
     * @param {object} params - An object of key-value pairs that are used to
     * replace parameters in the query.
     * @return {this}
     */
    innerJoin(meta, params) {
      meta.joinType = From.JOIN_TYPE.INNER;
      return this.join(meta, params);
    }

    /**
     * Left outer join a table.
     * @param {TableMetaList~TableMeta} meta - The table metadata.
     * @param {object} params - An object of key-value pairs that are used to
     * replace parameters in the query.
     * @return {this}
     */
    leftOuterJoin(meta, params) {
      meta.joinType = From.JOIN_TYPE.LEFT_OUTER;
      return this.join(meta, params);
    }

    /**
     * Right outer join a table.
     * @param {TableMetaList~TableMeta} meta - The table metadata.
     * @param {object} params - An object of key-value pairs that are used to
     * replace parameters in the query.
     * @return {this}
     */
    rightOuterJoin(meta, params) {
      meta.joinType = From.JOIN_TYPE.RIGHT_OUTER;
      return this.join(meta, params);
    }

    /**
     * Get the FROM portion of the query as a string.
     * @return {string} The FROM portion of the query (FROM &lt;table&gt; AS
     * &lt;alias&gt;), escaped.
     */
    getFromString() {
      const fromMeta  = this.getFromMeta();
      const fromName  = this.escaper.escapeProperty(fromMeta.table.name);
      const fromAlias = this.escaper.escapeProperty(fromMeta.tableAlias);

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
        const joinAlias = this.escaper.escapeProperty(tblMeta.tableAlias);
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
   * @type {object}
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

