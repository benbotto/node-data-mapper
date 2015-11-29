'use strict';

var assert            = require(__dirname + '/../util/assert');
var ConditionLexer    = require(__dirname + '/../query/ConditionLexer');
var ConditionParser   = require(__dirname + '/../query/ConditionParser');
var ConditionCompiler = require(__dirname + '/../query/ConditionCompiler');
var DataMapper        = require(__dirname + '/../DataMapper/DataMapper');
var deferred          = require('deferred');

/**
 * Construct a new SELECT query.  FROM and JOINs must come first so that
 * selected columns can be found.
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
  this._database      = database;
  this._escaper       = escaper;
  this._queryExecuter = queryExecuter;

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

  // These are the columns that the user selected, with a lookup of
  // fully-qualified column name to column meta.
  this._selectCols      = [];
  this._selectColLookup = {};

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
 * the _tables array, and makes all the columns available in the _availableCols
 * array.
 * @param meta An object containing the following:
 * {
 *   table:  string,    // The name of the table to select from.
 *   as:     string,    // An alias for the table.  This is needed if, for example,
 *                      // the same table is joined in multiple times.  This is
 *                      // what the table will be serialized as, and defaults
 *                      // to the table's alias.
 *   cond:   Condition, // The condition (WHERE or ON) associated with the table.
 *   parent: string     // The alias of the parent table, if any.
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
    cond:       meta.cond   || null,
    joinType:   joinType    || null,
    parent:     meta.parent || null
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
  }.bind(this));

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
  var colAliasLookup = {};

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
      colAlias:   colAlias,
      fqColAlias: fqColAlias,
      fqColName:  fqColName
    };

    // Each alias must be unique.
    assert(colAliasLookup[fqColAlias] === undefined,
      'Column alias ' + fqColAlias + ' already selected.');
    colAliasLookup[fqColAlias] = true;

    // Each column can only be selected once.  This is only a constraint because
    // of the way that the primary key is found in execute.  If the primary key
    // of a table was selected twice, there would not be a way to serialize
    // the primary key correctly.
    assert(this._selectColLookup[fqColName] === undefined,
      'Column ' + fqColName + ' already selected.');
    
    // Column is unique - save it in the list of selected columns with a lookup.
    this._selectCols.push(selColMeta);
    this._selectColLookup[fqColName] = selColMeta;
  }.bind(this));

  // The primary key from each table must be selected.  The serialization
  // needs a way to uniquely identify each object; the primary key is used
  // for this.
  this._tables.forEach(function(tblMeta)
  {
    // This is the primary key of the table, which is an array.
    tblMeta.table.getPrimaryKey().forEach(function(pkPart)
    {
      // This is the alias of the column in the standard
      // <table-alias>.<column-name> format.
      var pkAlias = this.createFQColName(tblMeta.tableAlias, pkPart.getName());

      assert(this._selectColLookup[pkAlias] !== undefined,
        'The primary key of each table must be selected, but the primary key of table ' + 
        tblMeta.table.getName() +
        ' is not present in the array of selected columns.');
    }.bind(this));
  }.bind(this));

  return this;
};

/**
 * Select all columns.  This is the default if no columns are specified.  This
 * function gets called in execute and in toString if no columns are selected.
 */
From.prototype.selectAll = function()
{
  this.select(this._availableCols.map(function(col)
  {
    return col.fqColName;
  }));

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
 *   table:  string,    // The name of the table to select from.
 *   as:     string,    // An alias for the table.  This is needed if, for example,
 *                      // the same table is joined in multiple times.  This is
 *                      // what the table will be serialized as, and defaults
 *                      // to the table's alias.
 *   on:     Condition, // The condition (ON) for the join.
 *   parent: string     // The alias of the parent table, if any.
 * }
 * @param joinType The From.JOIN_TYPE of the join.
 */
