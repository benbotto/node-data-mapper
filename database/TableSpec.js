describe('Table()', function() {
  'use strict';

  const Table  = require('./Table');
  const Column = require('./Column');
  const users  = require('../spec/testDB').tables[0];

  /**
   * Ctor.
   */
  describe('.constructor()', function() {
    it('checks that name is required.', function() {
      expect(function() {
        new Table({});
      }).toThrowError('name is required.');
    });

    it('checks that the primary key is required.', function() {
      expect(function() {
        new Table({
          name:    'foo',
          columns: [{name: 'firstName'}]
        });
      }).toThrowError('At least one column must be a primary key.');
    });

    it('checks the minimal constructor.', function() {
      const table = new Table(users);

      expect(table.name).toBe('users');
      expect(table.mapTo).toBe('users');
      expect(table.primaryKey.length).toBe(1);
      expect(table.primaryKey[0].name).toEqual(users.columns[0].name);
    });

    it('checks that columns is required.', function() {
      expect(function() {
        new Table({name: 'foo'});
      }).toThrowError('columns is required.');
    });

    it('checks the constructor with a mapping.', function() {
      const table = new Table({
        name:    'Test',
        mapTo:   'tester',
        columns: users.columns
      });

      expect(table.name).toBe('Test');
      expect(table.mapTo).toBe('tester');
    });

    it('checks the constructor with multiple primary keys.', function() {
      const cols  = users.columns.concat({name: 'pk2', isPrimary: true});
      const table = new Table({
        name:    'Test',
        columns: cols
      });

      expect(table.primaryKey.length).toBe(2);
      expect(table.primaryKey[0].name).toBe(cols[0].name);
      expect(table.primaryKey[1].name).toBe(cols[3].name);
    });
  });

  /**
   * Columns.
   */
  describe('Table columns test suite', function() {
    let usersTbl;

    beforeEach(function() {
      usersTbl = new Table(users);
    });

    it('checks that three columns exist.', function() {
      expect(usersTbl.columns.length).toBe(3);
      expect(usersTbl.columns[0].name).toBe('userID');
      expect(usersTbl.columns[1].name).toBe('firstName');
      expect(usersTbl.columns[2].name).toBe('lastName');
    });

    it('tries to add a column that already exists.', function() {
      expect(function() {
        usersTbl.addColumn(new Column({name: 'userID'}));
      }).toThrowError('Column userID already exists in table users.');

      expect(function() {
        usersTbl.addColumn(new Column({name: 'foo', mapTo: 'ID'}));
      }).toThrowError('Column mapping ID already exists in table users.');
    });

    it('checks that columns can be retrieved by name.', function() {
      const userID    = usersTbl.getColumnByName('userID');
      const firstName = usersTbl.getColumnByName('firstName');
      const lastName  = usersTbl.getColumnByName('lastName');

      expect(userID.name).toBe('userID');
      expect(userID.mapTo).toBe('ID');
      expect(firstName.name).toBe('firstName');
      expect(firstName.mapTo).toBe('first');
      expect(lastName.name).toBe('lastName');
      expect(lastName.mapTo).toBe('last');
    });

    it('tries to retrieve an invalid column by name.', function() {
      expect(function() {
        usersTbl.getColumnByName('INVALID_NAME');
      }).toThrowError('Column INVALID_NAME does not exist in table users.');
    });

    it('checks that columns can be retrieved by mapping.', function() {
      const userID    = usersTbl.getColumnByMapping('ID');
      const firstName = usersTbl.getColumnByMapping('first');
      const lastName  = usersTbl.getColumnByMapping('last');

      expect(userID.name).toBe('userID');
      expect(userID.mapTo).toBe('ID');
      expect(firstName.name).toBe('firstName');
      expect(firstName.mapTo).toBe('first');
      expect(lastName.name).toBe('lastName');
      expect(lastName.mapTo).toBe('last');
    });

    it('tries to retrieve an invalid column by mapping.', function() {
      expect(function() {
        usersTbl.getColumnByMapping('INVALID');
      }).toThrowError('Column mapping INVALID does not exist in table users.');
    });

    it('makes sure that addColumn returns this (the table).', function() {
      expect(usersTbl.addColumn(new Column({name: 'surname'}))).toBe(usersTbl);
    });

    it('checks the isColumnName function.', function() {
      expect(usersTbl.isColumnName('userID')).toBe(true);
      expect(usersTbl.isColumnName('firstName')).toBe(true);
      expect(usersTbl.isColumnName('lastName')).toBe(true);
      expect(usersTbl.isColumnName('nope')).toBe(false);
    });

    it('checks the isColumnMapping function.', function() {
      expect(usersTbl.isColumnMapping('ID')).toBe(true);
      expect(usersTbl.isColumnMapping('first')).toBe(true);
      expect(usersTbl.isColumnMapping('last')).toBe(true);
      expect(usersTbl.isColumnMapping('nope')).toBe(false);
    });
  });
});

