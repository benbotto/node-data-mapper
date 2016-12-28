'use strict';

require('insulin').factory('ndm_Update',
  ['deferred', 'ndm_Query', 'ndm_assert', 'ndm_ParameterList'],
  ndm_UpdateProducer);

function ndm_UpdateProducer(deferred, Query, assert, ParameterList) {
  /**
   * A Query that represents an UPDATE.
   * @extends Query
   */
  class Update extends Query {
    /**
     * Initialize the Query.
     * @param {From} from - A From instance.
     * @param {Object} model - An object containing key-value pairs.  Each key
     * must correspond to a fully-qualified column name, as created by the
     * Column.createFQColName() method
     * (&lt;table-alias&gt;.&lt;column-name&gt;), and each associated value is
     * the value to update in the database.
     */
    constructor(from, model) {
      super(from.database, from.escaper, from.queryExecuter);

      this._from        = from;
      this._model       = model;
      this._paramLookup = {};

      // Make sure each key in the model maps to a FQ column name.
      for (let fqColName in this._model) {
        assert(this._from._tableMetaList.isColumnAvailable(fqColName),
          `Column "${fqColName}" is not available for updating.`);
      }
    }

    /**
     * Build the query.
     * @return {Query~QueryMeta} The string-representation of the query to
     * execute along with query parameters.
     */
    buildQuery() {
      const update    = this._from.getFromString().replace(/^FROM  /, 'UPDATE');
      const joins     = this._from.getJoinString();
      const where     = this._from.getWhereString();
      const sets      = [];
      const paramList = new ParameterList(this._from.paramList);
      const queryMeta = {};
      let   set;

      // Add each key in the model as a query parameter.
      for (let fqColName in this._model) {
        const col       = this._from._tableMetaList.availableCols.get(fqColName).column;
        const colName   = this.escaper.escapeFullyQualifiedColumn(fqColName);
        const paramName = paramList.createParameterName(fqColName);
        let   paramVal  = this._model[fqColName];

        // The column may need to be transformed (e.g. from a boolean to a bit).
        if (col.converter.onSave)
          paramVal = col.converter.onSave(paramVal);

        paramList.addParameter(paramName, paramVal);

        // Add the set string for the column.
        sets.push(`${colName} = :${paramName}`);
      }

      // Add the parameters.
      queryMeta.params = paramList.params;

      // No columns to update.
      if (sets.length === 0)
        return null;

      set = 'SET\n' + sets.join(',\n');

      // Build the SQL.
      queryMeta.sql = [update, joins, set, where]
        .filter(part => part !== '')
        .join('\n');

      return queryMeta;
    }

    /**
     * Create the UPDATE SQL statement.
     * @return {string} The UPDATE statement, as a SQL string.
     */
    toString() {
      const queryMeta = this.buildQuery();
      return queryMeta ? queryMeta.sql : '';
    }

    /**
     * Execute the query.
     * @return {Promise<object>} A promise that shall be resolved with an
     * object containing an "affectedRows" property.  If an error occurs when
     * executing the query, the returned promise shall be rejected with the
     * error (unmodified).
     */
    execute() {
      const defer     = deferred();
      const queryMeta = this.buildQuery();

      // If there is nothing to update, resolve the promise.
      if (!queryMeta)
        defer.resolve({affectedRows: 0});
      else {
        this.queryExecuter.update(queryMeta.sql, queryMeta.params, function(err, result) {
          if (err)
            defer.reject(err);
          else
            defer.resolve({affectedRows: result.affectedRows});
        });
      }

      return defer.promise;
    }
  }

  return Update;
}

