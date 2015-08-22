'use strict';

var assert = require(__dirname + '/assert');

/**
 * Class for representing a database.
 * @param database An object in the following format.
 * {
 *   name: string // Required - the name of the database.
 * }
 */
function Database(database)
{
  assert(database.name, 'database name is required.');

  this._name        = database.name;
  this._tables      = [];
  this._nameLookup  = {};
  this._aliasLookup = {};
}

/**
 * Get the name of the database.
 */
Database.prototype.getName = function()
{
  return this._name;
};

/**
 * Add a Table to the database.
 * @param table The new table, which must have a unique name.
 */
Database.prototype.addTable = function(table)
{
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
 * Get a table by alias.
 * @param alias The alias of the table.
 */
Database.prototype.getTableByAlias = function(alias)
{
  assert(this._aliasLookup[alias],
    'Table alias ' + alias + ' does not exist in database ' + this.getName() + '.');

  return this._aliasLookup[alias];
};

module.exports = Database;

