'use strict';

var assert = require('../util/assert');
var Column = require('./Column');

/**
 * Represents a database table.
 * @param table An object containing a table definition, in the following format.
 * {
 *   name:       string,        // Required.  The name of the table.
 *   columns:    array<Column>, // An array of Columns (or object suitable for
 *                              // the Column constructor) that make up the table.
 *                              // Refer to the Column constructor for property details.
 *                              // At least one of the columns must be a primary key.
 *   alias:      string         // An optional alias for the table, used for serializing.
 *                              // Defaults to the table name.
 * }
 */
function Table(table)
{
  assert(table.name, 'name is required.');

  this._name        = table.name;
  this._alias       = table.alias || this._name;
  this._columns     = [];
  this._primaryKey  = [];
  this._nameLookup  = {};
  this._aliasLookup = {};

  if (table.columns)
  {
    table.columns.forEach(this.addColumn.bind(this));

    // Make sure there is at least one primary key.
    assert(this._primaryKey.length !== 0,
      'At least one column must be a primary key.');
  }
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
 * Get the array of columns.
 */
Table.prototype.getColumns = function()
{
  return this._columns;
};

/**
 * Get the primary key, which is of type array<Column>;
 */
Table.prototype.getPrimaryKey = function()
{
  return this._primaryKey;
};

/**
 * Add a column.
 * @param column The Column, or suitable Column constructor object.
 */
Table.prototype.addColumn = function(column)
{
  // Either an instance of Column or an object can be used.  If an object is
  // passed it, then a Column instance is created.
  if (!(column instanceof Column))
    column = new Column(column);

  assert(this._nameLookup[column.getName()] === undefined,
    'Column ' + column.getName() + ' already exists in table ' + this.getName() + '.');
  assert(this._aliasLookup[column.getAlias()] === undefined,
    'Column alias ' + column.getAlias() + ' already exists in table ' + this.getName() + '.');

  this._columns.push(column);
  this._nameLookup[column.getName()]   = column;
  this._aliasLookup[column.getAlias()] = column;

  if (column.isPrimary())
    this._primaryKey.push(column);

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
 * Check if name is a valid column name.
 * @param name The column name.
 */
Table.prototype.isColumnName = function(name)
{
  return !!this._nameLookup[name];
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
 * Check if alias is a valid column alias.
 * @param alias The column alias.
 */
Table.prototype.isColumnAlias = function(alias)
{
  return !!this._aliasLookup[alias];
};

/**
 * Convert the Table instance to an object.
 */
Table.prototype.toObject = function()
{
  var obj =
  {
    name:    this._name,
    alias:   this._alias,
    columns: []
  };

  for (var i = 0; i < this._columns.length; ++i)
    obj.columns.push(this._columns[i].toObject());

  return obj;
};

/**
 * Clone this Table.
 */
Table.prototype.clone = function()
{
  return new Table(this.toObject());
};

module.exports = Table;

