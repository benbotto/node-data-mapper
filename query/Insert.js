'use strict';

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
  this._database      = database;
  this._escaper       = escaper;
  this._queryExecuter = queryExecuter;
  this._model         = model;
}

module.exports = Insert;

