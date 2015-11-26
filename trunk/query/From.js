'use strict';

var assert            = require(__dirname + '/../assert');
var ConditionLexer    = require(__dirname + '/../query/ConditionLexer');
var ConditionParser   = require(__dirname + '/../query/ConditionParser');
var ConditionCompiler = require(__dirname + '/../query/ConditionCompiler');

/**
 * Construct a new SELECT query.  FROM and JOINs must come first so that
 * selected columns can be found.
 * @param database The database to select from.
 * @param escaper An instance of Escaper matching the database type (i.e.
 *        MySQLEscaper or MSSQLEscaper).
 * @param meta Either the name of the table or a meta object describing the table:
 * {
 *   table:  string, // The name of the table to select from.
 *   as:     string  // An alias for the table.  This is needed if, for example,
 *                   // the same table is joined in multiple times.
 *                   // This defaults to the table's alias.
 * }
 */
function From(database, escaper, meta)
{
  this._database   = database;
  this._escaper    = escaper;
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

  // Add the FROM table.  
  if (typeof meta === 'string')
    this._addTable({table: meta});
  else
    this._addTable(meta);

  // These are for building conditions (WHERE and ON conditions).
  this._condLexer    = new ConditionLexer();
  this._condParser   = new ConditionParser();
  this._condCompiler = new ConditionCompiler(this._escaper);
}

From.JOIN_TYPE =
{
  INNER:       'INNER JOIN',
  LEFT_OUTER:  'LEFT OUTER JOIN',
  RIGHT_OUTER: 'RIGHT OUTER JOIN'
};

/**
 * Create a fully-qualified column name.
 * Column names must be unique, and the same column name could exist
 * multiple times (two tables could have the same column name, or the same
 * table could be joined multiple times).  Hence each column is aliased,
 * prefixed by the table alias.
 * Example: `user`.`name` AS `user.name`
 * @param tableAlias The alias for the table.
 * @param colName The column name.
 */
From.prototype.createFQColName = function(tableAlias, colName)
{
  return tableAlias + '.' + colName;
};

/**
 * Private helper function to add a table to the query.  This adds the table to
 * the _tables array, adds a lookup for the table in _tableAliasLookup, and
 * makes all the columns available in the _availableCols array.
 * @param meta An object containing the following:
 * {
 *   table:  string,   // The name of the table to select from.
 *   as:     string,   // An alias for the table.  This is needed if, for example,
 *                     // the same table is joined in multiple times.  This is
 *                     // what the table will be serialized as, and defaults
 *                     // to the table's alias.
 *   cond:   Condition // The condition (WHERE or ON) associated with the table.
 * }
 * @param joinType The type of join for the table, or null if this is the
 *        FROM table.
 */
From.prototype._addTable = function(meta, joinType)
{
  var tblMeta, table, tableAlias;

  // The table name is required.
  assert(meta.table !== undefined, 'table is required.');

  // The name looks good - pull the table and set up the alias.
  table      = this._database.getTableByName(meta.table);
  tableAlias = meta.as || table.getAlias();

  // Aliases must be word characters.  They can't, for example, contain periods.
  assert(tableAlias.match(/^\w+$/) !== null, 'Alises must only contain word characters.');

  tblMeta =
  {
    tableAlias: tableAlias,
    table:      table,
    cond:       meta.cond || null,
    joinType:   joinType  || null
  };

  // Add the table to the list of tables, and add a lookup of alias->table.
  this._tables.push(tblMeta);
  this._tableAliasLookup[tblMeta.tableAlias] = table;

  // Make each column available for selection or conditions.
  table.getColumns().forEach(function(col)
  {
    var fqColName = this.createFQColName(tableAlias, col.getName());

    this._availableCols.push
    ({
      tableAlias: tableAlias,
      column:     col,
      fqColName:  fqColName
    });

    this._availableColsLookup[fqColName] = this._availableCols[this._availableCols.length - 1];
  }.bind(this));

  return tblMeta;
};

/**
 * Check if the columns col is available (for selecting or for a condition).
 * @param fqColName The column to look for, by alias.  This is the unescaped
 *        alias of the column (<table-alias>.<column-name>) as created by the
 *        createFQColName function.
 */
From.prototype.isColumnAvailable = function(fqColName)
{
  return this._availableColsLookup[fqColName] !== undefined;
};

/**
 * Select columns manually.
 * @param cols An array of columns to select.  Each column can either be a
 *        string in the form <table-alias>.<column-name>, or it can be an
 *        object in the following form:
 * {
 *   column:   string, // The fully-qualified column name in the
 *                     // form: <table-alias>.<column-name>
 *   as:       string  // An alias for the column, used for serialization.
 *                     // If not provided this defaults to the column's alias.
 * }
 */
