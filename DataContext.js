'use strict';

var From = require('./query/From.js');

/**
 * The main interface to the ORM.  This class is expected to be extended by the
 * user (or created as a singleton).
 * @param database 
 */
function DataContext(database)
{
  this._database = database;
}

/**
 * Get the database.
 */
DataContext.prototype.getDatabase = function()
{
  return this._database;
};

/**
 * Create a new SELECT query.
 * @param tableName The table to select from, by name, not by alias.
 */
DataContext.prototype.from = function(table)
{
  return new From(this.getDatabase(), table);
};

module.exports = DataContext;

