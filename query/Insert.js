'use strict';

/**
 * Construct a new INSERT query.
 * @param database The database to insert into.
 * @param escaper An instance of an Escaper matching the database type (i.e.
 *        MySQLEscaper or MSSQLEscaper).
 * @param queryExecuter A QueryExecuter instance that implements the
 *        insert method.
 * @param model A model object to insert.  Each key in the object should be a
 *        table alias.  The value associated with the key should be an object
 *        (or an array of objects) wherein each key corresponds to a column
 *        alias.
 */
function Insert(database, escaper, queryExecuter, model)
{
  this._database      = database;
  this._escaper       = escaper;
  this._queryExecuter = queryExecuter;
  this._model         = model;
}

/**
 * Private helper to build an array of INSERT queries.
 */
Insert.prototype._buildQueries = function()
{
  var queries = [];
  var table, columns, i, j, curModels, curModel, val, vals, cols, sql;

  for (var tblAlias in this._model)
  {
    // Properties that do not match a table alias in the db are skipped.
    if (!this._database.isTableAlias(tblAlias))
      continue;

    table     = this._database.getTableByAlias(tblAlias);
    columns   = table.getColumns();
    curModels = this._model[tblAlias];

    // The model(s) can be an array or an object.
    if (!(curModels instanceof Array))
      curModels = [curModels];

    for (i = 0; i < curModels.length; ++i)
    {
      curModel = curModels[i];

      // Store the columns and values to insert.
      vals = [];
      cols = [];

      for (j = 0; j < columns.length; ++j)
      {
        val = curModel[columns[j].getAlias()];

        // undefined values are skipped.
        if (val !== undefined)
        {
          vals.push(val);
          cols.push(columns[j].getName());
        }
      }

      // Build the actual query.
      if (cols.length !== 0)
      {
        sql  = 'INSERT INTO ';
        sql += this._escaper.escapeProperty(table.getName());
        sql += ' (';
        sql += cols.map(this._escaper.escapeProperty.bind(this._escaper)).join(', ');
        sql += ')\n';
        sql += 'VALUES (';
        sql += vals.map(this._escaper.escapeLiteral.bind(this._escaper)).join(', ');
        sql += ')';

        queries.push(sql);
      }
    }
  }

  return queries;
};

/**
 * Create the SQL string.
 */
Insert.prototype.toString = function()
{
  return this._buildQueries().join(';\n\n');
};

module.exports = Insert;

