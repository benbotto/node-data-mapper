'use strict';

require('insulin').factory('ndm_Update',
  ['deferred', 'ndm_Query', 'ndm_assert'],
  ndm_UpdateProducer);

function ndm_UpdateProducer(deferred, Query, assert) {
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

      this.buildQueryParameters();
    }

    /**
     * Build the array of query parameters.
     * @protected
     */
    buildQueryParameters() {
      // Add each key in the model as a query parameter.
      for (let fqColName in this._model) {
        const col       = this._from._tableMetaList.availableCols.get(fqColName).column;
        const paramName = this._from.paramList.createParameterName(fqColName);
        let   paramVal  = this._model[fqColName];

        // The column may need to be transformed (e.g. from a boolean to a bit).
        if (col.converter.onSave)
          paramVal = col.converter.onSave(paramVal);

        // The params for the entire query are stored in the From instance's
        // ParameterList instance.  However, the update parameters are needed
        // independently so that the update string can be built (calling
        // ParameterList.createParameterName() bumps the parameter ID).  Hence
        // the param lookup.
        this._paramLookup[fqColName] = paramName;
        this._from.paramList.addParameter(paramName, paramVal);
      }
    }

    /**
     * Get the SET part of the query.
     * @return {string} The SET portion of the query, as a string.
     */
    getSetString() {
      const sets = [];

      for (let fqColName in this._model) {
        const colName  = this.escaper.escapeFullyQualifiedColumn(fqColName);
        const paramKey = this._paramLookup[fqColName];

        sets.push(`${colName} = :${paramKey}`);
      }

      if (sets.length ===0)
        return '';

      return 'SET\n' + sets.join(',\n');
    }

    /**
     * Create the UPDATE SQL statement.
     * @return {string} The UPDATE statement, as a SQL string.
     */
    toString() {
      const update = this._from.getFromString().replace(/^FROM  /, 'UPDATE');
      const joins  = this._from.getJoinString();
      const set    = this.getSetString();
      const where  = this._from.getWhereString();

      // No columns to update.
      if (set === '')
        return '';

      return [update, joins, set, where]
        .filter(part => part !== '')
        .join('\n');
    }

    /**
     * Execute the query.
     * @return {Promise<object>} A promise that shall be resolved with an
     * object containing an "affectedRows" property.  If an error occurs when
     * executing the query, the returned promise shall be rejected with the
     * error (unmodified).
     */
    execute() {
      const defer = deferred();
      const sql   = this.toString();

      // If there is nothing to update, resolve the promise.
      if (!sql)
        defer.resolve({affectedRows: 0});
      else {
        this.queryExecuter.update(sql, this._from.paramList.params, function(err, result) {
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

