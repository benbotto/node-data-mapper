'use strict';

var assert = require(__dirname + '/assert');

/**
 * Represents a database column.
 * @param column An object representing the column with the following properties.
 * {
 *   name:  string, // Required.  The name of the column.
 *   alias: string  // Optional.  The column alias, used for serializing.
 *                  // Defaults to name.
 *                  
 * }
 */
function Column(column)
{
  assert(column.name, 'Column name is required.');

  this._name  = column.name;
  this._alias = column.alias || this._name;
}

/**
 * Get the name of the column.
 */
Column.prototype.getName = function()
{
  return this._name;
};

/**
 * Get the column's alias.
 */
Column.prototype.getAlias = function()
{
  return this._alias;
};

module.exports = Column;

