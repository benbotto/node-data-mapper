'use strict';

var Update      = require('./Update');
var MutateModel = require('./MutateModel');

/**
 * Construct a new DELETE query used to update models by ID.
 * @param database The database to update from.
 * @param escaper An instance of an Escaper matching the database type (i.e.
 *        MySQLEscaper or MSSQLEscaper).
 * @param queryExecuter A QueryExecuter instance that implements the
 *        update method.
 * @param model A model object to update.  Each key in the object should be a
 *        table alias.  The value associated with the key should be an object
 *        (or an array of objects) wherein each key corresponds to a column
 *        alias.  The primary key is required for each model.
 */
function UpdateModel(database, escaper, queryExecuter, model)
{
  MutateModel.call(this, database, escaper, queryExecuter, model);
}

// UpdateModel extends MutateModel.
UpdateModel.prototype = Object.create(MutateModel.prototype);
UpdateModel.prototype.constructor = MutateModel;

/**
 * Create an Update instance.
 * @param meta A meta object as created by the modelTraverse class.
 */
UpdateModel.prototype.createQueryInstance = function(meta)
{
  var from    = MutateModel.prototype.createQueryInstance.call(this, meta);
  var table   = this._database.getTableByAlias(meta.tableAlias);
  var pk      = table.getPrimaryKey();
  var updates = {};
  var isPK;

  // Update all the columns except for the primary key.
  updates[meta.tableAlias] = {};

  for (var colAlias in meta.model)
  {
    isPK = false;

    for (var i = 0; i < pk.length && !isPK; ++i)
    {
      if (colAlias === pk[i].getAlias())
        isPK = true;
    }

    if (!isPK)
      updates[meta.tableAlias][colAlias] = meta.model[colAlias];
  }

  return new Update(from, updates);
};

module.exports = UpdateModel;

