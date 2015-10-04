'use strict';

var escaper           = require(__dirname + '/escaper');
var assert            = require(__dirname + '/../assert');
var ConditionLexer    = require(__dirname + '/../query/ConditionLexer');
var ConditionParser   = require(__dirname + '/../query/ConditionParser');
var ConditionCompiler = require(__dirname + '/../query/ConditionCompiler');

/**
 * Construct a new SELECT query.  FROM and JOINs must come first so that
 * selected columns can be found.
 * @param database The database to select from.
 * @param tableName The table to select from, by name, not by alias.
 * @param tableAlias An optional alias for the table.  This is needed if, for
 *        example, the same table is joined in multple times.  Note that this
 *        is different than the Table's alias, which is used for serializing.
 */
function From(database, tableName, tableAlias)
{
  this._database   = database;
  this._selectCols = [];

  // These are the tables that are being queried due to FROM our JOINs.  There's
  // also a lookup of table alias to table.
  this._tables           = [];
  this._tableAliasLookup = {};

  // This is an array of all the available column aliases.  These are the
  // columns that are available for selecting, or performing WHERE or ON
  // clauses upon.  There is also a lookup for finding an available column
  // by alias, unescaped in <table-alias>.<column-name> form.
  this._availableCols       = [];
  this._availableColsLookup = {};

  // This is the query's where clause.
  this._where = null;

  // Add the FROM table.
  this._addTable(database.getTableByName(tableName),
    tableAlias || tableName, null, null);

  // These are for building conditions (WHERE and ON conditions).
  this._condLexer    = new ConditionLexer();
  this._condParser   = new ConditionParser();
  this._condCompiler = new ConditionCompiler();
}

From.JOIN_TYPE =
{
  INNER:       'INNER JOIN',
  LEFT_OUTER:  'LEFT OUTER JOIN',
  RIGHT_OUTER: 'RIGHT OUTER JOIN'
};

/**
 * Create an alias for a column.
 * Column names must be unique, and the same column name could exist
 * multiple times (two tables could have the same column name, or the same
 * table could be joined multiple times).  Hence each column is aliased,
 * prefixed by the table alias.
 * Example: `user`.`name` AS `user.name`
 * @param tableAlias The alias for the table.
 * @param colName The column name.
 */
From.prototype.createColumnAlias = function(tableAlias, colName)
{
  return tableAlias + '.' + colName;
};

/**
 * Private helper function to add a table to the query.  This adds the table to
 * the _tables array, adds a lookup for the table in _tableAliasLookup, and
 * makes all the columns available in the _availableCols array.
 * @param table The table from which all columns will be added.
 * @param tableAlias The table's alias (what is selected AS).
 * @param joinType The type of join for the table, or null if this is the
 *        FROM table.
 * @param on The join condition, or null if this is the FROM table.
 */
From.prototype._addTable = function(table, tableAlias, joinType, on)
{
  var tblMeta =
  {
    alias:    tableAlias,
    table:    table,
    joinType: joinType,
    on:       on
  };

  // Aliases must be word characters.  They can't, for example, contain periods.
  assert(tableAlias.match(/^\w+$/) !== null, 'Alises must only contain word characters.');

  // Add the table to the list of tables, and add a lookup of alias->table.
  this._tables.push(tblMeta);
  this._tableAliasLookup[tblMeta.alias] = table;

  // Make each column available for selection or conditions.
  table.getColumns().forEach(function(col)
  {
    var colAlias = this.createColumnAlias(tableAlias, col.getName());

    this._availableCols.push
    ({
      tableAlias: tableAlias,
      column:     col,
      colAlias:   colAlias
    });

    this._availableColsLookup[colAlias] = this._availableCols[this._availableCols.length - 1];
  }.bind(this));

  return tblMeta;
};

/**
 * Check if the columns col is available (for selecting or for a condition).
 * @param colAlias The column to look for, by alias.  This is the unescaped
 *        alias of the column (<table-alias>.<column-name>) as created by the
 *        createColumnAlias function.
 */
From.prototype.isColumnAvailable = function(colAlias)
{
  return this._availableColsLookup[colAlias] !== undefined;
};

/**
 * Select columns manually.
 * @param colAliases The array of column aliases to select.  Each column must
 *        be in the form <table-alias>.<column-name>.  Alternatively a list of
 *        columns can be passed in--this function is variadic.
 */
From.prototype.select = function(colAliases)
{
  var i, pk, pkAlias;
  var selColLookup = {};

  // Select may only be performed once on a query.
  assert(this._selectCols.length === 0, 'select already performed on query.');

  // Make sure colAliases is an array.
  if (!(colAliases instanceof Array))
    colAliases = Array.prototype.slice.call(arguments);

  colAliases.forEach(function(colAlias)
  {
    // Make sure the column is legal for selection.
    assert(this.isColumnAvailable(colAlias),
      'The column alias ' + colAlias + ' is not available for selection.');

    this._selectCols.push(this._availableColsLookup[colAlias]);
    selColLookup[colAlias] = this._availableColsLookup[colAlias];
  }.bind(this));

  // The primary key from each table must be selected.
  for (var tblAlias in this._tableAliasLookup)
  {
    // This is the primary key of the table, which is an array.
    pk = this._tableAliasLookup[tblAlias].getPrimaryKey();

    for (i = 0; i < pk.length; ++i)
    {
      // This is the alias of the column in the standard
      // <table-alias>.<column-name> format.
      pkAlias = this.createColumnAlias(tblAlias, pk[i].getName());

      assert(selColLookup[pkAlias] !== undefined,
        'The primary key of each table must be selected, but the primary key of table ' + 
        this._tableAliasLookup[tblAlias].getName() +
        ' is not present in the array of selected columns.');
    }
  }

  return this;
};

