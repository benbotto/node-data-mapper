'use strict';

require('insulin').factory('ndm_TableMetaList',
  ['ndm_assert', 'ndm_Column', 'ndm_Schema'],
  ndm_TableMetaListProducer);

function ndm_TableMetaListProducer(assert, Column, Schema) {
  /** A helper class for keeping meta data about a list of tables. */
  class TableMetaList {
    /**
     * @typedef TableMetaList~TableMeta
     * @type {Object}
     * @property {string} table - The name of the table, or a Table instance.
     * @property {string} [as=Table.name] - An alias for the table.  This is
     * needed if, for example, the same table is joined in multiple times.  If
     * not provided the alias defaults to the table name.
     * @property {string} [mapTo=Table.mapTo] - The table mapping.  That is,
     * the name of the property in the resulting normalised object.
     * @property {Condition} [cond=null] - The condition (WHERE or ON)
     * associated with the table.
     * @property {string} [parent=null] - The alias of the parent table, if
     * any.
     * @property {Schema.RELATIONSHIP_TYPE}
     * [relType=Schema~RELATIONSHIP_TYPE.MANY] - The type of relationship
     * between the parent and this table ("single" or "many").  If set to
     * "single" the table will be serialized into an object, otherwise the
     * table will be serialized into an array.  "many" is the default.
     * @property {From.JOIN_TYPE} [joinType=null] The type of join, if any.
     * Leave null for the FROM table.
     */

    /**
     * @typedef TableMetaList~ColumnMeta
     * @type {Object}
     * @property {string} tableAlias - The unique alias of the table to which
     * the column belongs.
     * @property {Column} column - The Column instance.
     * @property {string} fqColName - The fully-qualified column name, in the
     * form &lt;table-alias&gt;.&lt;column-name&gt;.
     */

    /**
     * Initialize the list.
     * @param {Database} database - A Database instance, for which table
     * metadata will be stored.
     */
    constructor(database) {
      /**
       * The database instance, for which table metadata will be stored.
       * @type {Database}
       * @name TableMetaList#database
       * @public
       */
      this.database = database;

      /**
       * The map of TableMetaList~TableMeta objects.  The key is the table's
       * unique alias.
       * @type {Map<TableMetaList~TableMeta>}
       * @name TableMetaList#tableMetas
       * @public
       */
      this.tableMetas = new Map();

      /**
       * This is a map of all the available columns, indexed by fully-qualified
       * column name.  These are the columns that are available for selecting,
       * performing conditions on, or ordering by.
       * @type {Map<TableMetaList~ColumnMeta>}
       * @name TableMetaList#availableCols
       * @public
       */
      this.availableCols = new Map();

      /**
       * This holds the mapping (mapTo) hierarchy.  The map uses the parent
       * alias as the key (for top-level tables the parent key is literally
       * null), and a Set of mapping names (mapTo) as the values.
       * The same mapping can be used multiple times, but each mapping must be
       * unique to a parent.  For example, it's valid for a person to have a
       * "photo" and a building to have a "photo," but there cannot be two
       * "photo" properties at the top level, nor under person.
       * @type {Map<Set<string>>}
       * @name TableMetaList#mapHierarchy
       * @public
       */
      this.mapHierarchy = new Map();
      this.mapHierarchy.set(null, new Set());
    }

    /**
     * Add a table to the list, and make all the columns in the table
     * "available" for use in a select, condition, or order clause.
     * @param {TableMetaList~TableMeta} meta - A meta object describing the
     * table.
     * @return {this}
     */
    addTable(meta) {
      let table, tableAlias, parent, mapTo, tableMeta;

      // The table name is required.
      assert(meta.table !== undefined, 'table is required.');

      // Pull the table and set up the alias.
      if (typeof meta.table === 'string')
        table = this.database.getTableByName(meta.table);
      else
        table = meta.table;

      tableAlias = meta.as || table.name;

      // Aliases must be word characters.  They can't, for example, contain
      // periods.
      assert(tableAlias.match(/^\w+$/) !== null,
        'Alises must only contain word characters.');

      // The alias must be unique.
      assert(!this.tableMetas.has(tableAlias),
        `The table alias "${tableAlias}" is not unique.`);

      // If a parent is specified, make sure it is a valid alias.
      parent = meta.parent || null;

      if (parent !== null) {
        assert(this.tableMetas.has(parent),
          `Parent table alias "${parent}" is not a valid table alias.`);
      }

      // The table alias is guaranteed to be unique here.  Add it to the map
      // hierarchy.
      this.mapHierarchy.set(tableAlias, new Set());

      // The mapping must be unique to a parent (the parent is null at the top
      // level, and mappings at the top level must also be unique).
      mapTo = meta.mapTo || table.mapTo;
      assert(!this.mapHierarchy.get(parent).has(mapTo),
        `The mapping "${mapTo}" is not unique.`);
      this.mapHierarchy.get(parent).add(mapTo);

      // Add the table to the list of tables.
      tableMeta = {
        table:    table,
        as:       tableAlias,
        mapTo:    mapTo,
        cond:     meta.cond     || null,
        parent:   meta.parent   || null,
        relType:  meta.relType  || Schema.RELATIONSHIP_TYPE.MANY,
        joinType: meta.joinType || null
      };

      this.tableMetas.set(tableAlias, tableMeta);

      // Make each column available for selection or conditions.
      table.columns.forEach(function(column) {
        const fqColName = Column.createFQColName(tableAlias, column.name);

        this.availableCols.set(fqColName, {tableAlias, column, fqColName});
      }, this);

      return this;
    }

    /**
     * Check if the columns is available (for selecting, for a condition, or
     * for an order by clause).
     * @param {string} fqColName - The fully-qualified column name to look for.
     * @return {boolean} true if the column is available, false otherwise.
     */
    isColumnAvailable(fqColName) {
      return this.availableCols.has(fqColName);
    }
  }

  return TableMetaList;
}
