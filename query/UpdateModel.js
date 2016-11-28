'use strict';

require('insulin').factory('ndm_UpdateModel',
  ['ndm_Update', 'ndm_MutateModel', 'ndm_Column'], ndm_UpdateModelProducer);

function ndm_UpdateModelProducer(Update, MutateModel, Column) {
  /**
   * A Query class specialized for updating models by ID.
   * @extends MutateModel
   */
  class UpdateModel extends MutateModel {
    /**
     * Initialize the Query.
     * @param {Database} database - The database to mutate from.
     * @param {Escaper} escaper - An instance of an Escaper matching the
     * database type (e.g. MySQLEscaper).
     * @param {QueryExecuter} queryExecuter - A QueryExecuter instance that
     * implements the update method.
     * @param {Object} model - A model object to update.  Each key in the
     * object should map to a table.  The value associated with the key should
     * be an object or an array of objects wherein each key maps to a column.
     * The primary key is required for each model.
     */
    constructor(database, escaper, queryExecuter, model) {
      super(database, escaper, queryExecuter, model);
    }

    /**
     * Create an Update instance.
     * @param {ModelTraverse~ModelMeta} meta - A meta object as created by the
     * modelTraverse class.
     * @return {Update} An Update Query instance representing the query.
     */
    createQuery(meta) {
      const from    = super.createQuery(meta);
      const table   = this.database.getTableByMapping(meta.tableMapping);
      const updates = {};

      for (let colMapping in meta.model) {
        let col, fqColName;

        // If the property is not a table mapping it is ignored.  (The model
        // can have extra user-defined data.)
        if (!table.isColumnMapping(colMapping))
          continue;

        col = table.getColumnByMapping(colMapping);

        // Don't include the primary key in the update.
        if (col.isPrimary)
          continue;

        // The table is not explicitly aliased (e.g. it uses the name).
        fqColName = Column.createFQColName(table.name, col.name);

        // Add the key-value pair to the list of columns to update.
        updates[fqColName] = meta.model[colMapping];
      }

      return new Update(from, updates);
    }
  }

  return UpdateModel;
}

