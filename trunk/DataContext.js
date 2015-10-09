'use strict';

var From = require('./query/From.js');

/**
 * The main interface to the ORM.  This class is expected to be extended by the
 * user (or created as a singleton).
 * @param database The database to utilize.
 * @param escaper An instance of Escaper matching the database type (i.e.
 *        MySQLEscaper or MSSQLEscaper).
 */
function DataContext(database, escaper)
{
  this._database = database;
  this._escaper  = escaper;
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
 * Create a new SELECT query.
 * @param tableName The table to select from, by name, not by alias.
 */
DataContext.prototype.from = function(table)
{
  return new From(this.getDatabase(), this._escaper, table);
};

module.exports = DataContext;