From.prototype._join = function(meta, joinType)
{
  var tokens, tree, onCond;

  if (meta.on)
  {
    // Lex, parse, and compile the condition.
    tokens = this._condLexer.parse(meta.on);
    tree   = this._condParser.parse(tokens);
    onCond = this._condCompiler.compile(tree);
  }

  // Add the JOIN table.
  this._addTable({table: meta.table, as: meta.as, cond: onCond, parent: meta.parent}, joinType);

  // Make sure that each column used in the join is available (e.g. belongs to
  // one of the tables in the query).
  if (meta.on)
  {
    this._condCompiler.getColumns(tree).forEach(function(col)
    {
      assert(this.isColumnAvailable(col),
        'The column alias ' + col + ' is not available for an on condition.');
    }.bind(this));
  }

  return this;
};

/**
 * Inner join a table.
 * @param meta An object containing the following:
 * {
 *   table:  string,    // The name of the table to select from.
 *   as:     string,    // An alias for the table.  This is needed if, for example,
 *                      // the same table is joined in multiple times.  This is
 *                      // what the table will be serialized as, and defaults
 *                      // to the table's alias.
 *   on:     Condition, // The condition (ON) for the join.
 *   parent: string     // The alias of the parent table, if any.
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
  var sql  = 'SELECT  ';
  var cols = this._selectCols;
  var fromName, fromAlias, tblMeta, joinName, joinAlias;

  // No columns specified.  Get all columns.
  if (cols.length === 0)
    this.selectAll();

  // Escape each selected column and add it to the query.
  sql += cols.map(function(col)
  {
    var colName  = this._escaper.escapeProperty(col.column.getName());
    var colAlias = this._escaper.escapeProperty(col.fqColAlias);
    var tblAlias = this._escaper.escapeProperty(col.tableAlias);

    return tblAlias + '.' + colName + ' AS ' + colAlias;
  }.bind(this)).join(', ');

  // Add the FROM portion.
  fromName  = this._escaper.escapeProperty(this._tables[0].table.getName());
  fromAlias = this._escaper.escapeProperty(this._tables[0].tableAlias);
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

/**
 * Execute the query.
 * @param Schema An optional Schema implementation (constructor).
 */
From.prototype.execute = function(Schema)
{
  var schemata     = {};
  var schemaLookup = {};
  var defer        = deferred();

  // No columns specified.  Get all columns.
  if (this._selectCols.length === 0)
    this.selectAll();

  Schema = Schema || require(__dirname + '/../DataMapper/Schema');

  // The primary key for each table is needed to create each schema.  Find
  // each primary key and create the schema.
  this._tables.forEach(function(tblMeta)
  {
    var pk = tblMeta.table.getPrimaryKey();
    var fqColName, colMeta, schema;

    // TODO: Composite keys are not yet implemented.
    assert(pk.length === 1, 'Composite keys are not currently supported.');

    // Create the schema.  In the query, the PK column name will be the fully-qualified
    // column alias.  The serialized property should be the column alias.
    fqColName = this.createFQColName(tblMeta.tableAlias, pk[0].getName());
    colMeta   = this._selectColLookup[fqColName];
    schema    = new Schema(colMeta.fqColAlias, colMeta.colAlias);

    // Keep a lookup of table alias->schema.
    schemaLookup[tblMeta.tableAlias] = schema;
    
    // If this table has no parent then the schema is top level.  Else
    // this is a sub schema, and the parent is guaranteed to be present in
    // the lookup.
    if (tblMeta.parent === null)
      schemata[tblMeta.tableAlias] = schema;
    else
      schemaLookup[tblMeta.parent].addSchema(tblMeta.tableAlias, schema);
  }.bind(this));

  // Add each column/property to its schema.
  this._selectCols.forEach(function(colMeta)
  {
    // PK already present.
    if (!colMeta.column.isPrimary())
      schemaLookup[colMeta.tableAlias].addProperty(colMeta.fqColAlias, colMeta.colAlias);
  });

  // Execute the query.
  this._queryExecuter.select(this.toString(), function(err, result)
  {
    if (err)
      defer.reject(err);
    else
    {
      var serialized = {};
      var dm         = new DataMapper();

      for (var tblAlias in schemata)
        serialized[tblAlias] = dm.serialize(result, schemata[tblAlias]);

      defer.resolve(serialized);
    }
  });

  // A promise is returned.  It will be resolved with the serialized results.
  return defer.promise;
};

module.exports = From;
