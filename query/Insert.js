'use strict';

var assert = require('../util/assert');
//var deferred = require('deferred');
var MetaBuilder = require('./MetaBuilder');
var traverse    = require('./modelTraverse');

/**
 * Construct a new INSERT query.
 * @param database The database to insert into.
 * @param escaper An instance of an Escaper matching the database type (i.e.
 *        MySQLEscaper or MSSQLEscaper).
 * @param queryExecuter A QueryExecuter instance that implements the
 *        insert method.
 * @param model A model object to insert.  Each key in the object should be a
 *        table alias.  The value associated with the key should be an object
 *        (or an array of objects) wherein each key corresponds to a column
 *        alias.
 * @param recurseType One of 'none', 'depth-first', or 'breadth-first'.  How
 *        to traverse into sub models.
 */
function Insert(database, escaper, queryExecuter, model, recurseType)
{
  this._database      = database;
  this._escaper       = escaper;
  this._queryExecuter = queryExecuter;
  this._model         = model;
  this._recurseType   = recurseType || 'none';

  assert(this._recurseType === 'none'   ||
    this._recurseType === 'depth-first' ||
    this._recurseType === 'breadth-first',
    'Invalid recurseType.');
}

/**
 * Get the database instance.
 */
Insert.prototype.getDatabase = function()
{
  return this._database;
};

/**
 * Private helper to build an INSERT query.
 * @param modelMeta A meta object with comes from a modelTraverse method.
 */
Insert.prototype._buildQuery = function(modelMeta)
{
  var meta = new MetaBuilder().buildMeta(this._database, modelMeta.tableAlias, modelMeta.model);
  var sql, pTable, cTable, pPK;

  sql  = 'INSERT INTO ';
  sql += this._escaper.escapeProperty(meta.tableName);
  sql += ' (';
  sql += meta.fields.map(function(field)
  {
    return this._escaper.escapeProperty(field.columnName);
  }.bind(this)).join(', ');

  // If this model is the child of some other model, add the
  // parent model's primary key (if possible).
  if (modelMeta.parent)
  {
    // References to the parent and child tables.
    pTable = this._database.getTableByAlias(modelMeta.parent.tableAlias);
    cTable = this._database.getTableByAlias(modelMeta.tableAlias);

    // The primary key from the parent table.
    // TODO: Composite primary keys not supported.
    pPK = pTable.getPrimaryKey();
    assert(pPK.length === 1, 'Composite primary keys not implemented.');
    pPK = pPK[0];

    // If the primary key of the parent table matches a column name in the
    // child table.
    if (cTable.isColumnName(pPK.getName()))
      sql += ', ' + this._escaper.escapeProperty(pPK.getName());
  }

  sql += ')\n';
  sql += 'VALUES (';
  sql += meta.fields.map(function(field)
  {
    return this._escaper.escapeLiteral(field.value);
  }.bind(this)).join(', ');

  if (modelMeta.parent)
  {
    if (cTable.isColumnName(pPK.getName()))
      sql += ', :' + pPK.getName();
  }

  sql += ')';

  return sql;
};

/**
 * Private helper to build an array of INSERT queries.
 */
Insert.prototype._buildQueries = function()
{
  var queries = [];
  var self    = this;

  function addQuery(modelMeta)
  {
    queries.push(self._buildQuery(modelMeta));
  }

  if (this._recurseType === 'none')
    traverse.modelOnly(this._model, addQuery, this._database);
  else if (this._recurseType === 'depth-first')
    console.log('temp');
  else if (this._recurseType === 'breadth-first')
    traverse.breadthFirst(this._model, addQuery, this._database);

  return queries;
};

/**
 * Create the SQL string.
 */
Insert.prototype.toString = function()
{
  return this._buildQueries().join(';\n\n');
};

/**
 * Execute the query.
 */
Insert.prototype.execute = function()
{
  /*var queries = this._buildQueries();
  var defer   = deferred();

  // Process the first query in the queries queue.
  function processQuery()
  {
    if (queries.length === 0)
    {
      defer.resolve(this._model);
      return;
    }

    this._queryExecuter.insert(queries.shift(), queryResult);
  }

  // Handle a query result.
  function queryResult(err, result)
  {
    if (err)
    {
      defer.reject(err);
      return;
    }

    console.log(result);
  }

  // A promise is returned.  It will be resolved with the updated models.
  return defer.promise;*/
};

module.exports = Insert;

