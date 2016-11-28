'use strict';

require('insulin').factory('ndm_ModelTraverse', ndm_modelTraverseProducer);

function ndm_modelTraverseProducer() {
  /** A class that has helper methods for traversing a database model. */
  class ModelTraverse {

    /**
     * @typedef ModelTraverse~ModelMeta
     * @type {Object}
     * @property {string} tableMapping - The mapping (mapTo) of the table with
     * which the model is associated.
     * @property {Object} model - The model itself.
     * @property {Object} parent - The model's parent, or null if the model has
     * no parent.
     */

    /**
     * A callback prototype that is called upon each iteration of a model.
     * @callback ModelTraverse~modelMetaCallback
     * @param {ModelTraverse~ModelMeta} meta - A ModelTraverse~ModelMeta
     * instance describing the current model.
     */

    /**
     * Traverse the keys in model.
     * @param {Object|object[]} model - The object or array to traverse.
     * @param {ModelTraverse~modelMetaCallback} callback - A function that
     * shall be invoked with for each sub-model within model.
     * @param {Database} database - An optional Database instance.  If passed,
     * the callback will only be called if a key in the model corresponds to a
     * table mapping.
     * @return {void}
     */
    modelOnly(model, callback, database) {
      for (let tableMapping in model) {
        const modelParts = (model[tableMapping] instanceof Array) ?
          model[tableMapping] : [model[tableMapping]];

        for (let i = 0; i < modelParts.length; ++i) {
          if (!database || database.isTableMapping(tableMapping))
            callback({tableMapping: tableMapping, model: modelParts[i], parent: null});
        }
      }
    }

    /**
     * Traverse model (either an object or an array) using a depth-first traversal.
     * @param {Object|object[]} model - The object or array to traverse.
     * @param {ModelTraverse~modelMetaCallback} callback - A function that
     * shall be invoked with for each sub-model within model.
     * @param {Database} database - An optional Database instance.  If passed,
     * the callback will only be called if a key in the model corresponds to a
     * table mapping.
     * @return {void}
     */
    depthFirst(model, callback, database) {
      // Private helper function to recurse through the model.
      (function _depthFirst(model, callback, database, tableMapping=null, parent=null) {
        if (model instanceof Array) {
          // Each element in the array could be a sub-model.  The key for each
          // array element (the table mapping) is the name of the property in
          // the model.
          for (let i = 0; i < model.length; ++i)
            _depthFirst(model[i], callback, database, tableMapping, parent);
        }
        else if (model instanceof Object) {
          const nextParent =
            tableMapping && (!database || database.isTableMapping(tableMapping)) ?
            model : null;

          // Each property in the object could be a sub model.  Traverse each.
          for (let modelProp in model)
            _depthFirst(model[modelProp], callback, database, modelProp, nextParent);

          // Don't fire the callback unless mapping is defined (if it is
          // undefined it is the top-level object).
          if (tableMapping && (!database || database.isTableMapping(tableMapping)))
            callback({tableMapping, model, parent});
        }
      })(model, callback, database);
    }

    /**
     * Traverse model (either an object or an array) using a breadth-first traversal.
     * @param {Object|object[]} model - The object or array to traverse.
     * @param {ModelTraverse~modelMetaCallback} callback - A function that
     * shall be invoked with for each sub-model within model.
     * @param {Database} database - An optional Database instance.  If passed,
     * the callback will only be called if a key in the model corresponds to a
     * table mapping.
     * @return {void}
     */
    breadthFirst(model, callback, database) {
      const queue = [{tableMapping: null, model: model, parent: null}];

      while (queue.length !== 0) {
        const item = queue.shift();

        if (item.model instanceof Array) {
          // If there is a database instance, parent is only set if it is
          // a valid table alias.
          const parent =
            (!database || item.parent && database.isTableMapping(item.parent.tableMapping)) ?
            item.parent : null;

          // Each element in the array could be a sub model.  The key for each
          // array element is the name of the array property in the object.
          for (let i = 0; i < item.model.length; ++i)
            queue.push({tableMapping: item.tableMapping, model: item.model[i], parent: parent});
        }
        else if (item.model instanceof Object) {
          const parent =
            (!database || database.isTableMapping(item.tableMapping)) ?
            item : null;

          // Each property in the object could be a sub model.  Queue each.
          for (let modelProp in item.model)
            queue.push({tableMapping: modelProp, model: item.model[modelProp], parent: parent});

          // Don't fire the callback unless key is non-null (if it is null it is
          // the top-level object).
          if (item.tableMapping && (!database || database.isTableMapping(item.tableMapping)))
            callback(item);
        }
      }
    }
  }

  return ModelTraverse;
}

