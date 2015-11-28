'use strict';

/**
 * A base interface for QueryExecuters.
 */
function QueryExecuter()
{
}

/**
 * Execute a select query.
 */
QueryExecuter.prototype.select = function()
{
  throw new Error('QueryExecuter::select not implemented.');
};

/**
 * Execute an update query.
 */
QueryExecuter.prototype.update = function()
{
  throw new Error('QueryExecuter::update not implemented.');
};

/**
 * Execute a delete query.
 */
QueryExecuter.prototype.delete = function()
{
  throw new Error('QueryExecuter::delete not implemented.');
};

/**
 * Execute an insert query.
 */
QueryExecuter.prototype.insert = function()
{
  throw new Error('QueryExecuter::insert not implemented.');
};

module.exports = QueryExecuter;

