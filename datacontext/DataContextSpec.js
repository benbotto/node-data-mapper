describe('DataContext()', function() {
  'use strict';

  const insulin      = require('insulin');
  const DataContext  = insulin.get('ndm_DataContext');
  const MySQLEscaper = insulin.get('ndm_MySQLEscaper');
  const db           = insulin.get('ndm_testDB');
  const escaper      = new MySQLEscaper();
  const exec         = {};

  /**
   * Ctor.
   */
  describe('.constructor()', function() {
    it('stores the database, escaper, and executer.', function() {
      const dc = new DataContext(db, escaper, exec);

      expect(dc.database).toBe(db);
      expect(dc.escaper).toBe(escaper);
      expect(dc.queryExecuter).toBe(exec);
    });
  });

  /**
   * From.
   */
  describe('.from()', function() {
    it('is not implemented.', function() {
      expect(function() {
        new DataContext(db, escaper, exec).from({});
      }).toThrowError('from not implemented.');
    });
  });

  /**
   * Insert.
   */
  describe('.insert()', function() {
    it('is not implemented.', function() {
      expect(function() {
        new DataContext(db, escaper, exec).insert({});
      }).toThrowError('insert not implemented.');
    });
  });

  /**
   * Update.
   */
  describe('.update()', function() {
    it('is not implemented.', function() {
      expect(function() {
        new DataContext(db, escaper, exec).update({});
      }).toThrowError('update not implemented.');
    });
  });

  /**
   * Delete.
   */
  describe('.delete()', function() {
    it('is not implemented.', function() {
      expect(function() {
        new DataContext(db, escaper, exec).delete({});
      }).toThrowError('delete not implemented.');
    });
  });

  /**
   * End.
   */
  describe('.end()', function() {
    it('is not implemented.', function() {
      expect(function() {
        new DataContext(db, escaper, exec).end();
      }).toThrowError('end not implemented.');
    });
  });
});

