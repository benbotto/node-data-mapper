'use strict';

/**
 * Construct a new SELECT query.  FROM and JOINs must come first so that
 * selected columns can be found.
 * @param database The database to select from.
 * @param tableName The table to select from, by name, not by alias.
 * @param tableAlias An optional alias for the table.  This is needed if, for
 *        example, the same table is joined in multple times.  Note that this
 *        is different than the Table's alias, which is used for serializing.
 */
function From(database, tableName, tableAlias)
{
  this._database   = database;
  this._selectCols = [];
  this._from       =
  {
    alias: tableAlias || tableName,
    table: database.getTableByName(tableName)
  };
}

/**
 * Get the SQL that represents the query.
 */
From.prototype.toString = function()
{
  var sql  = 'SELECT  ';
  var cols = this._selectCols;

  // No columns specified.  Get all columns.
  if (cols.length === 0)
  {
    cols = this._from.table.getColumns();
  }

  // Escape each column and add it to the query.
  sql += cols.map(function(col)
  {
    var colName = col.getName();

    // Column names must be unique, and the same column name could exist
    // multiple times (two tables could have the same column name, or the same
    // table could be joined multiple times).  Hence each column is aliased,
    // prefixed by the table alias.
    return '`' + this._from.alias + '`.`' + colName +
      '` AS `' + this._from.alias + '.'   + colName + '`';
  }.bind(this)).join(', ');

  sql += '\n';

  // Add the FROM portion.
  sql += 'FROM    `' + this._from.table.getName() + '`' + ' AS `' + this._from.alias + '`';

  return sql;
};

module.exports = From;

