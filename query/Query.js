'use strict';

require('insulin').factory('ndm_Query', ndm_QueryProducer);

function ndm_QueryProducer() {
  /** Base class for Queries (From, Insert, Delete, Update) */
  class Query {
    /**
     * Initialize the query.
     * @param {Database} database - A Database instance to query.
     * @param {Escaper} escaper - An instance of an Escaper matching the
     * database type (i.e.  MySQLEscaper or MSSQLEscaper).
     * @param {QueryExecuter} - queryExecuter A QueryExecuter instance.
     */
    constructor(database, escaper, queryExecuter) {
      /**
       * @property {Database} database - A database instance.
       * @property {Escaper} escaper - An instance of an Escaper class that can
       * escape query parts.
       * @property {QueryExecuter} queryExecuter - An instance of a
       * QueryExecuter that can execute CRUD operations.
       */
      this.database      = database;
      this.escaper       = escaper;
      this.queryExecuter = queryExecuter;
    }

    /**
     * @typedef Query~QueryMeta
     * @type {Object|Object[]}
     * @property {string} sql - The string representation of the query.
     * @property {Object} params - An object containing query parameters.
     * @property {Object=} modelMeta - An optional meta object containing extra
     * information about the model.
     */

    /**
     * Build the query.
     * @return {Query~QueryMeta} The string-representation of the query to
     * execute along with any query parameters.
     */
    buildQuery() {
      throw new Error('Query.buildQuery() not implemented.');
    }
  }

  return Query;
}

