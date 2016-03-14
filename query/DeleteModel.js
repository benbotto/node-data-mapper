'use strict';

var From     = require('./From');
var Delete   = require('./Delete');
var Query    = require('./Query');
var traverse = require('./modelTraverse');
var assert   = require('../util/assert');
var deferred = require('deferred');

/**
 * Construct a new DELETE query used to delete models by ID.
 * @param database The database to delete from.
 * @param escaper An instance of an Escaper matching the database type (i.e.
 *        MySQLEscaper or MSSQLEscaper).
 * @param queryExecuter A QueryExecuter instance that implements the
 *        delete method.
 * @param model A model object to delete.  Each key in the object should be a
 *        table alias.  The value associated with the key should be an object
 *        (or an array of objects) wherein each key corresponds to a column
 *        alias.  The primary key is required for each model.
 */
function DeleteModel(database, escaper, queryExecuter, model)
{
  Query.call(this, database, escaper, queryExecuter);

  this._model     = model;
  this._modelMeta = [];
  this._deletes   = [];

  traverse.modelOnly(this._model, (mm) => this._modelMeta.push(mm), this._database);

  // Make sure that the primary key is available on each model.
  this._modelMeta.forEach(function(meta)
  {
    var table = this._database.getTableByAlias(meta.tableAlias);
    var pk    = table.getPrimaryKey();
    var i, from, where, wherePart, fqColName, params;

    for (i = 0; i < pk.length; ++i)
    {
      assert(meta.model[pk[i].getAlias()],
        'Primary key not provided on model ' + meta.tableAlias + '.');
    }

    // Create a From instance to delete the model from.
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

    from.where(where, params);

    // Create a Delete instance for each model.
    this._deletes.push(new Delete(from));
  }, this);
}

// DeleteModel extends Query.
DeleteModel.prototype = Object.create(Query.prototype);
DeleteModel.prototype.constructor = Query;

/**
 * Create the delete SQL.
 */
DeleteModel.prototype.toString = function()
{
  return this._deletes.map(function(del)
  {
    return del.toString();
  }).join(';\n\n');
};

/**
 * Execute the query.
 */
DeleteModel.prototype.execute = function()
{
  var defer   = deferred();
  var res     = {affectedRows: 0};
  var queries = this._deletes.map((del) => del.toString());
  var self    = this;

  // Execute one query at a time.
  processQuery();
  function processQuery()
  {
    var query;

    if (queries.length === 0)
    {
      defer.resolve(res);
      return;
    }

    query = queries.shift();

    self._queryExecuter.delete(query, function(err, result)
    {
      if (err)
      {
        defer.reject(err);
        return;
      }
      // Keep track of the total affected rows.
      res.affectedRows += result.affectedRows;

      // Recursively process the next query.
      processQuery();
    });
  }

  return defer.promise;
};

module.exports = DeleteModel;

