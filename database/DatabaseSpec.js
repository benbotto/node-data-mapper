describe('Database test suite', function()
{
  'use strict';

  var Database = require('./Database');
  var Table    = require('./Table');
  var testDB   = require('../spec/testDB.json');

  describe('Database constructor test suite.', function()
  {
    // Checks the minimal constructor.
    it('checks the minimal constructor.', function()
    {
      var db = new Database({name: 'test'});
      expect(db.getName()).toBe('test');
      expect(db.getTables().length).toBe(0);
    });

    // Checks the constructor with an array of tables.
    it('checks the constructor with an array of tables.', function()
    {
      var db = new Database(testDB);

      expect(db.getName()).toBe('testDB');
      expect(db.getTables().length).toBe(2);
      expect(db.getTables()[0].getName()).toBe('users');
      expect(db.getTables()[1].getName()).toBe('phone_numbers');
    });
  });

  describe('Database tables test suite.', function()
  {
    var db;

    beforeEach(function()
    {
      db = new Database(testDB);
    });

    // Makes sure the tables exist.
    it('makes sure the tables exist.', function()
    {
      expect(db.getTableByName('users').getName()).toBe('users');
      expect(db.getTableByName('phone_numbers').getAlias()).toBe('phoneNumbers');
      expect(db.getTableByAlias('phoneNumbers').getName()).toBe('phone_numbers');
      expect(db.getTableByAlias('phoneNumbers')).toBe(db.getTableByName('phone_numbers'));

      expect(db.isTableName('users')).toBe(true);
      expect(db.isTableName('phone_numbers')).toBe(true);
      expect(db.isTableName('foo')).toBe(false);
      expect(db.isTableAlias('users')).toBe(true);
      expect(db.isTableAlias('phoneNumbers')).toBe(true);
      expect(db.isTableAlias('foo')).toBe(false);
    });

    // Adds a duplicate table.
    it('adds a duplicate table.', function()
    {
      expect(function()
      {
        db.addTable(testDB.tables[0]);
      }).toThrowError('Table users already exists in database testDB.');

      expect(function()
      {
        db.addTable({name: 'foo', alias: 'users', columns: testDB.tables[0].columns});
      }).toThrowError('Table alias users already exists in database testDB.');
    });

    // Tries to get an invalid table by name.
    it('tries to get an invalid table by name.', function()
    {
      expect(function()
      {
        db.getTableByName('INVALID_NAME');
      }).toThrowError('Table INVALID_NAME does not exist in database testDB.');
    });

    // Tries to get an invalid table by alias.
    it('tries to get an invalid table by alias.', function()
    {
      expect(function()
      {
        db.getTableByAlias('INVALID_ALIAS');
      }).toThrowError('Table alias INVALID_ALIAS does not exist in database testDB.');
    });

    // Makes sure that a table can be added as a Table instance.
    it('makes sure that a table can be added as a Table instance.', function()
    {
      var tbl = new Table({name: 'foo', columns: [{name: 'bar', isPrimary: true}]});
      expect(db.addTable(tbl)).toBe(db);
    });
  });
});
