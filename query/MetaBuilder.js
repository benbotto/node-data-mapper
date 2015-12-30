'use strict';

var traverse = require('./modelTraverse');

/**
 * This class is used for building meta data (columns, values, and models) for
 * queries that persist (UPDATE and INSERT).
 */
function MetaBuilder()
{
}

MetaBuilder.RECURSE_TYPE =
{
  NONE:          'none',
  DEPTH_FIRST:   'depth-first',
  BREADTH_FIRST: 'breadth-first'
};

/**
 * Build an array of model, and key-value pairs.  This meta is used when
 * creating an INSERT or UPDATE query.  This method does not recurse into
 * sub models.
 * @param database A Database instance describing the database.
 * @param tableAlias The alias of a database table.  If this does not existing
 *        in the database instance then the model is ignored.
 * @param model A model object or array to persist.  Each key should correspond 
 *        to a column alias.
 */
MetaBuilder.prototype._flattenModel = function(database, tableAlias, model)
{
  var table, columns, val, fields;
  var meta = [];

  // If the tableAlias does not exist in the database it is ignored.
  if (!database.isTableAlias(tableAlias))
    return meta;

  if (!(model instanceof Array))
    model = [model];

  table   = database.getTableByAlias(tableAlias);
  columns = table.getColumns();

  for (var i = 0; i < model.length; ++i)
  {
    fields = [];

    for (var j = 0; j < columns.length; ++j)
    {
      // undefined values are skipped.
      if ((val = model[i][columns[j].getAlias()]) !== undefined)
      {
        // If there is a converter associated with this column, use it.
        if (val !== null && columns[j].getConverter().onSave)
          val = columns[j].getConverter().onSave(val);
        fields.push({columnName: columns[j].getName(), value: val});
      }
    }

    meta.push
    ({
      model:     model[i],
      tableName: table.getName(),
      fields:    fields
    });
  }

  return meta;
};

/**
 * Build an array of model, and key-value pairs.  This meta is used when
 * creating an INSERT or UPDATE query.
 * @param database A Database instance describing the database.
 * @param model A model object to persist.  Each key in the object should be a
 *        table alias.  The value associated with the key should be an object
 *        (or an array of objects) wherein each key corresponds to a column
 *        alias.
 * @param recurseType One of 'none', 'depth-first', or 'breadth-first'.  How
 *        to traverse into sub models.
 */
MetaBuilder.prototype.buildMeta = function(database, model, recurseType)
{
  var meta = [];

  if (recurseType === MetaBuilder.RECURSE_TYPE.NONE || recurseType === undefined)
  {
    // No recursion, just build the meta for the top-level model(s).
    for (var tblAlias in model)
      meta = meta.concat(this._flattenModel(database, tblAlias, model[tblAlias]));
  }
  else if (recurseType === MetaBuilder.RECURSE_TYPE.DEPTH_FIRST)
  {
    // Traverse the model using a depth-first traversal.  For each model
    // call _flattenModel.
    traverse.depthFirst(model, function(tblAlias, model)
    {
      meta = meta.concat(this._flattenModel(database, tblAlias, model));
    }.bind(this));
  }
  else if (recurseType === MetaBuilder.RECURSE_TYPE.BREADTH_FIRST)
  {
    // Traverse the model using a depth-first traversal.
    traverse.breadthFirst(model, function(tblAlias, model)
    {
      meta = meta.concat(this._flattenModel(database, tblAlias, model));
    }.bind(this));
  }
  else
    throw new Error('Invalid recurseType.');

  return meta;
};

module.exports = MetaBuilder;

