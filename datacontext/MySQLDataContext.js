'use strict';

require('insulin').factory('ndm_MySQLDataContext',
  ['ndm_DataContext', 'ndm_MySQLEscaper', 'ndm_MySQLQueryExecuter'],
  ndm_MySQLDataContextProducer);

function ndm_MySQLDataContextProducer(DataContext, MySQLEscaper, MySQLQueryExecuter) {
  /** 
   * A MySQL-specialized DataContext.
   * @extends DatContext
   */
  class MySQLDataContext extends DataContext {
    /**
     * @param {Database} database - A Database instance to query.
     * @param {Object} pool - A MySQL connection pool instance (or a single
     * connection).  It is the user's responsibility to end the pool when the
     * application closes.  See {@link
     * https://github.com/mysqljs/mysql#pooling-connections}
     */
    constructor(database, pool) {
      super(database, new MySQLEscaper(), new MySQLQueryExecuter(pool));
    }
  }

  return MySQLDataContext;
}

