'use strict';

const assert = require('../util/assert');
const Column = require('./Column');

/** Represents a database table. */
class Table {
  /**
   * Initialize the table using a schema object.
   * @param {object} table - An object containing a table definition.
   * @param {string} table.name - The name of the table.
   * @param {string} [table.mapTo=table.name] - When a resource is pulled from
   * this table and serialized, this mapping will be used in the resulting
   * object.
   * @param {Column[]} table.columns - An array of Columns--or object suitable
   * for the Column constructor--that make up the table.  Refer to the Column
   * constructor for property details.  At least one of the columns must be a
   * primary key.
   */
  constructor(table) {
    assert(table.name, 'name is required.');
    assert(table.columns && (table.columns instanceof Array) && table.columns.length !== 0,
      'columns is required.');

    // Copy all the properties from table.  Anything that the user adds to the
    // table will be preserved.
    Object.assign(this, table);

    // mapTo defaults to name.
    this.mapTo = this.mapTo || this.name;

    this._nameLookup  = new Map();
    this._mapToLookup = new Map();

    // Add all the columns.
    this.columns    = [];
    this.primaryKey = [];
    table.columns.forEach(this.addColumn, this);

    // Make sure there is at least one primary key.
    assert(this.primaryKey.length !== 0,
      'At least one column must be a primary key.');
  }

  /**
   * Add a column.
   * @param {Column|object} column - The Column, or a suitable schema object
   * for the Column constructor.
   * @return {this}
   */
  addColumn(column) {
    // Either an instance of Column or an object can be used.  If an object is
    // passed in, then a Column instance is created.
    if (!(column instanceof Column))
      column = new Column(column);

    // Name and mapTo have to be unique.
    assert(!this._nameLookup.has(column.name),
      `Column ${column.name} already exists in table ${this.name}.`);
    assert(!this._mapToLookup.has(column.mapTo),
      `Column mapping ${column.mapTo} already exists in table ${this.name}.`);

    // Store the column, and keep some lookups.
    this.columns.push(column);
    this._nameLookup.set(column.name, column);
    this._mapToLookup.set(column.mapTo, column);

    if (column.isPrimary)
      this.primaryKey.push(column);

    return this;
  }

  /**
   * Get a column by name.
   * @param {string} name - The column name.
   * @return {Column} - The Column instance.
   */
  getColumnByName(name) {
    assert(this._nameLookup.has(name),
      `Column ${name} does not exist in table ${this.name}.`);

    return this._nameLookup.get(name);
  }

  /**
   * Check if name matches a column.
   * @param {string} name - The column name.
   * @return {boolean}
   */
  isColumnName(name) {
    return this._nameLookup.has(name);
  }

  /**
   * Get a column by mapping (it's mapTo property).
   * @param {string} mapping - The column's mapTo property.
   * @return {Column} - The column instance.
   */
  getColumnByMapping(mapping) {
    assert(this._mapToLookup.has(mapping),
      `Column mapping ${mapping} does not exist in table ${this.name}.`);

    return this._mapToLookup.get(mapping);
  }

  /**
   * Check if mapping matches a column.
   * @param {string} mapping - The column's mapTo property.
   * @return {boolean}
   */
  isColumnMapping(mapping) {
    return this._mapToLookup.has(mapping);
  }
}

module.exports = Table;

