'use strict';

var Query = require('./Query');

/**
 * Construct a new DELET query.
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
function Delete(database, escaper, queryExecuter, model)
{
  Query.call(this, database, escaper, queryExecuter);

  this._model = model;
}

// Delete extends Query.
Delete.prototype = Object.create(Query.prototype);
Delete.prototype.constructor = Query;

module.exports = Delete;

