'use strict';

/**
 * This class is used for building meta data (columns, values, and models) for
 * queries that persist (UPDATE and INSERT).
 */
function MetaBuilder()
{
}

/**
 * Build an array of model, and key-value pairs.  This meta is used when
 * creating an INSERT or UPDATE query.  This method does not recurse into
 * sub models.
 * @param database A Database instance describing the database.
 * @param tableAlias The alias of a database table.  If this does not existing
 *        in the database instance then the model is ignored.
 * @param model A model object to persist.  Each key should correspond to a
 *        column alias.
 */
MetaBuilder.prototype.buildMeta = function(database, tableAlias, model)
{
  var table, columns, val;
  var fields = [];
  var meta   = {};

  // If the tableAlias does not exist in the database it is ignored.
  if (!database.isTableAlias(tableAlias))
    return null;

  table   = database.getTableByAlias(tableAlias);
  columns = table.getColumns();
  fields  = [];

  for (var i = 0; i < columns.length; ++i)
  {
    // undefined values are skipped.
    if ((val = model[columns[i].getAlias()]) !== undefined)
    {
      // If there is a converter associated with this column, use it.
      if (val !== null && columns[i].getConverter().onSave)
        val = columns[i].getConverter().onSave(val);
      fields.push({columnName: columns[i].getName(), value: val});
    }
  }

  meta =
  {
    model:     model,
    tableName: table.getName(),
    fields:    fields
  };

  return meta;
};

module.exports = MetaBuilder;

