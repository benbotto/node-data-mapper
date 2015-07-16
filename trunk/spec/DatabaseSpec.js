describe('Database test suite', function()
{
  'use strict';

  var Database = require(__dirname + '/../Database');
  var Table    = require(__dirname + '/../Table');
  var db;

  beforeEach(function()
  {
    db = new Database({name: 'test'});
  });

  // Checks the constructor.
  it('checks the constructor.', function()
  {
    expect(db.getName()).toBe('test');
  });

  // Adds some tables.
  it('adds some tables.', function()
  {
    var users        = new Table({name: 'users'});
    var phoneNumbers = new Table({name: 'phone_numbers', alias: 'phoneNumbers'});

    expect(db.addTable(users).addTable(phoneNumbers)).toBe(db);

    expect(db.getTableByName('users')).toBe(users);
    expect(db.getTableByName('phone_numbers')).toBe(phoneNumbers);
    expect(db.getTableByAlias('phoneNumbers')).toBe(phoneNumbers);
  });

  // Adds a duplicate table.
  it('adds a duplicate table.', function()
  {
    var users = new Table({name: 'users'});
    var foo   = new Table({name: 'foo', alias: 'users'});

    db.addTable(users);

    expect(function()
    {
      db.addTable(users);
    }).toThrowError('Table users already exists in database test.');

    expect(function()
    {
      db.addTable(foo);
    }).toThrowError('Table alias users already exists in database test.');
  });
});
