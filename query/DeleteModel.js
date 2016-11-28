'use strict';

require('insulin').factory('ndm_DeleteModel',
  ['ndm_Delete', 'ndm_MutateModel'], ndm_DeleteModelProducer);

function ndm_DeleteModelProducer(Delete, MutateModel) {
  /**
   * A Query class that allows for quickly deleting of models by ID.
   * @extends MutateModel
   */
  class DeleteModel extends MutateModel {
    /**
     * Initialize the Query instance.
     * @param {Database} database - The database to delete from.
     * @param {Escaper} escaper - An instance of an Escaper matching the
     * database type (e.g. MySQLEscaper).
     * @param {QueryExecuter} queryExecuter - A QueryExecuter instance that
     * implements the delete method.
     * @param {Object} model - A model object to delete.  Each key in the
     * object should map to a table.  The value associated with the key should
     * be an object or an array of objects wherein each key maps to a column.
     * The primary key is required for each model.
     */
    constructor(database, escaper, queryExecuter, model) {
      super(database, escaper, queryExecuter, model);
    }

    /**
     * Create a Delete instance.
     * @param {ModelTraverse~ModelMeta} meta - A meta object as created by the
     * modelTraverse class.
     * @return {Delete} A Delete Query instance representing the DELETE query.
     */
    createQuery(meta) {
      return new Delete(super.createQuery(meta));
    }
  }

  return DeleteModel;
}

