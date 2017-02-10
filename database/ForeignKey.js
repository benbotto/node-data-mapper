'use strict';

require('insulin').factory('ndm_ForeignKey',
  ['ndm_assert'], ndm_ForeignKeyProducer);

function ndm_ForeignKeyProducer(assert) {
  /** Represents a foreign key. */
  class ForeignKey {
    /**
     * Initialize the foreign key.
     * @param {Object} foreignKey - An object containing a FK definition.
     * @param {string} foreignKey.table - The name of the owning table.
     * @param {string} foreignKey.column - The name of the column in the owning
     * table.
     * @param {Object} foreignKey.references - An object representing the
     * referenced table-column combination.
     * @param {string} foreignKey.references.table - The name of the referenced
     * table.
     * @param {string} foreignKey.references.column - The name of the column in
     * the referenced table.
     */
    constructor(foreignKey) {
      assert(foreignKey.table, 'table is required.');
      assert(foreignKey.column, 'column is required.');
      assert(foreignKey.references, 'references is required.');
      assert(foreignKey.references.table, 'Referenced table is required.');
      assert(foreignKey.references.column, 'Referenced column is required.');

      Object.assign(this, foreignKey);
    }
  }

  return ForeignKey;
}

