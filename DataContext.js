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
 * @param meta A meta object describing the table to select from.  Se the From
 *        constructor for details.
 */
DataContext.prototype.from = function(meta)
{
  return new From(this.getDatabase(), this._escaper, meta);
};

module.exports = DataContext;