/**
 * Add a where condition.
 * @param cond The condition object.  For the format look at @ref ConditionCompiler.
 */
From.prototype.where = function(cond)
{
  var tokens, tree, columns; 

  assert(this._where === null, 'where already performed on query.');

  // Lex and parse the condition.
  tokens  = this._condLexer.parse(cond);
  tree    = this._condParser.parse(tokens);

  // Make sure that each column in the condition is available for selection.
  columns = this._condCompiler.getColumns(tree);
  for (var i = 0; i < columns.length; ++i)
  {
    assert(this.isColumnAvailable(columns[i]),
      'The column alias ' + columns[i] + ' is not available for a where condition.');
  }

  this._where = this._condCompiler.compile(tree);
  return this;
};

/**
 * Join a table.
 * @param joinType The From.JOIN_TYPE of the join.
 * @param tableName The table name to join.
 * @param tableAlias The alias for the table (used in conditions).
 * @param on An OnCondition.
 */
From.prototype._join = function(joinType, tableName, tableAlias, on)
{
  // Lex, parse, and compile the condition.
  var tokens = this._condLexer.parse(on);
  var tree   = this._condParser.parse(tokens);
  var onCond = this._condCompiler.compile(tree);

  // Add the JOIN table.
  var table = this._database.getTableByName(tableName);
  this._addTable(table, tableAlias, joinType, onCond);

  // Make sure that each column used in the join is available (e.g. belongs to
  // one of the tables in the query).
  var columns  = this._condCompiler.getColumns(tree);
  for (var i = 0; i < columns.length; ++i)
  {
    assert(this.isColumnAvailable(columns[i]),
      'The column alias ' + columns[i] + ' is not available for an on condition.');
  }

  return this;
};

/**
 * Inner join a table.
 * @param tableName The table name to join.
 * @param tableAlias The alias for the table (used in conditions).
 * @param on A key-value pair with the join columns.  Alternatively an array of
 *        key-value pairs can be passed in if the join is on a composite key.
 */
From.prototype.innerJoin = function(tableName, tableAlias, on)
{
  return this._join(From.JOIN_TYPE.INNER, tableName, tableAlias, on);
};

/**
 * Left outer join a table.
 * @param tableName The table name to join.
 * @param tableAlias The alias for the table (used in conditions).
 * @param on A key-value pair with the join columns.  Alternatively an array of
 *        key-value pairs can be passed in if the join is on a composite key.
 */
From.prototype.leftOuterJoin = function(tableName, tableAlias, on)
{
  return this._join(From.JOIN_TYPE.LEFT_OUTER, tableName, tableAlias, on);
};

/**
 * Right outer join a table.
 * @param tableName The table name to join.
 * @param tableAlias The alias for the table (used in conditions).
 * @param on A key-value pair with the join columns.  Alternatively an array of
 *        key-value pairs can be passed in if the join is on a composite key.
 */
From.prototype.rightOuterJoin = function(tableName, tableAlias, on)
{
  return this._join(From.JOIN_TYPE.RIGHT_OUTER, tableName, tableAlias, on);
};

/**
 * Get the SQL that represents the query.
 */
From.prototype.toString = function()
{
  var sql       = 'SELECT  ';
  var cols      = this._selectCols;
  var fromName  = escaper.escapeProperty(this._tables[0].table.getName());
  var fromAlias = escaper.escapeProperty(this._tables[0].alias);
  var tblMeta, joinName, joinAlias;

  // No columns specified.  Get all columns.
  if (cols.length === 0)
    cols = this._availableCols;

  // Escape each selected column and add it to the query.
  sql += cols.map(function(col)
  {
    var colName  = escaper.escapeProperty(col.column.getName());
    var colAlias = escaper.escapeProperty(col.colAlias);
    var tblAlias = escaper.escapeProperty(col.tableAlias);

    return tblAlias + '.' + colName + ' AS ' + colAlias;
  }.bind(this)).join(', ');

  // Add the FROM portion.
  sql += '\n';
  sql += 'FROM    ' + fromName + ' AS ' + fromAlias;

  // Add any JOINs.  The first table is the FROM table, hence the loop starts
  // at 1.
  for (var i = 1; i < this._tables.length; ++i)
  {
    tblMeta   = this._tables[i];
    joinName  = escaper.escapeProperty(tblMeta.table.getName());
    joinAlias = escaper.escapeProperty(tblMeta.alias);

    sql += '\n';
    sql += tblMeta.joinType + ' ' + joinName + ' AS ' + joinAlias + ' ON ' + tblMeta.on;
  }

  if (this._where !== null)
  {
    sql += '\n';
    sql += 'WHERE   ';
    sql += this._where;
  }

  return sql;
};

module.exports = From;

