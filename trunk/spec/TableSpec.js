describe('Table test suite', function()
{
  'use strict';

  var Table  = require(__dirname + '/../Table');
  var Column = require(__dirname + '/../Column');

  // Checks the constructor.
  it('checks the constructor.', function()
  {
    var table = new Table('Test', 'TestAlias');

    expect(table.getName()).toBe('Test');
    expect(table.getAlias()).toBe('TestAlias');

    var table2 = new Table('Test');
    expect(table2.getName()).toBe('Test');
    expect(table2.getAlias()).toBe('Test');
  });

  describe('Table columns test suite', function()
  {
    var users;

    // Set up a dummy table.
    beforeEach(function()
    {
      users = new Table('users');

      users.addColumn(new Column('userID',    'ID'));
      users.addColumn(new Column('firstName', 'first'));
      users.addColumn(new Column('lastName',  'last'));
    });

    // Checks that three columns exist.
    it('checks that three columns exist.', function()
    {
      expect(users.getColumns().length).toBe(3);
      expect(users.getColumns()[0].getName()).toBe('userID');
      expect(users.getColumns()[1].getName()).toBe('firstName');
      expect(users.getColumns()[2].getName()).toBe('lastName');
    });

    // Tries to add a column that already exists.
    it('tries to add a column that already exists.', function()
    {
      expect(function()
      {
        users.addColumn(new Column('userID'));
      }).toThrowError('Column userID already exists in table users');
    });

    // Checks that columns can be retrieved by name.
    it('checks that columns can be retrieved by name.', function()
    {
      var userID    = users.getColumnByName('userID');
      var firstName = users.getColumnByName('firstName');
      var lastName  = users.getColumnByName('lastName');

      expect(userID.getName()).toBe('userID');
      expect(userID.getAlias()).toBe('ID');
      expect(firstName.getName()).toBe('firstName');
      expect(firstName.getAlias()).toBe('first');
      expect(lastName.getName()).toBe('lastName');
      expect(lastName.getAlias()).toBe('last');
    });

    // Checks that columns can be retrieved by alias.
    it('checks that columns can be retrieved by alias.', function()
    {
      var userID    = users.getColumnByAlias('ID');
      var firstName = users.getColumnByAlias('first');
      var lastName  = users.getColumnByAlias('last');

      expect(userID.getName()).toBe('userID');
      expect(userID.getAlias()).toBe('ID');
      expect(firstName.getName()).toBe('firstName');
      expect(firstName.getAlias()).toBe('first');
      expect(lastName.getName()).toBe('lastName');
      expect(lastName.getAlias()).toBe('last');
    });
  });
});
