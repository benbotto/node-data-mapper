'use strict';

require('insulin').factory('ndm_Database',
  ['ndm_assert', 'ndm_Table'], ndm_DatabaseProducer);

function ndm_DatabaseProducer(assert, Table) {
  /** Class for representing a database. */
  class Database {
    /**
     * Initialize the database from a schema object.
     * @param {object} database - A schema object representing the database.  Any
     * custom properties on the database shall be preserved.
     * @param {string} database.name - The name of the database.
     * @param {Table[]} database.tables - An array of Tables.  If, instead, an
     * array of objects is passed in, each object shall be converted to a Table
     * instance.
     */
    constructor(database) {
      assert(database.name, 'Database name is required.');

      // Copy and preserve all properties from the database.
      Object.assign(this, database);

      // Objects are used instead of Maps for performance reasons.  Objects
      // simply perform faster, especially on gets, and performance is
      // important here.
      this._nameLookup  = {};
      this._mapToLookup = {};

      // Ensure that all the tables are Table instances, and that
      // each is uniquely identifiable.
      this.tables = [];
      if (database.tables)
        database.tables.forEach(this.addTable, this);
    }

    /**
     * Add a Table to the database.
     * @param {Table|object} table - The new table, which must have a unique name
     *        and mapping (mapTo property).
     * @return {this}
     */
    addTable(table) {
      if (!(table instanceof Table))
        table = new Table(table);

      assert(this._nameLookup[table.name] === undefined,
        `Table ${table.name} already exists in database ${this.name}.`);
      assert(this._mapToLookup[table.mapTo] === undefined,
        `Table mapping ${table.mapTo} already exists in database ${this.name}.`);

      this.tables.push(table);
      this._nameLookup[table.name]   = table;
      this._mapToLookup[table.mapTo] = table;

      return this;
    }

    /**
     * Get a table by name.
     * @param {string} name - The name of the table.
     * @return {Table} - The Table instance.
     */
    getTableByName(name) {
      assert(this._nameLookup[name] !== undefined,
        `Table ${name} does not exist in database ${this.name}.`);

      return this._nameLookup[name];
    }

    /**
     * Check if name is a valid table name.
     * @param {string} name - The name of the table.
     * @return {boolean} A flag indicating if name corresponds to a Table
     *         instance.
     */
    isTableName(name) {
      return this._nameLookup[name] !== undefined;
    }

    /**
     * Get a table by mapping.
     * @param {string} mapping - The table mapping (mapTo property).
     * @return {Table} - The Table instance.
     */
    getTableByMapping(mapping) {
      assert(this._mapToLookup[mapping] !== undefined,
        `Table mapping ${mapping} does not exist in database ${this.name}.`);

      return this._mapToLookup[mapping];
    }

    /**
     * Check if name is a valid table mapping.
     * @param {string} mapping - The table mapping (mapTo property).
     * @return {boolean} A flag indicating if mapping corresponds to a Table
     * instance.
     */
    isTableMapping(mapping) {
      return this._mapToLookup[mapping] !== undefined;
    }
  }

  return Database;
}

