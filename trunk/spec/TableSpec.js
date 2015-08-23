describe('Table test suite', function()
{
  'use strict';

  var Table   = require(__dirname + '/../Table');
  var Column  = require(__dirname + '/../Column');
  var users   = require(__dirname + '/resource/testDB.json').tables[0];

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

    // Checks that columns is required.
    it('checks that columns is required.', function()
    {
      expect(function()
      {
        new Table({name: 'foo'});
      }).toThrowError('columns is required.');
    });

    // Checks that the primary key is required.
    it('checks that the primary key is required.', function()
    {
      expect(function()
      {
        new Table({name: 'foo', columns: []});
      }).toThrowError('At least one column must be a primary key.');

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
  });
});

