'use strict';

require('insulin').factory('ndm_Insert',
  ['deferred', 'ndm_ModelTraverse', 'ndm_Query'],
  ndm_InsertProducer);

function ndm_InsertProducer(deferred, ModelTraverse, Query) {
  /**
   * A Query class that represents an INSERT query.  Instances of the class can
   * be used to insert models in a database.
   * @extends Query
   */
  class Insert extends Query {
    /**
     * Initialize the Query.
     * @param {Database} database - A Database instance that will be queried.
     * @param {Escaper} escaper - An instance of an Escaper matching the
     * database type (i.e.  MySQLEscaper or MSSQLEscaper).
     * @param {QueryExecuter} queryExecuter - A QueryExecuter instance.
     * @param {Object} model - A model object to insert.  Each key in the
     * object should map to a table.  The value associated with the key should
     * be an object or an array of objects wherein each key maps to a column.
     */
    constructor(database, escaper, queryExecuter, model) {
      super(database, escaper, queryExecuter);

      this._model = model;
    }

    /**
     * Create the SQL string.
     * @return {string} A SQL representation of the INSERT query, as a string.
     */
    toString() {
      const queries = this.buildQuery();

      return queries
        .map(q => q.sql)
        .join(';\n\n');
    }

    /**
     * Execute the query.
     * @return {Promise<Object>} A promise that shall be resolved with the
     * model.  If the underlying queryExecuter returns the insertId of the
     * model, the model will be updated with the ID.  If an error occurs during
     * execution, the promise shall be rejected with the error (unmodified).
     */
    execute() {
      const self      = this;
      const defer     = deferred();
      const queryData = this.buildQuery();

      // The queryData are executed in order.  processQuery() grabs the first query
      // out of the queryData queue, executes it, and removes it from the array.
      // The result of the query is passed to processQueryResult(), which in
      // turn fires processQuery.  When the queue of queryData is empty, the
      // defered is resolved.
      // If an error occurs at any point, the deferred is rejected and processing
      // halts.
      processQuery();

      // Process the first query in the queryData queue.
      function processQuery() {
        let queryDatum;

        if (queryData.length === 0) {
          defer.resolve(self._model);
          return;
        }

        queryDatum = queryData.shift();
        self.queryExecuter.insert(queryDatum.sql, queryDatum.params, processQueryResult);

        // Handle the query execution result by adding the new resource ID, if
        // present.
        function processQueryResult(err, result) {
          if (err) {
            defer.reject(err);
            return;
          }

          // If there is an auto-generated ID, set it on the model.
          if (result.insertId) {
            const tbl   = self.database.getTableByMapping(queryDatum.modelMeta.tableMapping);
            const pkMap = tbl.primaryKey[0].mapTo;

            queryDatum.modelMeta.model[pkMap] = result.insertId;
          }

          processQuery();
        }
      }

      // A promise is returned.  It will be resolved with the updated models.
      return defer.promise;
    }
  }

  return Insert;
}

