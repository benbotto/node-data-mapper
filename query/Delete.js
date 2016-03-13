'use strict';

var Query    = require('./Query');
var assert   = require('../util/assert');
var deferred = require('deferred');

/**
 * Construct a new DELETE query.
 * @param from An instance of a From.
 * @param tableAlias The alias of the table to delete.  Optional,
 *        defaults to the alias of the from table.
 */
function Delete(from, tableAlias)
{
  Query.call(this, from.getDatabase(), from.getEscaper(), from.getQueryExecuter());

  this._from         = from;
  this._delTableMeta = (tableAlias) ?
    this._from._tableAliasLookup[tableAlias] : this._from._tables[0];

  assert(this._delTableMeta,
    'Table alias ' + tableAlias + ' is not a valid table alias.');
}

// Delete extends Query.
Delete.prototype = Object.create(Query.prototype);
Delete.prototype.constructor = Query;

/**
 * Create the delete SQL.
 */
Delete.prototype.toString = function()
{
  var fromAlias = this._escaper.escapeProperty(this._delTableMeta.tableAlias);
  var sql  = 'DELETE  ' + fromAlias + '\n';

  // Add the FROM (which includes the JOINS and WHERE).
  sql += this._from.toString();

  return sql;
};

/**
 * Execute the query.
 */
Delete.prototype.execute = function()
{
  var defer = deferred();

  this._queryExecuter.delete(this.toString(), function(err, result)
  {
    if (err)
      defer.reject(err);
    else
      defer.resolve(result);
  });

  return defer.promise;
};

module.exports = Delete;

