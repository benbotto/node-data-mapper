'use strict';

require('insulin').factory('ndm_MySQLQueryExecuter',
  ['ndm_QueryExecuter'], ndm_MySQLQueryExecuterProducer);

function ndm_MySQLQueryExecuterProducer(QueryExecuter) {
  /**
   * A QueryExecuter extensions specialized for MySQL.
   */
  class MySQLQueryExecuter extends QueryExecuter {
    /**
     * Initialize the QueryExecuter instance.
     * @param {Object} pool - A MySQL connection pool instance (or a single
     * connection).  It is the user's responsibility to end the pool when the
     * application closes.
     */
    constructor(pool) {
      super();

      /**
       * A MySQL connection pool instance.
       * @type {Object}
       * @name MySQLQueryExecuter#pool
       * @see {@link https://github.com/mysqljs/mysql#pooling-connections}
       * @public
       */
      this.pool = pool;
    }

    /**
     * Execute a select query.
     * @param {string} query - The SQL to execute.
     * @param {QueryExecuter~selectCallback} callback - A callback function
     * that is called after the query is executed.
     * @return {void}
     */
    select(query, callback) {
      this.pool.query(query, callback);
    }

    /**
     * Execute an insert query.
     * @param {string} query - The SQL to execute.
     * @param {QueryExecuter~insertCallback} callback - A callback function
     * that is called after the query is executed.
     * @return {void}
     */
    insert(query, callback) {
      this.pool.query(query, callback);
    }

    /**
     * Execute an update query.
     * @param {string} query - The SQL to execute.
     * @param {QueryExecuter~mutateCallback} callback - A callback function
     * that is called after the query is executed.
     * @return {void}
     */
    update(query, callback) {
      this.pool.query(query, callback);
    }

    /**
     * Execute a delete query.
     * @param {string} query - The SQL to execute.
     * @param {QueryExecuter~mutateCallback} callback - A callback function
     * that is called after the query is executed.
     * @return {void}
     */
    delete(query, callback) {
      this.pool.query(query, callback);
    }
  }

  return MySQLQueryExecuter;
}

