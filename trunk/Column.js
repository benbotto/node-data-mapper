'use strict';

/**
 * Represents a database column.
 * @param name The name of the database column.
 * @param alias An optional alias for the column, used for serializing.
 *        Defaults to the column name.
 */
function Column(name, alias)
{
  this._name  = name;
  this._alias = alias || name;
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

