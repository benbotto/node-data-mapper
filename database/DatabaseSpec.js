describe('Database()', function() {
  'use strict';

  const Database = require('./Database');
  const Table    = require('./Table');
  const testDB   = require('../spec/testDB');

  /**
   * Constructor.
   */
  describe('.constructor()', function() {
    let db;

    beforeEach(function() {
      db = new Database(testDB);
    });

    it('checks the minimal constructor.', function() {
      const db = new Database({name: 'test'});
      expect(db.name).toBe('test');
      expect(db.tables.length).toBe(0);
    });

    it('checks the constructor with no name.', function() {
      expect(function() {
        new Database({});
      }).toThrowError('Database name is required.');
    });

    it('checks the constructor with an array of tables.', function() {
      const db = new Database(testDB);

      expect(db.name).toBe('testDB');
      expect(db.tables.length).toBe(3);
      expect(db.tables[0].name).toBe('users');
      expect(db.tables[1].name).toBe('phone_numbers');
      expect(db.tables[2].name).toBe('products');
    });

    it('makes sure the tables exist.', function() {
      expect(db.getTableByName('users').name).toBe('users');
      expect(db.getTableByName('phone_numbers').mapTo).toBe('phoneNumbers');
      expect(db.getTableByMapping('phoneNumbers').name).toBe('phone_numbers');
      expect(db.getTableByMapping('phoneNumbers')).toBe(db.getTableByName('phone_numbers'));

      expect(db.isTableName('users')).toBe(true);
      expect(db.isTableName('phone_numbers')).toBe(true);
      expect(db.isTableName('foo')).toBe(false);
      expect(db.isTableMapping('users')).toBe(true);
      expect(db.isTableMapping('phoneNumbers')).toBe(true);
      expect(db.isTableMapping('foo')).toBe(false);
    });

    it('adds a duplicate table.', function() {
      expect(function() {
        db.addTable(testDB.tables[0]);
      }).toThrowError('Table users already exists in database testDB.');

      expect(function() {
        db.addTable({name: 'foo', mapTo: 'users', columns: testDB.tables[0].columns});
      }).toThrowError('Table mapping users already exists in database testDB.');
    });

    it('tries to get an invalid table by name.', function() {
      expect(function() {
        db.getTableByName('INVALID_NAME');
      }).toThrowError('Table INVALID_NAME does not exist in database testDB.');
    });

    it('tries to get an invalid table by mapping.', function() {
      expect(function() {
        db.getTableByMapping('INVALID_MAPPING');
      }).toThrowError('Table mapping INVALID_MAPPING does not exist in database testDB.');
    });

    it('makes sure that a table can be added as a Table instance.', function() {
      const tbl = new Table({name: 'foo', columns: [{name: 'bar', isPrimary: true}]});
      expect(db.addTable(tbl)).toBe(db);
    });
  });
});

