'use strict';

var assert     = require('../util/assert');
var DataMapper = require('../datamapper/DataMapper');
var Query      = require('./Query');
var deferred   = require('deferred');

/**
 * Construct a new SELECT query.  FROM and JOINs must come first so that
 * selected columns can be found.
 * @param from An instance of a From.
 */
function Select(from)
{
  Query.call(this, from.getDatabase(), from.getEscaper(), from.getQueryExecuter());

  this._from = from;

  // These are the columns that the user selected, with a lookup of
  // fully-qualified column name to column meta.
  this._selectCols      = [];
  this._selectColLookup = {};

  // The order of the query.
  this._orderBy = [];
}

// Select extends Query.
//Select.prototype = Object.create(Query.prototype);
//Select.prototype.constructor = Query;

/**
 * Select columns manually.  This function is variadic.
 * @param cols An optional array of columns to select.  Each column can either
 *        be a string in the form <table-alias>.<column-name>, or it can be an
 *        object in the following form:
 * {
 *   column:   string,  // The fully-qualified column name in the
 *                      // form: <table-alias>.<column-name>
 *   as:       string,  // An alias for the column, used for serialization.
 *                      // If not provided this defaults to the column's alias.
 *   convert:  function // An optional function that takes the column value
 *                      // and transforms it.
 * }
 *         If no columns are specified, then all columns are selected.
 */
Select.prototype.select = function(cols)
{
  var colAliasLookup = {};
  var selTables      = {};
  var tblAlias, tblMeta, i, pkAlias;

  // Select may only be performed once on a query.
  assert(this._selectCols.length === 0, 'select already performed on query.');

  // Make sure cols is an array.
  if (!(cols instanceof Array))
    cols = Array.prototype.slice.call(arguments);

  // If no columns are provided, select all.
  if (cols.length === 0)
    return this.selectAll();

  cols.forEach(function(userSelColMeta)
  {
    var fqColName, colAlias, fqColAlias, availColMeta, selColMeta, convert;

    // Each column is an object, but can be short-handed as a string.  If a
    // a string is passed convert it to object format.
    if (typeof userSelColMeta === 'string')
      userSelColMeta = {column: userSelColMeta};

    // Make sure the column is legal for selection.
    fqColName = userSelColMeta.column;
    assert(this._from.isColumnAvailable(fqColName),
      'The column name ' + fqColName + ' is not available for selection.  ' +
      'Column names must be fully-qualified (<table-alias>.<column-name>).');

    // Store the necessary meta data about the column selection.
    // This is what's needed for converting the query to a string, and
    // for serialization.
    availColMeta = this._from._availableColsLookup[fqColName];
    colAlias     = userSelColMeta.as || availColMeta.column.getAlias();
    fqColAlias   = this._from.createFQColName(availColMeta.tableAlias, colAlias);
    convert      = userSelColMeta.convert || availColMeta.column.getConverter().onRetrieve;

    selColMeta = 
    {
      tableAlias: availColMeta.tableAlias,
      column:     availColMeta.column,
      colAlias:   colAlias,
      fqColAlias: fqColAlias,
      fqColName:  fqColName,
      convert:    convert
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

    // Store the list of tables that were selected from.
    selTables[availColMeta.tableAlias] = true;
  }, this);

  // The primary key from each table must be selected.  The serialization
  // needs a way to uniquely identify each object; the primary key is used
  // for this.
  for (tblAlias in selTables)
  {
    tblMeta = this._from._tableAliasLookup[tblAlias];

    // This is the primary key of the table, which is an array.
    for (i = 0; i < tblMeta.table.getPrimaryKey().length; ++i)
    {
      // This is the alias of the column in the standard
      // <table-alias>.<column-name> format.
      pkAlias = this._from.createFQColName(tblMeta.tableAlias, tblMeta.table.getPrimaryKey()[i].getName());

      assert(this._selectColLookup[pkAlias] !== undefined,
        'If a column is selected from a table, then the primary key ' +
        'from that table must also be selected.  The primary key of table ' +
        tblMeta.tableAlias +
        ' is not present in the array of selected columns.');
    }
  }

  // The primary key from the from table is also required.
  assert(selTables[this._from._tables[0].tableAlias], 'The primary key of the from table is required.');

  return this;
};

/**
 * Select all columns.  This is the default if no columns are specified.  This
 * function gets called in execute and in toString if no columns are selected.
 */
Select.prototype.selectAll = function()
{
  this.select(this._from._availableCols.map(function(col)
  {
    return col.fqColName;
  }));

  return this;
};

/**
 * Order by one or more columns.  This function is variadic and can either
 * take an array or multiple arguments.
 * @param metas An array of fully-qualified column names in the form:
 *        <table-alias>.<column-name>, or an array of objects with the following
 *        properties.
 * {
 *   column: string, // The fully-qualified column name in the
 *                   // form: <table-alias>.<column-name>
 *   dir:    string  // The sort direction: either "ASC" or "DESC."  Defaults to "ASC."
 * }
 */
Select.prototype.orderBy = function(metas)
{
  // orderBy may only be called once.
  assert(this._orderBy.length === 0, 'orderBy already performed on query.');

  // Make sure metas is an array.
  if (!(metas instanceof Array))
    metas = Array.prototype.slice.call(arguments);

  metas.forEach(function(meta)
  {
    var col, tblAlias, colName;

    if (typeof meta === 'string')
      meta = {column: meta};

    if (!meta.dir)
      meta.dir = 'ASC';

    assert(meta.column, 'orderBy column is required.');
    assert(meta.dir === 'ASC' || meta.dir === 'DESC',
      'dir must be either "ASC" or "DESC."');

    // Make sure the column is available for ordering.
    col = this._from._availableColsLookup[meta.column];
    assert(col, '"' + meta.column + '" is not available for orderBy.');

    // The order by is in the format `<table-alias>`.`<column-name>`.
    tblAlias = this._escaper.escapeProperty(col.tableAlias);
    colName  = this._escaper.escapeProperty(col.column.getName());

    this._orderBy.push(tblAlias + '.' + colName + ' ' + meta.dir);
  }, this);

  return this;
};

/**
 * Get the SQL that represents the query.
 */
Select.prototype.toString = function()
{
  var sql  = 'SELECT  ';
  var cols = this._selectCols;

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
  }, this).join(', ');

  // Add the FROM (which includes the JOINS and WHERE).
  sql += '\n';
  sql += this._from.toString();

  // Add the order.
  if (this._orderBy.length !== 0)
  {
    sql += '\n';
    sql += 'ORDER BY ';
    sql += this._orderBy.join(', ');
  }

  return sql;
};

