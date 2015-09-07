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
  this._tables =
  [{
    alias: tableAlias || tableName,
    table: database.getTableByName(tableName)
  }];

  this._tableAliasLookup = {};
  this._tableAliasLookup[this._tables[0].alias] = this._tables[0].table;

  // This is an array of all the available column aliases.  These are the
  // columns that are available for selecting, or performing WHERE or ON
  // clauses upon.  There is also a lookup for finding an available column
  // by alias, unescaped in <table-alias>.<column-name> form.
  this._availableCols       = [];
  this._availableColsLookup = {};
  this._makeColumnsAvailable(this._tables[0].table, this._tables[0].alias);

  // These are for parsing/lexing/compiling conditions.
  this._condParser   = new ConditionParser();
  this._condLexer    = new ConditionLexer();
  this._condCompiler = new ConditionCompiler();

  // This is the query's where clause.
  this._where = null;
}

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
 * Private helper function to put all columns in table in the _availableCols
 * array.
 * @param table The table from which all columns will be added.
 * @param tableAlias The table's alias (what is selected AS).
 */
From.prototype._makeColumnsAvailable = function(table, tableAlias)
{
  table.getColumns().forEach(function(col)
  {
    var colAlias = this.createColumnAlias(tableAlias, col.getName());

    this._availableCols.push
    ({
      table:      table,
      tableAlias: tableAlias,
      column:     col,
      colAlias:   this.createColumnAlias(tableAlias, col.getName())
    });

    this._availableColsLookup[colAlias] = this._availableCols[this._availableCols.length - 1];
  }.bind(this));
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

  // Parse, lex, and compile the condition.
  tokens = this._condLexer.parse(cond);
  tree   = this._condParser.parse(tokens);

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
 * Get the SQL that represents the query.
 */
From.prototype.toString = function()
{
  var sql       = 'SELECT  ';
  var cols      = this._selectCols;
  var fromName  = escaper.escapeProperty(this._tables[0].table.getName());
  var fromAlias = escaper.escapeProperty(this._tables[0].alias);

  // No columns specified.  Get all columns.
  if (cols.length === 0)
  {
    cols = this._availableCols;
  }

  // Escape each column and add it to the query.
  sql += cols.map(function(col)
  {
    var colName  = escaper.escapeProperty(col.column.getName());
    var colAlias = escaper.escapeProperty(col.colAlias);
    var tblAlias = escaper.escapeProperty(col.tableAlias);

    return tblAlias + '.' + colName + ' AS ' + colAlias;
  }.bind(this)).join(', ');

  sql += '\n';

  // Add the FROM portion.
  sql += 'FROM    ' + fromName + ' AS ' + fromAlias;

  if (this._where !== null)
  {
    sql += '\n';
    sql += 'WHERE   ';
    sql += this._where;
  }

  return sql;
};

module.exports = From;

