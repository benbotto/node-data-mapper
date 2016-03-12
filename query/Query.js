'use strict';

/**
 * Base class for queries (From, Insert, Delete, Update).
 * @param database The database to select from.
 * @param escaper An instance of an Escaper matching the database type (i.e.
 *        MySQLEscaper or MSSQLEscaper).
 * @param queryExecuter A QueryExecuter instance.
 */
function Query(database, escaper, queryExecuter)
{
  this._database      = database;
  this._escaper       = escaper;
  this._queryExecuter = queryExecuter;
}

/**
 * Get the database instance.
 */
Query.prototype.getDatabase = function()
{
  return this._database;
};

/**
 * Get the query escaper.
 */
Query.prototype.getEscaper = function()
{
  return this._escaper;
};

/**
 * Get the query executer.
 */
Query.prototype.getQueryExecuter = function()
{
  return this._queryExecuter;
};

module.exports = Query;

