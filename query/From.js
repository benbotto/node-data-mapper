'use strict';

var assert            = require('../util/assert');
var ConditionLexer    = require('../query/ConditionLexer');
var ConditionParser   = require('../query/ConditionParser');
var ConditionCompiler = require('../query/ConditionCompiler');
var Query             = require('./Query');

/**
 * Construct a FROM, which can be used with a SELECT or DELETE query.
 * Conditions (WHERE) can be applied to FROMs, as can JOINs.
 * @param database The database to select from.
 * @param escaper An instance of an Escaper matching the database type (i.e.
 *        MySQLEscaper or MSSQLEscaper).
 * @param queryExecuter A QueryExecuter instance that implements the
 *        select method.
 * @param meta Either the name of the table or a meta object describing the table:
 * {
 *   table:  string, // The name of the table to select from.
 *   as:     string  // An alias for the table.  This is needed if, for example,
 *                   // the same table is joined in multiple times.
 *                   // This defaults to the table's alias.
 * }
 */
function From(database, escaper, queryExecuter, meta)
{
  Query.call(this, database, escaper, queryExecuter);

  // These are the tables that are being queried due to FROM our JOINs.  There
  // is also a lookup of alias->table.
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

// From extends Query.
From.prototype = Object.create(Query.prototype);
From.prototype.constructor = Query;

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
 * the _tables array, and makes all the columns available in the _availableCols
 * array.
 * @param meta An object containing the following:
 * {
 *   table:   string,    // The name of the table to select from.
 *   as:      string,    // An alias for the table.  This is needed if, for example,
 *                       // the same table is joined in multiple times.  This is
 *                       // what the table will be serialized as, and defaults
 *                       // to the table's alias.
 *   cond:    Condition, // The condition (WHERE or ON) associated with the table.
 *   parent:  string     // The alias of the parent table, if any.
 *   relType: string     // The type of relationship between the parent and this
 *                       // table ("single" or "many").  If set to "single" the
 *                       // table will be serialized into an object, otherwise
 *                       // the table will be serialized into an array.  "many"
 *                       // is the default.
 * }
 * @param joinType The type of join for the table, or null if this is the
 *        FROM table.
 */
From.prototype._addTable = function(meta, joinType)
{
  var table, tableAlias, parent, tableMeta;

  // The table name is required.
  assert(meta.table !== undefined, 'table is required.');

  // The name looks good - pull the table and set up the alias.
  table      = this._database.getTableByName(meta.table);
  tableAlias = meta.as || table.getAlias();

  // Aliases must be word characters.  They can't, for example, contain periods.
  assert(tableAlias.match(/^\w+$/) !== null, 'Alises must only contain word characters.');

  // If a parent is specified, make sure it is a valid alias.
  parent = meta.parent || null;

  if (parent !== null)
  {
    assert(this._tableAliasLookup[parent] !== undefined,
      'Parent table alias ' + parent + ' is not a valid table alias.');
  }

  // Add the table to the list of tables.
  tableMeta =
  {
    tableAlias: tableAlias,
    table:      table,
    cond:       meta.cond    || null,
    joinType:   joinType     || null,
    parent:     meta.parent  || null,
    relType:    meta.relType
  };
  this._tables.push(tableMeta);
  this._tableAliasLookup[tableAlias] = tableMeta;

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
  }, this);

  return this;
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
 * Add a where condition.
 * @param cond The condition object.  For the format look at @ref ConditionCompiler.
 * @param params An object of key-value pairs that are used to replace
 *        values in the query.
 */
From.prototype.where = function(cond, params)
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

  this._tables[0].cond = this._condCompiler.compile(tree, params);
  return this;
};

/**
 * Join a table.
 * @param meta An object containing the following:
 * {
 *   table:    string,    // The name of the table to select from.
 *   as:       string,    // An alias for the table.  This is needed if, for example,
 *                        // the same table is joined in multiple times.  This is
 *                        // what the table will be serialized as, and defaults
 *                        // to the table's alias.
 *   on:       Condition, // The condition (ON) for the join.
 *   parent:   string,    // The alias of the parent table, if any.
 *   relType:  string     // The type of relationship between the parent and this
 *                        // table ("single" or "many").  If set to "single" the
 *                        // table will be serialized into an object, otherwise
 *                        // the table will be serialized into an array.  "many"
 *                        // is the default.
 * }
 * @param params An object of key-value pairs that are used to replace
 *        values in the query.
 * @param joinType The From.JOIN_TYPE of the join.
 */
