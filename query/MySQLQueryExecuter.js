'use strict';

/**
 * A query executer for MySQL.
 * @param pool A node-mysql connection pool instance (or a single connection).
 *        It is the user's responsibility to end the pool when the application
 *        closes.
 */
function MySQLQueryExecuter(pool)
{
  this._pool = pool;
}

/**
 * Get the connection pool.
 */
MySQLQueryExecuter.prototype.getConnectionPool = function()
{
  return this._pool;
};

/**
 * Execute a select MySQLQuery.
 * @param query The SQL to execute.  The query is expected to be escaped.
 * @param callback The callback function that is called when the query is executed.
 *        function callback(err, results)
 *        The results are an array, one entry per row, of objects that are
 *        pairs of column->value.
 */
MySQLQueryExecuter.prototype.select = function(query, callback)
{
  this._pool.query(query, callback);
};

/**
 * Execute an insert query.
 * @param query The SQL to execute.  The query is expected to be escaped.
 * @param callback The callback function that is called when the query is executed.
 *        function callback(err, result)
 *        If available, the result object shall have an insertId property.
 */
MySQLQueryExecuter.prototype.insert = function(query, callback)
{
  this._pool.query(query, callback);
};

/**
 * Execute a delete query.
 * @param query The SQL to execute.  The query is expected to be escaped.
 * @param callback The callback function that is called when the query is executed.
 *        function callback(err, result)
 *        result shall have an affectedRows property.
 */
MySQLQueryExecuter.prototype.delete = function(query, callback)
{
  this._pool.query(query, callback);
};

module.exports = MySQLQueryExecuter;

