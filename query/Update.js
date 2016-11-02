'use strict';

var Query       = require('./Query');
var deferred    = require('deferred');
var MetaBuilder = require('./MetaBuilder');
var assert      = require('../util/assert');

/**
 * Construct a new UPDATE query.
 * @param from An instance of a From.
 * @param model A model object describing what to update.
 *        The format should be as follows.
 *        {
 *          <table-alias1>:
 *          {
 *            <column-alias1>: <column-value>,
 *            <column-aliasN>: <column-value>
 *          },
 *          <table-aliasN>:
 *          {
 *            ...
 *          }
 *        }
 */
function Update(from, model)
{
  Query.call(this, from.getDatabase(), from.getEscaper(), from.getQueryExecuter());

  var metaBuilder = new MetaBuilder();
  var dbTblAlias, meta;

  this._from    = from;
  this._updMeta = [];

  for (var tblAlias in model)
  {
    assert(this._from._tableAliasLookup[tblAlias],
      'Table alias ' + tblAlias + ' is not available to be updated.');
    
    // This is the alias of the table in the database which may differ from
    // the alias that the user requested (From can have an ad-hoc "as").
    dbTblAlias = this._from._tableAliasLookup[tblAlias].table.getAlias();

    // Build the meta for the object.
    meta = metaBuilder.buildMeta(this._database, dbTblAlias, model[tblAlias]);

    // Keep track of the user-defined table alias.
    meta.tableAlias = tblAlias;

    this._updMeta.push(meta);
  }
}

// Update extends Query.
//Update.prototype = Object.create(Query.prototype);
//Update.prototype.constructor = Query;

/**
 * Get the SET part of the query.
 */
Update.prototype.getSetString = function()
{
  var set  = 'SET\n';
  var sets = [];
  
  this._updMeta.forEach((meta) =>
  {
    var tblAlias = this._escaper.escapeProperty(meta.tableAlias);

    meta.fields.forEach((field) =>
    {
      var colName = this._escaper.escapeProperty(field.columnName);
      var colVal  = this._escaper.escapeLiteral(field.value);

      sets.push(tblAlias + '.' + colName + ' = ' + colVal);
    });
  });

  return sets.length ? set + sets.join(',\n') : '';
};

/**
 * Create the delete SQL.
 */
Update.prototype.toString = function()
{
  var update, set, joins, where, sql;

  // No tables to update.
  if (this._updMeta.length === 0)
    return '';

  update = this._from.getFromString().replace(/^FROM  /, 'UPDATE');
  set    = this.getSetString();
  joins  = this._from.getJoinString();
  where  = this._from.getWhereString();

  // Table alias with no columns to update.
  if (set === '')
    return '';

  sql = update;

  if (joins)
    sql += '\n' + joins;

  sql += '\n' + set;

  if (where)
    sql += '\n' + where;

  return sql;
};

/**
 * Execute the query.
 */
Update.prototype.execute = function()
{
  var defer = deferred();
  var sql   = this.toString();

  // If there is nothing to update, resolve the promise.
  if (!sql)
    defer.resolve({affectedRows: 0});
  else
  {
    this._queryExecuter.update(sql, function(err, result)
    {
      if (err)
        defer.reject(err);
      else
        defer.resolve({affectedRows: result.affectedRows});
    });
  }

  return defer.promise;
};

module.exports = Update;

