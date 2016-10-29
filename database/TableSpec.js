describe('Table()', function() {
  'use strict';

  const Table  = require('./Table');
  const Column = require('./Column');
  const users  = require('../spec/testDB').tables[0];

  let usersTbl;

  beforeEach(function() {
    usersTbl = new Table(users);
  });

  /**
   * Ctor.
   */
  describe('.constructor()', function() {
    it('requires a name.', function() {
      expect(function() {
        new Table({});
      }).toThrowError('name is required.');
    });

    it('requires a primary key.', function() {
      expect(function() {
        new Table({
          name:    'foo',
          columns: [{name: 'firstName'}]
        });
      }).toThrowError('At least one column must be a primary key.');
    });

    it('requires columns.', function() {
      expect(function() {
        new Table({name: 'foo'});
      }).toThrowError('columns is required.');
    });

    it('can be constructed with a name and a primary key column.', function() {
      const table = new Table(users);

      expect(table.name).toBe('users');
      expect(table.mapTo).toBe('users');
      expect(table.primaryKey.length).toBe(1);
      expect(table.primaryKey[0].name).toEqual(users.columns[0].name);
    });

    it('allows a custom mapping.', function() {
      const table = new Table({
        name:    'Test',
        mapTo:   'tester',
        columns: users.columns
      });

      expect(table.name).toBe('Test');
      expect(table.mapTo).toBe('tester');
    });

    it('supports multiple primary keys.', function() {
      const cols  = users.columns.concat({name: 'pk2', isPrimary: true});
      const table = new Table({
        name:    'Test',
        columns: cols
      });

      expect(table.primaryKey.length).toBe(2);
      expect(table.primaryKey[0].name).toBe(cols[0].name);
      expect(table.primaryKey[1].name).toBe(cols[3].name);
    });
    
    it('stores Column instances.', function() {
      expect(usersTbl.columns.length).toBe(3);
      expect(usersTbl.columns[0].name).toBe('userID');
      expect(usersTbl.columns[1].name).toBe('firstName');
      expect(usersTbl.columns[2].name).toBe('lastName');
    });
  });

  /**
   * Get column by name.
   */
  describe('.getColumnByName()', function() {
    it('allows columns to be retrieved by name.', function() {
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

    it('throws when trying to retrieve a column using an invalid name.', function() {
      expect(function() {
        usersTbl.getColumnByName('INVALID_NAME');
      }).toThrowError('Column INVALID_NAME does not exist in table users.');
    });
  });

  /**
   * Get column by mapping.
   */
  describe('.getColumnByMapping()', function() {
    it('allows columns to be retrieved by mapping.', function() {
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

    it('throws when trying to retrieve a column using an invalid mapping.', function() {
      expect(function() {
        usersTbl.getColumnByMapping('INVALID');
      }).toThrowError('Column mapping INVALID does not exist in table users.');
    });
  });

  /**
   * Is column name.
   */
  describe('.isColumnName()', function() {
    it('can check if a column name matches a column.', function() {
      expect(usersTbl.isColumnName('userID')).toBe(true);
      expect(usersTbl.isColumnName('firstName')).toBe(true);
      expect(usersTbl.isColumnName('lastName')).toBe(true);
      expect(usersTbl.isColumnName('nope')).toBe(false);
    });
  });

  /**
   * Is column mapping.
   */
  describe('.isColumnMapping()', function() {
    it('can check if a column mapping matches a column.', function() {
      expect(usersTbl.isColumnMapping('ID')).toBe(true);
      expect(usersTbl.isColumnMapping('first')).toBe(true);
      expect(usersTbl.isColumnMapping('last')).toBe(true);
      expect(usersTbl.isColumnMapping('nope')).toBe(false);
    });
  });

  /**
   * Add column.
   */
  describe('.addColumn()', function() {
    it('prevents duplicate columns from being added.', function() {
      expect(function() {
        usersTbl.addColumn(new Column({name: 'userID'}));
      }).toThrowError('Column userID already exists in table users.');

      expect(function() {
        usersTbl.addColumn(new Column({name: 'foo', mapTo: 'ID'}));
      }).toThrowError('Column mapping ID already exists in table users.');
    });

    it('allows calls to be chained.', function() {
      expect(usersTbl.addColumn(new Column({name: 'surname'}))).toBe(usersTbl);
    });
  });
});

