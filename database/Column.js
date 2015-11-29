'use strict';

var assert = require(__dirname + '/../util/assert');

/**
 * Represents a database column.
 * @param column An object representing the column with the following properties.
 * {
 *   name:      string, // Required.  The name of the column.
 *
 *   alias:     string, // Optional.  The column alias, used for serializing.
 *                      // Defaults to name.
 *
 *   isPrimary: bool    // Optional.  Whether or not this column is a primary key.
 *                      // Defaults to false.
 *                  
 * }
 */
function Column(column)
{
  assert(column.name, 'Column name is required.');

  this._name      = column.name;
  this._alias     = column.alias || this._name;
  this._isPrimary = !!column.isPrimary;
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

/**
 * Check if the column is a primary key.
 */
Column.prototype.isPrimary = function()
{
  return this._isPrimary;
};

module.exports = Column;