From.prototype.select = function(cols)
{
  var i, pk, pkAlias;
  var selColLookup    = {};
  var colAliasLookup  = {};

  // Select may only be performed once on a query.
  assert(this._selectCols.length === 0, 'select already performed on query.');

  // Make sure cols is an array.
  if (!(cols instanceof Array))
    cols = Array.prototype.slice.call(arguments);

  cols.forEach(function(userSelColMeta)
  {
    var fqColName, colAlias, fqColAlias, availColMeta, selColMeta;

    // Each column is an object, but can be short-handed as a string.  If a
    // a string is passed convert it to object format.
    if (typeof userSelColMeta === 'string')
      userSelColMeta = {column: userSelColMeta};

    // Make sure the column is legal for selection.
    fqColName = userSelColMeta.column;
    assert(this.isColumnAvailable(fqColName),
      'The column name ' + fqColName + ' is not available for selection.  ' +
      'Column names must be fully-qualified (<table-alias>.<column-name>).');

    // Store the necessary meta data about the column selection.
    // This is what's needed for converting the query to a string, and
    // for serialization.
    availColMeta = this._availableColsLookup[fqColName];
    colAlias     = userSelColMeta.as || availColMeta.column.getAlias();
    fqColAlias   = this.createFQColName(availColMeta.tableAlias, colAlias);

    selColMeta = 
    {
      tableAlias: availColMeta.tableAlias,
      column:     availColMeta.column,
      fqColAlias: fqColAlias
    };

    // Each alias must be unique.
    assert(colAliasLookup[fqColAlias] === undefined,
      'Column alias ' + fqColAlias + ' already selected.');
    colAliasLookup[fqColAlias] = true;
    
    this._selectCols.push(selColMeta);
    selColLookup[fqColName] = true;
  }.bind(this));

  // The primary key from each table must be selected.  The serialization
  // needs a way to uniquely identify each object; the primary key is used
  // for this.
  for (var tblAlias in this._tableAliasLookup)
  {
    // This is the primary key of the table, which is an array.
    pk = this._tableAliasLookup[tblAlias].getPrimaryKey();

    for (i = 0; i < pk.length; ++i)
    {
      // This is the alias of the column in the standard
      // <table-alias>.<column-name> format.
      pkAlias = this.createFQColName(tblAlias, pk[i].getName());

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

  assert(this._tables[0].cond === null, 'where already performed on query.');

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

  this._tables[0].cond = this._condCompiler.compile(tree);
  return this;
};

/**
 * Join a table.
 * @param meta An object containing the following:
 * {
 *   table:  string,   // The name of the table to select from.
 *   as:     string,   // An alias for the table.  This is needed if, for example,
 *                     // the same table is joined in multiple times.  This is
 *                     // what the table will be serialized as, and defaults
 *                     // to the table's alias.
 *   on:     Condition // The condition (ON) for the join.
 * }
 * @param joinType The From.JOIN_TYPE of the join.
 */
From.prototype._join = function(meta, joinType)
{
  var tokens, tree, onCond, columns;

  if (meta.on)
  {
    // Lex, parse, and compile the condition.
    tokens = this._condLexer.parse(meta.on);
    tree   = this._condParser.parse(tokens);
    onCond = this._condCompiler.compile(tree);
  }

  // Add the JOIN table.
  this._addTable({table: meta.table, as: meta.as, cond: onCond}, joinType);

  // Make sure that each column used in the join is available (e.g. belongs to
  // one of the tables in the query).
  if (meta.on)
  {
    columns  = this._condCompiler.getColumns(tree);
    for (var i = 0; i < columns.length; ++i)
    {
      assert(this.isColumnAvailable(columns[i]),
        'The column alias ' + columns[i] + ' is not available for an on condition.');
    }
  }

  return this;
};

/**
 * Inner join a table.
 * @param meta An object containing the following:
 * {
 *   table:  string,   // The name of the table to select from.
 *   as:     string,   // An alias for the table.  This is needed if, for example,
 *                     // the same table is joined in multiple times.  This is
 *                     // what the table will be serialized as, and defaults
 *                     // to the table's alias.
 *   on:     Condition // The condition (ON) for the join.
 * }
 */
From.prototype.innerJoin = function(meta)
{
  return this._join(meta, From.JOIN_TYPE.INNER);
};

/**
 * Left outer join a table.
 * @param meta Refer to the innerJoin function for details.
 */
From.prototype.leftOuterJoin = function(meta)
{
  return this._join(meta, From.JOIN_TYPE.LEFT_OUTER);
};

/**
 * Right outer join a table.
 * @param meta Refer to the innerJoin function for details.
 */
From.prototype.rightOuterJoin = function(meta)
{
  return this._join(meta, From.JOIN_TYPE.RIGHT_OUTER);
};

/**
 * Get the SQL that represents the query.
 */
From.prototype.toString = function()
{
  var sql       = 'SELECT  ';
  var cols      = this._selectCols;
  var fromName  = this._escaper.escapeProperty(this._tables[0].table.getName());
  var fromAlias = this._escaper.escapeProperty(this._tables[0].tableAlias);
  var tblMeta, joinName, joinAlias;

  // No columns specified.  Get all columns.
  if (cols.length === 0)
  {
    this.select(this._availableCols.map(function(col)
    {
      return col.fqColName;
    }));
  }

  // Escape each selected column and add it to the query.
  sql += cols.map(function(col)
  {
    var colName  = this._escaper.escapeProperty(col.column.getName());
    var colAlias = this._escaper.escapeProperty(col.fqColAlias);
    var tblAlias = this._escaper.escapeProperty(col.tableAlias);

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
    joinName  = this._escaper.escapeProperty(tblMeta.table.getName());
    joinAlias = this._escaper.escapeProperty(tblMeta.tableAlias);

    sql += '\n';
    sql += tblMeta.joinType + ' ' + joinName + ' AS ' + joinAlias;
    
    if (tblMeta.cond)
    {
      sql += ' ON ' + tblMeta.cond;
    }
  }

  if (this._tables[0].cond !== null)
  {
    sql += '\n';
    sql += 'WHERE   ';
    sql += this._tables[0].cond;
  }

  return sql;
};

module.exports = From;

