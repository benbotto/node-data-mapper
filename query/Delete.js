'use strict';

require('insulin').factory('ndm_Delete',
  ['deferred', 'ndm_Query', 'ndm_assert'], ndm_DeleteProducer);

function ndm_DeleteProducer(deferred, Query, assert) {
  /** A representation of a DELETE query. */
  class Delete extends Query {
    /**
     * Initialize the query.
     * @param {From} from - An instance of a From.
     * @param {string} tableAlias - The unique alias of the table from which
     * records will be deleted.  Optional, defaults to the alias of the from
     * table.
     */
    constructor(from, tableAlias) {
      super(from.database, from.escaper, from.queryExecuter);

      this._from = from;

      if (tableAlias) {
        // Alias provided.  Get the meta from the TableMetaList instance.
        assert(this._from._tableMetaList.tableMetas.has(tableAlias),
          `"${tableAlias}" is not a valid table alias.`);

        this._delTableMeta = this._from._tableMetaList.tableMetas.get(tableAlias);
      }
      else {
        // Use the FROM table.
        this._delTableMeta = this._from.getFromMeta();
      }
    }

    /**
     * Create the delete SQL.
     * @return {string} The SQL representation of the DELETE statement.
     */
    toString() {
      const fromAlias = this.escaper.escapeProperty(this._delTableMeta.as);
      const from      = this._from.toString();

      return `DELETE  ${fromAlias}\n${from}`;
    }

    /**
     * Execute the query.
     * @return {Promise} A promise instance that will be resolved with an
     * object.  The object will have an affectedRows property.  If there is a
     * failure executing the query, the returned promise will be rejected with
     * that error.
     */
    execute() {
      const defer = deferred();

      this.queryExecuter.delete(this.toString(),
        this._from.paramList.params, function(err, result){
        if (err)
          defer.reject(err);
        else
          defer.resolve({affectedRows: result.affectedRows});
      });

      return defer.promise;
    }
  }

  return Delete;
}

