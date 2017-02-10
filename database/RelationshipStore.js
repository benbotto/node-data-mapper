'use strict';

require('insulin')
  .factory('ndm_RelationshipStore', ['ndm_assert'],
  ndm_RelationshipStoreProducer);

function ndm_RelationshipStoreProducer(assert) {
  /** A class that provides lookups for relationships between tables. */
  class RelationshipStore {
    /**
     * Initialize the storage data structures.
     */
    constructor() {
      this._tables = new Map();
    }

    /**
     * Given a Database instance, store all the foreign keys such that they can
     * be quickly searched.
     * @param {Table[]} An array of Table instances, each of which has a
     * foreignKey property set.
     * @return {void}
     */
    indexRelationships(database) {
      database.tables.forEach(function(table) {
        // Make sure that all the relationships are valid (e.g. the reference
        // valid columns).
        table.foreignKeys.forEach(function(fk) {
          assert(table.isColumnName(fk.column),
            `Foreign key column "${fk.column}" does not exist in table "${table.name}."`);

          assert(database.isTableName(fk.references.table),
            `Referenced table "${fk.references.table}" does not exist.`);

          assert(database.getTableByName(fk.references.table).isColumnName(fk.references.column),
            `Referenced column "${fk.references.column}" does not exist in table `+
            `"${fk.references.table}."`);
        });

        // Store the foreign keys, indexed by table name.
        this._tables.set(table.name, table.foreignKeys);
      }, this);
    }

    /**
     * Get all of the foreign keys between two tables.  The order of the two
     * table names does not matter.
     * @param {string} tableName1 - The first table name.
     * @param {string} tableName2 - The second table name.
     * @param {boolean} [oneWay=false] - When true, only return the
     * relationships between table1 and table2 that table1 owns.
     * @return {ForeignKey[]} An array of ForeignKey instances.
     */
    getRelationships(tableName1, tableName2, oneWay=false) {
      let t1Rels, t2Rels;

      assert(this._tables.has(tableName1), `${tableName1} is not indexed.`);
      assert(this._tables.has(tableName2), `${tableName2} is not indexed.`);

      t1Rels = this._tables.get(tableName1)
        .filter(fk => fk.references.table === tableName2);

      if (oneWay)
        return t1Rels;

      // If the table names are the same, then the user wants the relationships
      // between the table and itself, like a photo with a thumbnailID.  No
      // need to search the table twice and duplicate the relationship list.
      if (tableName1 === tableName2)
        return t1Rels;

      t2Rels = this._tables.get(tableName2)
        .filter(fk => fk.references.table === tableName1);

      return t1Rels.concat(t2Rels);
    }
  }

  return RelationshipStore;
}

