'use strict';

require('insulin').factory('ndm_Update',
  ['deferred', 'ndm_Query', 'ndm_assert'], ndm_UpdateProducer);

function ndm_UpdateProducer(deferred, Query, assert) {
  /**
   * A Query that represents an UPDATE.
   * @extends Query
   */
  class Update extends Query {
    /**
     * Initialize the Query.
     * @param {From} from - A From instance.
     * @param {object} model - An object containing key-value pairs.  Each key
     * must correspond to a fully-qualified column name, as created by the
     * Column.createFQColName() method
     * (&lt;table-alias&gt;.&lt;column-name&gt;), and each associated value is
     * the value to update in the database.
     */
    constructor(from, model) {
      super(from.database, from.escaper, from.queryExecuter);

      this._from  = from;
      this._model = model;

      // Make sure each key in the model maps to a FQ column name.
      for (let col in this._model) {
        assert(this._from._tableMetaList.isColumnAvailable(col),
          `Column "${col}" is not available for updating.`);
      }
    }

    /**
     * Get the SET part of the query.
     * @return {string} The SET portion of the query, as a string.
     */
    getSetString() {
      const sets = [];

      for (let fqColName in this._model) {
        const col     = this._from._tableMetaList.availableCols.get(fqColName).column;
        const colName = this.escaper.escapeFullyQualifiedColumn(fqColName);
        let   colVal  = this._model[fqColName];

        // The column may need to be transformed (e.g. from a boolean to a bit).
        if (col.converter.onSave)
          colVal = col.converter.onSave(colVal);
        colVal = this.escaper.escapeLiteral(colVal);

        sets.push(`${colName} = ${colVal}`);
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
        this.queryExecuter.update(sql, function(err, result) {
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