/**
 * Execute the query.
 * @param Schema An optional Schema implementation (constructor).
 */
Select.prototype.execute = function(Schema)
{
  var schemata     = {};
  var schemaLookup = {};
  var defer        = deferred();

  // No columns specified.  Get all columns.
  if (this._selectCols.length === 0)
    this.selectAll();

  Schema = Schema || require('../datamapper/Schema');

  // The primary key for each table is needed to create each schema.  Find
  // each primary key and create the schema.
  this._from._tables.forEach(function(tblMeta)
  {
    var pk = tblMeta.table.getPrimaryKey();
    var fqColName, colMeta, schema;

    // TODO: Composite keys are not yet implemented.
    assert(pk.length === 1, 'Composite keys are not currently supported.');

    // Create the schema.  In the query, the PK column name will be the fully-qualified
    // column alias.  The serialized property should be the column alias.
    fqColName = this._from.createFQColName(tblMeta.tableAlias, pk[0].getName());
    colMeta   = this._selectColLookup[fqColName];

    // The table might not be included (that is, no columns from the table are
    // selected).
    if (colMeta !== undefined)
    {
      schema = new Schema(colMeta.fqColAlias, colMeta.colAlias, colMeta.convert);

      // Keep a lookup of table alias->schema.
      schemaLookup[tblMeta.tableAlias] = schema;
      
      // If this table has no parent then the schema is top level.  Else
      // this is a sub schema, and the parent is guaranteed to be present in
      // the lookup.
      if (tblMeta.parent === null)
        schemata[tblMeta.tableAlias] = schema;
      else
        schemaLookup[tblMeta.parent].addSchema(tblMeta.tableAlias, schema, tblMeta.relType);
    }
  }, this);

  // Add each column/property to its schema.
  this._selectCols.forEach(function(colMeta)
  {
    // PK already present.
    if (!colMeta.column.isPrimary())
    {
      schemaLookup[colMeta.tableAlias].addProperty(
        colMeta.fqColAlias, colMeta.colAlias, colMeta.convert);
    }
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

module.exports = Select;

