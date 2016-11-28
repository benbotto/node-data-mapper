'use strict';

require('insulin').factory('ndm_QueryExecuter', ndm_QueryExecuterProducer);

function ndm_QueryExecuterProducer() {
  /**
   * A base interface for QueryExecuters.  Classes implementing this interface
   * must implement select, insert, delete, and update methods.
   */
  class QueryExecuter {

    /**
     * A callback function that is fired after a select query is executed.
     * @callback QueryExecuter~selectCallback
     * @param {Error} error - An Error instance, or null if no error occurs.
     * @param {Object[]} results - An array of results, as objects, wherein
     * each key corresonds to a column.
     */

    /**
     * Execute a select query.
     * @param {string} query - The SQL to execute.
     * @param {QueryExecuter~selectCallback} callback - A callback function
     * that is called after the query is executed.
     * @return {void}
     */
    select() {
      throw new Error('QueryExecuter::select not implemented.');
    }

    /**
     * A callback function that is fired after an insert query is executed.
     * @callback QueryExecuter~insertCallback
     * @param {Error} error - An Error instance, or null if no error occurs.
     * @param {Object} result - An object that has an insertId property that
     * corresponds to the identifier of the newly inserted record, if
     * available.
     */

    /**
     * Execute an insert query.
     * @param {string} query - The SQL to execute.
     * @param {QueryExecuter~insertCallback} callback - A callback function
     * that is called after the query is executed.
     * @return {void}
     */
    insert() {
      throw new Error('QueryExecuter::insert not implemented.');
    }

    /**
     * A callback function that is fired after an update or delete query is
     * executed.
     * @callback QueryExecuter~mutateCallback
     * @param {Error} error - An Error instance, or null if no error occurs.
     * @param {Object} result - An object that has an affectedRows property,
     * indicating the number of rows affected (changed) by the query.
     */

    /**
     * Execute an update query.
     * @param {string} query - The SQL to execute.
     * @param {QueryExecuter~mutateCallback} callback - A callback function
     * that is called after the query is executed.
     * @return {void}
     */
    update() {
      throw new Error('QueryExecuter::update not implemented.');
    }

    /**
     * Execute a delete query.
     * @param {string} query - The SQL to execute.
     * @param {QueryExecuter~mutateCallback} callback - A callback function
     * that is called after the query is executed.
     * @return {void}
     */
    delete() {
      throw new Error('QueryExecuter::delete not implemented.');
    }
  }

  return QueryExecuter;
}

