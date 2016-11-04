'use strict';

require('insulin').factory('ndm_From',
  ['ndm_assert', 'ndm_ConditionLexer', 'ndm_ConditionParser',
  'ndm_ConditionCompiler', 'ndm_Query'],
  ndm_FromProducer);

function ndm_FromProducer(assert, ConditionLexer, ConditionParser,
  ConditionCompiler, Query) {

  /**
   * A From can be used to create a SELECT, DELETE, or UPDATE query.
   * @extends Query
   */
  class From extends Query {

    /**
     * @typedef From~TableMeta
     * @type {object}
     * @property {string} table - The name of the table.
     * @property {string} as - An alias for the table.  This is needed if, for example,
     * the same table is joined in multiple times.
     * @property {string} mapTo - The table mapping.  That is, the name of
     * the property in the resulting normalised object.
     * @property {Condition} cond -  The condition (WHERE or ON) associated with the table.
     * @property {string} parent - The alias of the parent table, if any.
     * @property {string} relType - The type of relationship between the
     * parent and this table ("single" or "many").  If set to "single" the
     * table will be serialized into an object, otherwise the table will be
     * serialized into an array.  "many" is the default.
     */

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

      // These are the tables that are being queried due to FROM our JOINs.
      // The key is the table's unique alias.
      this._tables = new Map();

      // This is a map of all the available column aliases.  These are the
      // columns that are available for selecting, or performing WHERE or ON
      // clauses upon.  The key is the fully-qualified column name.
      this._availableCols = new Map();

      // Add the FROM table.  
      if (typeof meta === 'string')
        this._addTable({table: meta});
      else
        this._addTable(meta);

      // These are for building conditions (WHERE and ON conditions).
      this._condLexer    = new ConditionLexer();
      this._condParser   = new ConditionParser();
      this._condCompiler = new ConditionCompiler(this.escaper);
    }

    /**
     * Create a fully-qualified column name.
     * Column names must be unique, and the same column name could exist
     * multiple times (two tables could have the same column name, or the same
     * table could be joined multiple times).  Hence each column is aliased,
     * prefixed by the table alias.
     * Example: `user`.`name` AS `user.name`
     * @param {string} tableAlias - The alias for the table.
     * @param {string} colName - The column name.
     * @return {string} The fully-qualified column name, unescaped.
     */
    createFQColName(tableAlias, colName) {
      return `${tableAlias}.${colName}`;
    }

    /**
     * Private helper function to add a table to the query.  This adds the
     * table to the _tables array, and makes all the columns available in the
     * _availableCols map.
     * @private
     * @param {TableMeta} meta - A meta object describing the table.
     * @param {string} joinType - The type of join for the table, or null if
     * this is the FROM table.
     * @return {this}
     */
    _addTable(meta, joinType) {
      let table, tableAlias, parent, tableMeta;

      // The table name is required.
      assert(meta.table !== undefined, 'table is required.');

      // The name looks good - pull the table and set up the alias.
      table      = this.database.getTableByName(meta.table);
      tableAlias = meta.as || table.name;

      // Aliases must be word characters.  They can't, for example, contain periods.
      assert(tableAlias.match(/^\w+$/) !== null, 'Alises must only contain word characters.');

      // If a parent is specified, make sure it is a valid alias.
      parent = meta.parent || null;

      if (parent !== null) {
        assert(this._tables.has(parent),
          `Parent table alias ${parent} is not a valid table alias.`);
      }

      // Add the table to the list of tables.
      tableMeta = {
        tableAlias: tableAlias,
        mapTo:      meta.mapTo  || table.mapTo,
        table:      table,
        cond:       meta.cond   || null,
        joinType:   joinType    || null,
        parent:     meta.parent || null,
        relType:    meta.relType
      };

      this._tables.set(tableAlias, tableMeta);

      // Make each column available for selection or conditions.
      table.columns.forEach(function(column) {
        const fqColName = this.createFQColName(tableAlias, column.name);

        this._availableCols.set(fqColName, {tableAlias, column, fqColName});
      }, this);

      return this;
    }

    /**
     * Helper method to get the meta data of the FROM table, which is the first
     * table in the _tables map.
     * @protected
     * @return {From~TableMeta} A meta object describing the table (reference
     * _addTable).
     */
    _getFromMeta() {
      return this._tables.values().next().value;
    }

    /**
     * Helper method to get the meta data of the JOIN'd in tables.
     * @protected
     * @return {From~TableMeta[]} A meta object describing the table (reference
     * _addTable).
     */
    _getJoinMeta() {
      // All but the first table (the first table is the FROM table).
      return Array.from(this._tables.values()).slice(1);
    }

    /**
     * Check if the columns col is available (for selecting or for a
     * condition).
     * @param {string} fqColName - The column to look for.  This is the
     * unescaped alias of the column (<table-alias>.<column-name>) as created
     * by the createFQColName function.
     * @return {boolean} true if the column is available, false otherwise.
     */
    isColumnAvailable(fqColName) {
      return this._availableCols.has(fqColName);
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
      const fromMeta = this._getFromMeta();
      let   tokens, tree, columns; 

      assert(fromMeta.cond === null, 'where already performed on query.');

      // Lex and parse the condition.
      tokens  = this._condLexer.parse(cond);
      tree    = this._condParser.parse(tokens);

      // Make sure that each column in the condition is available for selection.
      columns = this._condCompiler.getColumns(tree);
      for (let i = 0; i < columns.length; ++i) {
        assert(this.isColumnAvailable(columns[i]),
          `The column alias ${columns[i]} is not available for a where condition.`);
      }

      fromMeta.cond = this._condCompiler.compile(tree, params);
      return this;
    }

    /**
     * Join a table.
     * @private
     * @param {From~TableMeta} meta - See _addTable.  Here "on" replaces "cond".
     * @param {object} params - An object of key-value pairs that are used to
     * replace parameters in the query.
     * @param {string} joinType The From.JOIN_TYPE of the join.
     * @return {this}
     */
    _join(meta, params, joinType) {
      let tokens, tree;

      if (meta.on) {
        // Lex, parse, and compile the condition.
        tokens    = this._condLexer.parse(meta.on);
        tree      = this._condParser.parse(tokens);
        meta.cond = this._condCompiler.compile(tree, params);
      }

      // Add the JOIN table.
      this._addTable(meta, joinType);

      // Make sure that each column used in the join is available (e.g. belongs to
      // one of the tables in the query).
      if (meta.on) {
        this._condCompiler.getColumns(tree).forEach(function(col) {
          assert(this.isColumnAvailable(col),
            `The column alias ${col} is not available for an on condition.`);
        }, this);
      }

      return this;
    }

    /**
     * Inner join a table.
     * @private
     * @param {From~TableMeta} meta - See _addTable.
     * @param {object} params - An object of key-value pairs that are used to
     * replace parameters in the query.
     * @return {this}
     */
    innerJoin(meta, params) {
      return this._join(meta, params, From.JOIN_TYPE.INNER);
    }

    /**
     * Left outer join a table.
     * @private
     * @param {From~TableMeta} meta - See _addTable.
     * @param {object} params - An object of key-value pairs that are used to
     * replace parameters in the query.
     * @return {this}
     */
    leftOuterJoin(meta, params) {
      return this._join(meta, params, From.JOIN_TYPE.LEFT_OUTER);
    }

    /**
     * Right outer join a table.
     * @private
     * @param {From~TableMeta} meta - See _addTable.
     * @param {object} params - An object of key-value pairs that are used to
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
      const fromMeta  = this._getFromMeta();
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
      this._getJoinMeta().forEach(function(tblMeta) {
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
      const fromMeta = this._getFromMeta();
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

  From.JOIN_TYPE = {
    INNER:       'INNER JOIN',
    LEFT_OUTER:  'LEFT OUTER JOIN',
    RIGHT_OUTER: 'RIGHT OUTER JOIN'
  };

  return From;
}

