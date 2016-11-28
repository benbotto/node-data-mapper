describe('MySQLDataContext()', function() {
  'use strict';

  const insulin          = require('insulin');
  const MySQLDataContext = insulin.get('ndm_MySQLDataContext');
  const db               = insulin.get('ndm_testDB');
  const pool             = {};

  /**
   * Ctor.
   */
  describe('.constructor()', function() {
    it('extends DataContext.', function() {
      const dc          = new MySQLDataContext(db, pool);
      const DataContext = insulin.get('ndm_DataContext');

      expect(dc instanceof DataContext).toBe(true);
    });

    it('passes the pool to the MySQLQueryExecuter constructor.', function() {
      const dc = new MySQLDataContext(db, pool);
      expect(dc.queryExecuter.pool).toBe(pool);
    });
  });
});
