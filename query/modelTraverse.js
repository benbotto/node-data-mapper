'use strict';

/**
 * Traverse model (either an object or an array) using a depth-first traversal.
 * @param callback A function(meta) to be invoked with each object within
 *        the model.  Meta will have three properties: tableAlias, model, and
 *        parent.
 * @param database An optional Database instance.  If passed, the callback
 *        will only be called if a key in the model corresponds to a table
 *        alias.
 * @param val The object or array to traverse.
 * @param key The key associated with the object/array.
 * @param parent The parent of the current val.
 */
function _depthFirst(callback, database, val, key, parent)
{
  if (val instanceof Array)
  {
    // Each element in the array could be a sub model.  The key for each
    // array element is the name of the array property in the object.
    for (var i = 0; i < val.length; ++i)
      _depthFirst(callback, database, val[i], key, parent);
  }
  else if (val instanceof Object)
  {
    var nextParent = key && (!database || database.isTableAlias(key)) ? val : null;

    // Each property in the object could be a sub model.  Traverse each.
    for (var nKey in val)
      _depthFirst(callback, database, val[nKey], nKey, nextParent);

    // Don't fire the callback unless key is defined (if it is undefined it is
    // the top-level object).
    if (key && (!database || database.isTableAlias(key)))
      callback({tableAlias: key, model: val, parent: parent || null});
  }
}

module.exports =
{
  /**
   * Traverse the keys in model.
   * @param model The object or array to traverse.
   * @param callback A function(key, val) to be invoked with each object within
   *        the model.
   * @param database An optional Database instance.  If passed, the callback
   *        will only be called if a key in the model corresponds to a table
   *        alias.
   */
  modelOnly: function(model, callback, database)
  {
    var modelParts;

    for (var tblAlias in model)
    {
      modelParts = (model[tblAlias] instanceof Array) ? model[tblAlias] : [model[tblAlias]];

      for (var i = 0; i < modelParts.length; ++i)
      {
        if (!database || database.isTableAlias(tblAlias))
          callback({tableAlias: tblAlias, model: modelParts[i], parent: null});
      }
    }
  },

  /**
   * Traverse model (either an object or an array) using a depth-first traversal.
   * @param model The object or array to traverse.
   * @param callback A function(meta) to be invoked with each object within
   *        the model.  Meta will have three properties: tableAlias, model, and
   *        parent.
   * @param database An optional Database instance.  If passed, the callback
   *        will only be called if a key in the model corresponds to a table
   *        alias.
   */
  depthFirst: function(model, callback, database)
  {
    _depthFirst(callback, database, model);
  },

  /**
   * Traverse model (either an object or an array) using a breadth-first traversal.
   * @param model The object or array to traverse.
   * @param callback A function(meta) to be invoked with each object within
   *        the model.  Meta will have three properties: tableAlias, model, and
   *        parent.
   * @param database An optional Database instance.  If passed, the callback
   *        will only be called if a key in the model corresponds to a table
   *        alias.
   */
  breadthFirst: function(model, callback, database)
  {
    var queue = [{tableAlias: null, model: model, parent: null}];
    var parent;

    while (queue.length !== 0)
    {
      var item = queue.shift();

      if (item.model instanceof Array)
      {
        // If there is a database instance, parent is only set if it is
        // a valid table alias.
        parent = (!database || item.parent && database.isTableAlias(item.parent.tableAlias)) ? item.parent : null;

        // Each element in the array could be a sub model.  The key for each
        // array element is the name of the array property in the object.
        for (var i = 0; i < item.model.length; ++i)
          queue.push({tableAlias: item.tableAlias, model: item.model[i], parent: item.parent});
      }
      else if (item.model instanceof Object)
      {
        parent = (!database || database.isTableAlias(item.tableAlias)) ? item : null;

        // Each property in the object could be a sub model.  Queue each.
        for (var nKey in item.model)
          queue.push({tableAlias: nKey, model: item.model[nKey], parent: parent});

        // Don't fire the callback unless key is non-null (if it is null it is
        // the top-level object).
        if (item.tableAlias && (!database || database.isTableAlias(item.tableAlias)))
          callback(item);
      }
    }
  }
};

