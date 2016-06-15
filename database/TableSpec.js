describe('Table test suite', function()
{
  'use strict';

  var Table  = require('./Table');
  var Column = require('./Column');
  var users  = require('../spec/testDB').tables[0];

  describe('Table constructor test suite.', function()
  {
    // Checks that name is required.
    it('checks that name is required.', function()
    {
      expect(function()
      {
        new Table({});
      }).toThrowError('name is required.');
    });

    // Checks that the primary key is required.
    it('checks that the primary key is required.', function()
    {
      expect(function()
      {
        new Table
        ({
          name:    'foo',
          columns: [{name: 'firstName', alias: 'first'}]
        });
      }).toThrowError('At least one column must be a primary key.');
    });

    // Checks the minimal constructor.
    it('checks the minimal constructor.', function()
    {
      var table = new Table(users);

      expect(table.getName()).toBe('users');
      expect(table.getAlias()).toBe('users');
      expect(table.getPrimaryKey().length).toBe(1);
      expect(table.getPrimaryKey()[0].getName()).toEqual(users.columns[0].name);
    });

    // Checks that columns is required.
    it('checks that columns is required.', function()
    {
      expect(function()
      {
        new Table({name: 'foo'});
      }).toThrowError('columns is required.');
    });

    // Checks the constructor with an alias.
    it('checks the constructor with an alias.', function()
    {
      var table = new Table
      ({
        name:    'Test',
        alias:   'TestAlias',
        columns: users.columns
      });

      expect(table.getName()).toBe('Test');
      expect(table.getAlias()).toBe('TestAlias');
      expect(table.getPrimaryKey().length).toBe(1);
      expect(table.getPrimaryKey()[0].getName()).toBe(users.columns[0].name);
    });

    // Checks the constructor with multiple primary keys.
    it('checks the constructor with multiple primary keys.', function()
    {
      var cols  = users.columns.concat({name: 'pk2', isPrimary: true});
      var table = new Table
      ({
        name:    'Test',
        columns: cols
      });

      expect(table.getPrimaryKey().length).toBe(2);
      expect(table.getPrimaryKey()[0].getName()).toBe(cols[0].name);
      expect(table.getPrimaryKey()[1].getName()).toBe(cols[3].name);
    });
  });

  describe('Table columns test suite', function()
  {
    var usersTbl;

    // Set up a dummy table.
    beforeEach(function()
    {
      usersTbl = new Table(users);
    });

    // Checks that three columns exist.
    it('checks that three columns exist.', function()
    {
      expect(usersTbl.getColumns().length).toBe(3);
      expect(usersTbl.getColumns()[0].getName()).toBe('userID');
      expect(usersTbl.getColumns()[1].getName()).toBe('firstName');
      expect(usersTbl.getColumns()[2].getName()).toBe('lastName');
    });

    // Tries to add a column that already exists.
    it('tries to add a column that already exists.', function()
    {
      expect(function()
      {
        usersTbl.addColumn(new Column({name: 'userID'}));
      }).toThrowError('Column userID already exists in table users.');

      expect(function()
      {
        usersTbl.addColumn(new Column({name: 'foo', alias: 'ID'}));
      }).toThrowError('Column alias ID already exists in table users.');
    });

    // Checks that columns can be retrieved by name.
    it('checks that columns can be retrieved by name.', function()
    {
      var userID    = usersTbl.getColumnByName('userID');
      var firstName = usersTbl.getColumnByName('firstName');
      var lastName  = usersTbl.getColumnByName('lastName');

      expect(userID.getName()).toBe('userID');
      expect(userID.getAlias()).toBe('ID');
      expect(firstName.getName()).toBe('firstName');
      expect(firstName.getAlias()).toBe('first');
      expect(lastName.getName()).toBe('lastName');
      expect(lastName.getAlias()).toBe('last');
    });

    // Tries to retrieve an invalid column by name.
    it('tries to retrieve an invalid column by name.', function()
    {
      expect(function()
      {
        usersTbl.getColumnByName('INVALID_NAME');
      }).toThrowError('Column INVALID_NAME does not exist in table users.');
    });

    // Checks that columns can be retrieved by alias.
    it('checks that columns can be retrieved by alias.', function()
    {
      var userID    = usersTbl.getColumnByAlias('ID');
      var firstName = usersTbl.getColumnByAlias('first');
      var lastName  = usersTbl.getColumnByAlias('last');

      expect(userID.getName()).toBe('userID');
      expect(userID.getAlias()).toBe('ID');
      expect(firstName.getName()).toBe('firstName');
      expect(firstName.getAlias()).toBe('first');
      expect(lastName.getName()).toBe('lastName');
      expect(lastName.getAlias()).toBe('last');
    });

    // Tries to retrieve an invalid column by alias.
    it('tries to retrieve an invalid column by alias.', function()
    {
      expect(function()
      {
        usersTbl.getColumnByAlias('INVALID_ALIAS');
      }).toThrowError('Column alias INVALID_ALIAS does not exist in table users.');
    });

    // Makes sure that addColumn returns this (the table)
    it('makes sure that addColumn returns this (the table).', function()
    {
      expect(usersTbl.addColumn(new Column({name: 'surname'}))).toBe(usersTbl);
    });

    // Checks the isColumnName function.
    it('checks the isColumnName function.', function()
    {
      expect(usersTbl.isColumnName('userID')).toBe(true);
      expect(usersTbl.isColumnName('firstName')).toBe(true);
      expect(usersTbl.isColumnName('lastName')).toBe(true);
      expect(usersTbl.isColumnName('nope')).toBe(false);
    });

    // Checks the isColumnAlias function.
    it('checks the isColumnAlias function.', function()
    {
      expect(usersTbl.isColumnAlias('ID')).toBe(true);
      expect(usersTbl.isColumnAlias('first')).toBe(true);
      expect(usersTbl.isColumnAlias('last')).toBe(true);
      expect(usersTbl.isColumnAlias('nope')).toBe(false);
    });
  });

  describe('Table toObject test suite.', function()
  {
    // Converts the users table to an object.
    it('converts the users table to an object.', function()
    {
      var usersTbl = new Table(users);
      expect(usersTbl.toObject()).toEqual
      ({
        name: 'users',
        alias: 'users',
        columns:
        [
          {
            name: 'userID',
            alias: 'ID',
            isPrimary: true,
            converter: {},
            isNullable: true,
            dataType: null,
            maxLength: null,
            defaultValue: null
          },
          {
            name: 'firstName',
            alias: 'first',
            isPrimary: false,
            converter: {},
            isNullable: true,
            dataType: null,
            maxLength: null,
            defaultValue: null
          },
          {
            name: 'lastName',
            alias: 'last',
            isPrimary: false,
            converter: {},
            isNullable: true,
            dataType: null,
            maxLength: null,
            defaultValue: null
          }
        ]
      });
    });
  });

  describe('Table clone test suite.', function()
  {
    // Clones a table.
    it('clones a table.', function()
    {
      var table = new Table(users);
      var clone = table.clone();

      expect(table.toObject()).toEqual(clone.toObject());
    });
  });
});

