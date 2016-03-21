'use strict';

var From     = require('./From');
var Query    = require('./Query');
var traverse = require('./modelTraverse');
var assert   = require('../util/assert');
var deferred = require('deferred');

/**
 * Base class for classes that mutate models by primary key (MutateModel and
 * UpdateModel).
 * @param database The database to mutate from.
 * @param escaper An instance of an Escaper matching the database type (i.e.
 *        MySQLEscaper or MSSQLEscaper).
 * @param queryExecuter A QueryExecuter instance that implements the
 *        mutate method.
 * @param model A model object to mutate.  Each key in the object should be a
 *        table alias.  The value associated with the key should be an object
 *        (or an array of objects) wherein each key corresponds to a column
 *        alias.  The primary key is required for each model.
 */
function MutateModel(database, escaper, queryExecuter, model)
{
  Query.call(this, database, escaper, queryExecuter);

  this._modelMeta = [];
  this._queries   = [];

  traverse.modelOnly(model, (mm) => this._modelMeta.push(mm), this._database);

  // Create a Query instance for each model.
  this._modelMeta.forEach((meta) =>
    this._queries.push(this.createQueryInstance(meta)));
}

// MutateModel extends Query.
MutateModel.prototype = Object.create(Query.prototype);
MutateModel.prototype.constructor = Query;

/**
 * Get the array of queries.
 */
MutateModel.prototype.getQueries = function()
{
  return this._queries;
};

/**
 * Create a Query instance.  Subclasses should implement this.
 * @param meta A meta object as created by the modelTraverse class.
 *        {
 *          tableAlias: <table-alias>,
 *          model:      <model>,
 *          parent:     <parent-model>
 *        }
 */
MutateModel.prototype.createQueryInstance = function(meta)
{
  var table = this._database.getTableByAlias(meta.tableAlias);
  var pk, i, from, where, wherePart, fqColName, params;

  // The primary key is required to be on the model.
  pk = table.getPrimaryKey();

  for (i = 0; i < pk.length; ++i)
  {
    assert(meta.model[pk[i].getAlias()],
      'Primary key not provided on model ' + meta.tableAlias + '.');
  }

  // Create a From instance for each mutation.
  // Each part of the PK is combined together in an AND'd WHERE condition.
  from   = new From(this._database, this._escaper, this._queryExecuter, table.getName());
  where  = {$and: []};
  params = {};

  for (i = 0; i < pk.length; ++i)
  {
    fqColName = from.createFQColName(table.getAlias(), pk[i].getName());
    wherePart = {$eq: {}};
    wherePart.$eq[fqColName] = ':' + fqColName;
    params[fqColName] = meta.model[pk[i].getAlias()];
    where.$and.push(wherePart);
  }

  return from.where(where, params);
};

/**
 * Create the SQL.
 */
MutateModel.prototype.toString = function()
{
  return this._queries.map(function(qry)
  {
    return qry.toString();
  }).join(';\n\n');
};

/**
 * Execute the query.
 */
MutateModel.prototype.execute = function()
{
  var defer = deferred();
  var res   = {affectedRows: 0};
  var self  = this;

  // Execute one query at a time.  (Self-executing function.)
  (function processQuery()
  {
    // No more queries in the queue.  Resolve the promise.
    if (self._queries.length === 0)
    {
      defer.resolve(res);
      return;
    }

    // Get the next query in the queue and execute it.
    self._queries
      .shift()
      .execute()
      .then(function(result)
      {
        // Keep track of the total affected rows.
        res.affectedRows += result.affectedRows;

        // Recursively process the next query.
        processQuery();
      })
      .catch(function(err)
      {
        defer.reject(err);
      });
  })();

  return defer.promise;
};

module.exports = MutateModel;

