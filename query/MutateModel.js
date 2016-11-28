'use strict';

require('insulin').factory('ndm_MutateModel',
  ['deferred', 'ndm_assert', 'ndm_From', 'ndm_Query', 'ndm_Column',
  'ndm_ModelTraverse'],
  ndm_MutateModelProducer);

function ndm_MutateModelProducer(deferred, assert, From, Query, Column, ModelTraverse) {
  /**
   * Base class for classes that mutate models by primary key (DeleteModel and
   * UpdateModel).
   * @extends Query
   */
  class MutateModel extends Query {
    /**
     * Initialize the instance.
     * @param {Database} database - The database to mutate from.
     * @param {Escaper} escaper - An instance of an Escaper matching the
     * database type (e.g. MySQLEscaper).
     * @param {QueryExecuter} queryExecuter - A QueryExecuter instance that
     * implements the mutate (update or delete) method.
     * @param {Object} model - A model object to mutate.  Each key in the
     * object should map to a table.  The value associated with the key should
     * be an object or an array of objects wherein each key maps to a column.
     * The primary key is required for each model.
     */
    constructor(database, escaper, queryExecuter, model) {
      super(database, escaper, queryExecuter);

      const traverse = new ModelTraverse();

      /**
       * An array of Query instances, one per model.
       * @type {Query[]}
       * @name MutateModel#queries
       * @public
       */
      this.queries = [];

      // Traverse the model, creating a Query instance for each.
      traverse.modelOnly(model,
        meta => this.queries.push(this.createQuery(meta)),
        this.database);
    }

    /**
     * Create a Query instance.  Subclasses should specialize this method, as
     * this only creates the From portion of the query.
     * @param {ModelTraverse~ModelMeta} meta - A meta object as created by the
     * modelTraverse class.
     * @return {Query} A Query instance representing the mutation query.
     */
    createQuery(meta) {
      const table  = this.database.getTableByMapping(meta.tableMapping);
      const from   = new From(this.database, this.escaper, this.queryExecuter, table.name);
      const where  = {$and: []};
      const params = {};

      table.primaryKey.forEach(function(pk) {
        // Each part of the PK is combined together in an AND'd WHERE condition.
        const fqColName = Column.createFQColName(table.name, pk.name);
        const pkCond    = {$eq: {[fqColName]: `:${fqColName}`}};

        where.$and.push(pkCond);

        // The primary key is required on each model.
        assert(meta.model[pk.mapTo],
          `Primary key not provided on model "${meta.tableMapping}."`);

        params[fqColName] = meta.model[pk.mapTo];
      });

      return from.where(where, params);
    }

    /**
     * Create the SQL for each query.
     * @return {string} A SQL string representing the mutation queries.
     */
    toString() {
      return this.queries
        .map(qry => qry.toString())
        .join(';\n\n');
    }

    /**
     * Execute the query.
     * @return {Promise<object>} A promise that will be resolved with an
     * object.  The object will have an affectedRows property.  If an error
     * occurs when executing a query, the promise shall be rejected with the
     * error unmodified.
     */
    execute() {
      const defer = deferred();
      const res   = {affectedRows: 0};
      const self  = this;

      // Execute one query at a time.  (Self-executing function.)
      (function processQuery() {
        // No more queries in the queue.  Resolve the promise.
        if (self.queries.length === 0) {
          defer.resolve(res);
          return;
        }

        // Get the next query in the queue and execute it.
        self.queries
          .shift()
          .execute()
          .then(function(result) {
            // Keep track of the total affected rows.
            res.affectedRows += result.affectedRows;

            // Recursively process the next query.
            processQuery();
          })
          .catch(function(err) {
            defer.reject(err);
          });
      })();

      return defer.promise;
    }
  }

  return MutateModel;
}

