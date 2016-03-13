'use strict';

var FromAdapter = require('../query/FromAdapter.js');
var Insert      = require('../query/Insert.js');
var Delete      = require('../query/Delete.js');

/**
 * The main interface to the ORM.  This class is expected to be extended by the
 * user (or created as a singleton).
 * @param database An instance of a Database.
 * @param escaper An instance of Escaper matching the database type (i.e.
 *        MySQLEscaper or MSSQLEscaper).
 * @param queryExecuter A QueryExecuter instance (i.e. a MySQLQueryExecuter).
 */
function DataContext(database, escaper, queryExecuter)
{
  this._database      = database;
  this._escaper       = escaper;
  this._queryExecuter = queryExecuter;
}

/**
 * Get the database.
 */
DataContext.prototype.getDatabase = function()
{
  return this._database;
};

/**
 * Get the escaper instance.
 */
DataContext.prototype.getEscaper = function()
{
  return this._escaper;
};

/**
 * Get the query executer instance.
 */
DataContext.prototype.getQueryExecuter = function()
{
  return this._queryExecuter;
};

/**
 * Create a new FROM portion of a query, which can then be used to SELECT
 * or DELETE.
 * @param meta A meta object describing the table to select from.  See the From
 *        constructor for details.
 * @param database An optional Database instance.  If passed, this parameter
 *        is used instead of the Database that's provided to the ctor.
 */
DataContext.prototype.from = function(meta, database)
{
  database = database || this.getDatabase();
  return new FromAdapter(database, this._escaper, meta, this._queryExecuter);
};

/**
 * Create a new INSERT query.
 * @param model A model object to insert.  Each key in the object should be a
 *        table alias.  The value associated with the key should be an object
 *        (or an array of objects) wherein each key corresponds to a column
 *        alias.
 * @param database An optional Database instance.  If passed, this parameter
 *        is used instead of the Database that's provided to the ctor.
 */
DataContext.prototype.insert = function(model, database)
{
  database = database || this.getDatabase();
  return new Insert(database, this._escaper, this._queryExecuter, model);
};

/**
 * Create a new DELETE query.
 * @param model A model object to delete.  Each key in the object should be a
 *        table alias.  The value associated with the key should be an object
 *        (or an array of objects) wherein each key corresponds to a column
 *        alias.  The primary key is required for each model.
 * @param database An optional Database instance.  If passed, this parameter
 *        is used instead of the Database that's provided to the ctor.
 */
DataContext.prototype.delete = function(model, database)
{
  database = database || this.getDatabase();
  return new Delete(database, this._escaper, this._queryExecuter, model);
};

module.exports = DataContext;

