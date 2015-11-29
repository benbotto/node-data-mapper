
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
 *        The results are an array, one entry per row, of objects
 *        that are pairs of column->value.
 */
MySQLQueryExecuter.prototype.select = function(query, callback)
{
  this._pool.query(query, callback);
};

/**
 * Execute an update MySQLQuery.
 */
MySQLQueryExecuter.prototype.update = function()
{
  throw new Error('MySQLQueryExecuter::update not implemented.');
};

/**
 * Execute a delete MySQLQuery.
 */
MySQLQueryExecuter.prototype.delete = function()
{
  throw new Error('MySQLQueryExecuter::delete not implemented.');
};

/**
 * Execute an insert MySQLQuery.
 */
MySQLQueryExecuter.prototype.insert = function()
{
  throw new Error('MySQLQueryExecuter::insert not implemented.');
};

module.exports = MySQLQueryExecuter;