From.prototype._join = function(meta, params, joinType)
{
  var tokens, tree, onCond;

  if (meta.on)
  {
    // Lex, parse, and compile the condition.
    tokens = this._condLexer.parse(meta.on);
    tree   = this._condParser.parse(tokens);
    onCond = this._condCompiler.compile(tree, params);
  }

  // Add the JOIN table.
  this._addTable({table: meta.table, as: meta.as, cond: onCond, parent: meta.parent, relType: meta.relType}, joinType);

  // Make sure that each column used in the join is available (e.g. belongs to
  // one of the tables in the query).
  if (meta.on)
  {
    this._condCompiler.getColumns(tree).forEach(function(col)
    {
      assert(this.isColumnAvailable(col),
        'The column alias ' + col + ' is not available for an on condition.');
    }, this);
  }

  return this;
};

/**
 * Inner join a table.
 * @param meta An object containing the following:
 * {
 *   table:   string,    // The name of the table to select from.
 *   as:      string,    // An alias for the table.  This is needed if, for example,
 *                       // the same table is joined in multiple times.  This is
 *                       // what the table will be serialized as, and defaults
 *                       // to the table's alias.
 *   on:      Condition, // The condition (ON) for the join.
 *   parent:  string,    // The alias of the parent table, if any.
 *   relType: string     // The type of relationship between the parent and this
 *                       // table ("single" or "many").  If set to "single" the
 *                       // table will be serialized into an object, otherwise
 *                       // the table will be serialized into an array.  "many"
 *                       // is the default.
 * }
 * @param params An object of key-value pairs that are used to replace
 *        values in the query.
 */
From.prototype.innerJoin = function(meta, params)
{
  return this._join(meta, params, From.JOIN_TYPE.INNER);
};

/**
 * Left outer join a table.
 * @param meta Refer to the innerJoin function for details.
 * @param params An object of key-value pairs that are used to replace
 *        values in the query.
 */
From.prototype.leftOuterJoin = function(meta, params)
{
  return this._join(meta, params, From.JOIN_TYPE.LEFT_OUTER);
};

/**
 * Right outer join a table.
 * @param meta Refer to the innerJoin function for details.
 * @param params An object of key-value pairs that are used to replace
 *        values in the query.
 */
From.prototype.rightOuterJoin = function(meta, params)
{
  return this._join(meta, params, From.JOIN_TYPE.RIGHT_OUTER);
};

/**
 * Get the FROM portion of the query string.
 */
From.prototype.getFromString = function()
{
  var fromName  = this._escaper.escapeProperty(this._tables[0].table.getName());
  var fromAlias = this._escaper.escapeProperty(this._tables[0].tableAlias);

  return 'FROM    ' + fromName + ' AS ' + fromAlias;
};

/**
 * Get the JOIN parts of the query string.
 */
From.prototype.getJoinString = function()
{
  var joins = [], sql, tblMeta, joinName, joinAlias;

  // Add any JOINs.  The first table is the FROM table, hence the loop starts
  // at 1.
  for (var i = 1; i < this._tables.length; ++i)
  {
    tblMeta   = this._tables[i];
    joinName  = this._escaper.escapeProperty(tblMeta.table.getName());
    joinAlias = this._escaper.escapeProperty(tblMeta.tableAlias);

    sql = tblMeta.joinType + ' ' + joinName + ' AS ' + joinAlias;
    
    if (tblMeta.cond)
      sql += ' ON ' + tblMeta.cond;
    joins.push(sql);
  }

  return joins.join('\n');
};

/**
 * Get the WHERE portion of the query string.
 */
From.prototype.getWhereString = function()
{
  return this._tables[0].cond ? 'WHERE   ' + this._tables[0].cond : '';
};

/**
 * Get the SQL that represents the query.
 */
From.prototype.toString = function()
{
  var from  = this.getFromString();
  var joins = this.getJoinString();
  var where = this.getWhereString();

  var sql = from;

  if (joins)
    sql += '\n' + joins;

  if (where)
    sql += '\n' + where;

  return sql;
};

module.exports = From;

