'use strict';

var assert = require('../util/assert');

/**
 * Represents a database column.
 * @param column An object representing the column with the following properties.
 * {
 *   name:       string, // Required.  The name of the column.
 *   alias:      string, // Optional.  The column alias, used for serializing.
 *                       // Defaults to name.
 *   isPrimary:  bool,   // Optional.  Whether or not this column is a primary key.
 *                       // Defaults to false.
 *   dataType:   string, // The data type of the column as a string.  Defaults to null.
 *   maxLength:  int,    // The maximum length of the column.  Defaults to null.
 *   isNullable: bool,   // Whether or not null is acceptable for the column.
 *                       // Defaults to true.
 *   converter:  object  // An optional converter object containing onRetrieve
 *                       // and/or onSave methods.  These methods will be called
 *                       // when a column is serialized after a select, or before
 *                       // the column is saved to the database.
 * }
 */
function Column(column)
{
  assert(column.name, 'Column name is required.');

  this._name       = column.name;
  this._alias      = column.alias     || this._name;
  this._dataType   = column.dataType  || null;
  this._maxLength  = column.maxLength || null;
  this._converter  = column.converter || {};
  this._isPrimary  = !!column.isPrimary;
  this._isNullable = (column.isNullable === undefined) ? true : !!column.isNullable;
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
 * Get the column's data type.
 */
Column.prototype.getDataType = function()
{
  return this._dataType;
};

/**
 * Get the column's max length.
 */
Column.prototype.getMaxLength = function()
{
  return this._maxLength;
};

/**
 * Check if the column is a nullable key.
 */
Column.prototype.isNullable = function()
{
  return this._isNullable;
};

/**
 * Check if the column is a primary key.
 */
Column.prototype.isPrimary = function()
{
  return this._isPrimary;
};

/**
 * Get the column converter object, if any.
 */
Column.prototype.getConverter = function()
{
  return this._converter;
};

/**
 * Convert the Column instance to an object.
 */
Column.prototype.toObject = function()
{
  var obj =
  {
    name:      this._name,
    alias:     this._alias,
    isPrimary: this._isPrimary,
    converter: this._converter
  };

  return obj;
};

/**
 * Clone this column.
 */
Column.prototype.clone = function()
{
  return new Column(this.toObject());
};

module.exports = Column;

