'use strict';

require('insulin').factory('ndm_Delete',
  ['deferred', 'ndm_Query', 'ndm_assert'], ndm_DeleteProducer);

function ndm_DeleteProducer(deferred, Query, assert) {
  /** A representation of a DELETE query. */
  class Delete extends Query {
    /**
     * Initialize the query.
     * @param {From} from - An instance of a From.
     * @param {string} tableAlias - The alias of the table from which records
     * will be deleted.  Optional, defaults to the alias of the from table.
     */
    constructor(from, tableAlias) {
      super(from.getDatabase(), from.getEscaper(), from.getQueryExecuter());

      this._from         = from;
      this._delTableMeta = (tableAlias) ?
        this._from._tableAliasLookup[tableAlias] : this._from._tables[0];

      assert(this._delTableMeta,
        'Table alias ' + tableAlias + ' is not a valid table alias.');
    }

    /**
     * Create the delete SQL.
     */
    toString(){
      var fromAlias = this._escaper.escapeProperty(this._delTableMeta.tableAlias);
      var sql  = 'DELETE  ' + fromAlias + '\n';

      // Add the FROM (which includes the JOINS and WHERE).
      sql += this._from.toString();

      return sql;
    }

    /**
     * Execute the query.
     */
    execute(){
      var defer = deferred();

      this._queryExecuter.delete(this.toString(), function(err, result){
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

