describe('Query()', function()
{
  'use strict';

  const insulin = require('insulin');
  const Query   = insulin.get('ndm_Query');

  /**
   * Ctor.
   */
  describe('.constructor()', function() {
    it('stores the database, escaper, and executer.', function() {
      const db       = {};
      const escaper  = {};
      const executer = {};
      const q        = new Query(db, escaper, executer);

      expect(q.database).toBe(db);
      expect(q.escaper).toBe(escaper);
      expect(q.queryExecuter).toBe(executer);
    });
  });

  /**
   * Build query.
   */
  describe('buildQuery()', function() {
    it('is not implemented.', function() {
      const db       = {};
      const escaper  = {};
      const executer = {};
      const q        = new Query(db, escaper, executer);

      expect(function() {
        q.buildQuery();
      }).toThrowError('Query.buildQuery() not implemented.');
    });
  });
});

