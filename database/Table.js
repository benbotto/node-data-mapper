'use strict';

require('insulin')
  .factory('ndm_Table', ['ndm_assert', 'ndm_Column', 'ndm_ForeignKey'],
  ndm_TableProducer);

function ndm_TableProducer(assert, Column, ForeignKey) {
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

      // Objects are used here instead of Maps for efficiency reasons.
      this._nameLookup  = {};
      this._mapToLookup = {};

      /**
       * The name of the column.
       * @type {string}
       * @name Table#name
       * @public
       */

      /**
       * The property name in the resulting normalized object.
       * @type {string}
       * @name Table#mapTo
       * @default table.name
       * @public
       */
      this.mapTo = this.mapTo || this.name;

      /**
       * The array of columns.
       * @type {Column[]}
       * @name Table#columns
       * @public
       */
      this.columns = [];

      /**
       * The table's primary key.
       * @type {Column[]}
       * @name Table#primaryKey
       * @public
       */
      this.primaryKey = [];

      /**
       * An array of ForeignKey nstances describing the relationship between
       * this table and others.
       * @type {ForeignKey[]}
       * @name Table#foreignKeys
       * @public
       */
      if (!this.foreignKeys)
        this.foreignKeys = [];
      else
        this.foreignKeys = this.foreignKeys.map(fk => new ForeignKey(fk));

      // Add all the columns.
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
      assert(this._nameLookup[column.name] === undefined,
        `Column ${column.name} already exists in table ${this.name}.`);
      assert(this._mapToLookup[column.mapTo] === undefined,
        `Column mapping ${column.mapTo} already exists in table ${this.name}.`);

      // Store the column, and keep some lookups.
      this.columns.push(column);
      this._nameLookup[column.name]   = column;
      this._mapToLookup[column.mapTo] = column;

      if (column.isPrimary)
        this.primaryKey.push(column);

      return this;
    }

    /**
     * Get a column by name.
     * @param {string} name - The column name.
     * @return {Column} The Column instance.
     */
    getColumnByName(name) {
      assert(this._nameLookup[name] !== undefined,
        `Column ${name} does not exist in table ${this.name}.`);

      return this._nameLookup[name];
    }

    /**
     * Check if name matches a column.
     * @param {string} name - The column name.
     * @return {boolean}
     */
    isColumnName(name) {
      return this._nameLookup[name] !== undefined;
    }

    /**
     * Get a column by mapping (it's mapTo property).
     * @param {string} mapping - The column's mapTo property.
     * @return {Column} The column instance.
     */
    getColumnByMapping(mapping) {
      assert(this._mapToLookup[mapping] !== undefined,
        `Column mapping ${mapping} does not exist in table ${this.name}.`);

      return this._mapToLookup[mapping];
    }

    /**
     * Check if mapping matches a column.
     * @param {string} mapping - The column's mapTo property.
     * @return {boolean}
     */
    isColumnMapping(mapping) {
      return this._mapToLookup[mapping] !== undefined;
    }
  }

  return Table;
}

