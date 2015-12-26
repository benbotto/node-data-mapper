'use strict';

var assert = require('../util/assert');
var Table  = require('./Table');

/**
 * Class for representing a database.
 * @param database An object in the following format.
 * {
 *   name:   string,      // The name of the database.  Optional.
 *   tables: array<Table> // Optional.  An array of Tables (or objects suitable for
 *                        // the Table constructor).
 *                        // See the Table constructor for property details.
 * }
 */
function Database(database)
{
  this._name        = database.name || '';
  this._tables      = [];
  this._nameLookup  = {};
  this._aliasLookup = {};

  if (database.tables)
    database.tables.forEach(this.addTable.bind(this));
}

/**
 * Get the name of the database.
 */
Database.prototype.getName = function()
{
  return this._name;
};

/**
 * Get the array of tables.
 */
Database.prototype.getTables = function()
{
  return this._tables;
};

/**
 * Add a Table to the database.
 * @param table The new table, which must have a unique name.
 */
Database.prototype.addTable = function(table)
{
  if (!(table instanceof Table))
    table = new Table(table);

  assert(this._nameLookup[table.getName()] === undefined,
    'Table ' + table.getName() + ' already exists in database ' + this.getName() + '.');
  assert(this._aliasLookup[table.getAlias()] === undefined,
    'Table alias ' + table.getAlias() + ' already exists in database ' + this.getName() + '.');

  this._tables.push(table);
  this._nameLookup[table.getName()]   = table;
  this._aliasLookup[table.getAlias()] = table;

  return this;
};

/**
 * Get a table by name.
 * @param name The name of the table.
 */
Database.prototype.getTableByName = function(name)
{
  assert(this._nameLookup[name],
    'Table ' + name + ' does not exist in database ' + this.getName() + '.');

  return this._nameLookup[name];
};

/**
 * Check if name is a valid table name.
 * @param name The name of a table.
 */
Database.prototype.isTableName = function(name)
{
  return !!this._nameLookup[name];
};

/**
 * Get a table by alias.
 * @param alias The alias of the table.
 */
Database.prototype.getTableByAlias = function(alias)
{
  assert(this._aliasLookup[alias],
    'Table alias ' + alias + ' does not exist in database ' + this.getName() + '.');

  return this._aliasLookup[alias];
};

/**
 * Check if name is a valid table alias.
 * @param alias The alias of a table.
 */
Database.prototype.isTableAlias = function(alias)
{
  return !!this._aliasLookup[alias];
};

module.exports = Database;

