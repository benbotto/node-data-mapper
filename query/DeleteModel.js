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

