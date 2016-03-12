'use strict';

var deferred    = require('deferred');
var MetaBuilder = require('./MetaBuilder');
var traverse    = require('./modelTraverse');
var Query       = require('./Query');

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
 */
function Insert(database, escaper, queryExecuter, model)
{
  Query.call(this, database, escaper, queryExecuter);

  this._model          = model;
  this._updateChildren = true;
}

// Insert extends Query.
Insert.prototype = Object.create(Query.prototype);
Insert.prototype.constructor = Query;

/**
 * Set whether or not to update the foreign keys of children after
 * a query is executed.  Defaults to true.
 * @param update A boolean that determines whether or not to update children.
 */
Insert.prototype.setUpdateChildKeys = function(update)
{
  this._updateChildren = update;
  return this;
};

/**
 * Private helper to build an INSERT query.
 * @param modelMeta A meta object with comes from a modelTraverse method.
 */
Insert.prototype._buildQuery = function(modelMeta)
{
  var meta = new MetaBuilder().buildMeta(this._database, modelMeta.tableAlias, modelMeta.model);
  var sql;

  sql  = 'INSERT INTO ';
  sql += this._escaper.escapeProperty(meta.tableName);
  sql += ' (';
  sql += meta.fields.map(function(field)
  {
    return this._escaper.escapeProperty(field.columnName);
  }, this).join(', ');
  sql += ')\n';

  sql += 'VALUES (';
  sql += meta.fields.map(function(field)
  {
    return this._escaper.escapeLiteral(field.value);
  }, this).join(', ');
  sql += ')';

  return sql;
};

/**
 * Create the SQL string.
 */
Insert.prototype.toString = function()
{
  var queries = [];

  traverse.modelOnly(this._model,
    (mm) => queries.push(this._buildQuery(mm)), this._database);

  return queries.join(';\n\n');
};

/**
 * Execute the query.
 */
Insert.prototype.execute = function()
{
  var defer     = deferred();
  var self      = this;
  var queryData = [];

  // Queue all the queries and model meta data.
  traverse.modelOnly(this._model, queueQueryData, this._database);
  function queueQueryData(modelMeta)
  {
    queryData.push
    ({
      modelMeta: modelMeta,
      query:     self._buildQuery(modelMeta)
    });
  }

  // The queryData are executed in order.  processQuery() grabs the first query
  // out of the queryData queue, executes it, and removes it from the array.
  // The result of the query is passed to processQueryResult(), which in
  // turn fires processQuery.  When the queue of queryData is empty, the
  // defered is resolved.
  // If an error occurs at any point, the deferred is rejected and processing
  // halts.
  processQuery();

  // Process the first query in the queryData queue.
  function processQuery()
  {
    var queryDatum;

    if (queryData.length === 0)
    {
      defer.resolve(self._model);
      return;
    }

    queryDatum = queryData.shift();
    self._queryExecuter.insert(queryDatum.query, function(err, result)
    {
      if (err)
      {
        defer.reject(err);
        return;
      }

      // If there is an auto-generated ID, set it on the model.
      if (result.insertId)
      {
        var table   = self._database.getTableByAlias(queryDatum.modelMeta.tableAlias);
        var pk      = table.getPrimaryKey();
        var pkAlias = pk[0].getAlias();

        queryDatum.modelMeta.model[pkAlias] = result.insertId;

        if (self._updateChildren)
        {
          // Update the related key on any children when possible.
          traverse.modelOnly(queryDatum.modelMeta.model, function(childModelMeta)
          {
            var childTable = self._database.getTableByAlias(childModelMeta.tableAlias);
            var pkName     = pk[0].getName();
            var childColAlias;

            // If the primary key of the inserted table is a valid column
            // name on the child table, set the insertId on the child.
            if (childTable.isColumnName(pkName))
            {
              childColAlias = childTable.getColumnByName(pkName).getAlias();
              childModelMeta.model[childColAlias] = result.insertId;
            }
          }, self._database);
        }
      }

      processQuery();
    });
  }

  // A promise is returned.  It will be resolved with the updated models.
  return defer.promise;
};

module.exports = Insert;

