describe('DataContext()', function() {
  'use strict';

  const insulin      = require('insulin');
  const DataContext  = insulin.get('ndm_DataContext');
  const MySQLEscaper = insulin.get('ndm_MySQLEscaper');
  const db           = insulin.get('ndm_testDB');
  const escaper      = new MySQLEscaper();
  const exec         = {};

  // Helper function to "clone" the db instance.
  // TODO: Remove me when refactored.
  function cloneDB() {
    const Database = insulin.get('ndm_Database');

    return new Database(JSON.parse(JSON.stringify(db)));
  }

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
        new DataContext(db, escaper).from({});
      }).toThrowError('from not implemented.');
    });
  });

  /**
   * Insert.
   */
  describe('.insert()', function() {
    it('is not implemented.', function() {
      expect(function() {
        new DataContext(db, escaper).insert({});
      }).toThrowError('insert not implemented.');
    });
  });

  /**
   * Update.
   */
  describe('.update()', function() {
    it('is not implemented.', function() {
      expect(function() {
        new DataContext(db, escaper).update({});
      }).toThrowError('update not implemented.');
    });
  });

  /**
   * Delete.
   */
  describe('.delete()', function() {
    it('returns a DeleteModel instance.', function() {
      const dc          = new DataContext(db, escaper);
      const del         = dc.delete({});
      const DeleteModel = insulin.get('ndm_DeleteModel');

      expect(del instanceof DeleteModel).toBe(true);
    });

    it('accepts an optional database argument, and passes it to the DeleteModel ctor.', function() {
      const dc  = new DataContext(db, escaper);
      const db2 = cloneDB();
      const del = dc.delete({}, db2);

      expect(del.database).toBe(db2);
    });
  });
});

