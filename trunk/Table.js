'use strict';

var assert = require(__dirname + '/assert');

/**
 * Represents a database table.
 * @param table An object containing a table definition, in the following format.
 * {
 *   name:   string,        // Required.  The name of the table.
 *   alias:  string         // An optional alias for the table, used for serializing.
 *                          // Defaults to the table name.
 * }
 */
function Table(table)
{
  assert(table.name, 'Table name is required.');

  this._name        = table.name;
  this._alias       = table.alias || this._name;
  this._columns     = [];
  this._nameLookup  = {};
  this._aliasLookup = {};
}

/**
 * Get the name of the table.
 */
Table.prototype.getName = function()
{
  return this._name;
};

/**
 * Get the table's alias.
 */
Table.prototype.getAlias = function()
{
  return this._alias;
};

/**
 * Add a column.
 * @param column The Column object.
 */
Table.prototype.addColumn = function(column)
{
  assert(this._nameLookup[column.getName()] === undefined,
    'Column ' + column.getName() + ' already exists in table ' + this.getName() + '.');
  assert(this._aliasLookup[column.getAlias()] === undefined,
    'Column alias ' + column.getAlias() + ' already exists in table ' + this.getName() + '.');

  this._columns.push(column);
  this._nameLookup[column.getName()]   = column;
  this._aliasLookup[column.getAlias()] = column;

  return this;
};

/**
 * Get a column by name.
 * @param name The column name.
 */
Table.prototype.getColumnByName = function(name)
{
  assert(this._nameLookup[name],
    'Column ' + name + ' does not exist in table ' + this.getName() + '.');

  return this._nameLookup[name];
};

/**
 * Get a column by alias.
 * @param alias The column alias.
 */
Table.prototype.getColumnByAlias = function(alias)
{
  assert(this._aliasLookup[alias],
    'Column alias ' + alias + ' does not exist in table ' + this.getName() + '.');

  return this._aliasLookup[alias];
};

/**
 * Get the array of columns.
 */
Table.prototype.getColumns = function()
{
  return this._columns;
};

module.exports = Table;

