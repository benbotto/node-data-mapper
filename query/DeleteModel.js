'use strict';

var Delete      = require('./Delete');
var MutateModel = require('./MutateModel');

/**
 * Construct a new DELETE query used to delete models by ID.
 * @param database The database to delete from.
 * @param escaper An instance of an Escaper matching the database type (i.e.
 *        MySQLEscaper or MSSQLEscaper).
 * @param queryExecuter A QueryExecuter instance that implements the
 *        delete method.
 * @param model A model object to delete.  Each key in the object should be a
 *        table alias.  The value associated with the key should be an object
 *        (or an array of objects) wherein each key corresponds to a column
 *        alias.  The primary key is required for each model.
 */
function DeleteModel(database, escaper, queryExecuter, model)
{
  MutateModel.call(this, database, escaper, queryExecuter, model);
}

// DeleteModel extends MutateModel.
DeleteModel.prototype = Object.create(MutateModel.prototype);
DeleteModel.prototype.constructor = MutateModel;

/**
 * Create a Delete instance.
 * @param meta A meta object as created by the modelTraverse class.
 */
DeleteModel.prototype.createQueryInstance = function(meta)
{
  var from = MutateModel.prototype.createQueryInstance.call(this, meta);
  return new Delete(from);
};

module.exports = DeleteModel;

