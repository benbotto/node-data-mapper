'use strict';

/**
 * Represents a database table.
 * @param name The name of the table.
 * @param alias An optional alias for the table, used for serializing.
 *        Defaults to the table name.
 */
function Table(name, alias)
{
  this._name        = name;
  this._alias       = alias || name;
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
  if (this._nameLookup[column.getName()] !== undefined)
    throw new Error('Column ' + column.getName() + ' already exists in table ' + this.getName());

  this._columns.push(column);
  this._nameLookup[column.getName()]   = column;
  this._aliasLookup[column.getAlias()] = column;
};

/**
 * Get a column by name.
 * @param name The column name.
 */
Table.prototype.getColumnByName = function(name)
{
  return this._nameLookup[name];
};

/**
 * Get a column by alias.
 * @param alias The column alias.
 */
Table.prototype.getColumnByAlias = function(alias)
{
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

