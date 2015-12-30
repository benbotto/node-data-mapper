'use strict';

/**
 * Traverse obj (either an object or an array) using a depth-first traversal.
 * @param callback A function(key, val) to be invoked with each object within
 *        the model.
 * @param val The object or array to traverse.
 * @param key The key associated with the object/array.
 */
function _depthFirst(callback, val, key)
{
  if (val instanceof Array)
  {
    // Each element in the array could be a sub model.  The key for each
    // array element is the name of the array property in the object.
    for (var i = 0; i < val.length; ++i)
      _depthFirst(callback, val[i], key);
  }
  else if (val instanceof Object)
  {
    // Each property in the object could be a sub model.  Traverse each.
    for (var nKey in val)
      _depthFirst(callback, val[nKey], nKey);

    // Don't fire the callback unless key is defined (if it is undefined it is
    // the top-level object).
    if (key)
      callback(key, val);
  }
}

module.exports =
{
  /**
   * Traverse obj (either an object or an array) using a depth-first traversal.
   * @param model The object or array to traverse.
   * @param callback A function(key, val) to be invoked with each object within
   *        the model.
   */
  depthFirst: function(model, callback)
  {
    _depthFirst(callback, model);
  },

  /**
   * Traverse obj (either an object or an array) using a breadth-first traversal.
   * @param model The object or array to traverse.
   * @param callback A function(key, val) to be invoked with each object within
   *        the model.
   */
  breadthFirst: function(model, callback)
  {
    var queue = [{key: undefined, val: model}];

    while (queue.length !== 0)
    {
      var item = queue.shift();

      if (item.val instanceof Array)
      {
        // Each element in the array could be a sub model.  The key for each
        // array element is the name of the array property in the object.
        for (var i = 0; i < item.val.length; ++i)
          queue.push({key: item.key, val: item.val[i]});
      }
      else if (item.val instanceof Object)
      {
        // Each property in the object could be a sub model.  Queue each.
        for (var nKey in item.val)
          queue.push({key: nKey, val: item.val[nKey]});

        // Don't fire the callback unless key is defined (if it is undefined it is
        // the top-level object).
        if (item.key)
          callback(item.key, item.val);
      }
    }
  }
};

