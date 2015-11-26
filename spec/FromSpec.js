describe('From (SELECT query) test suite.', function()
{
  'use strict';

  var From         = require(__dirname + '/../query/From');
  var Database     = require(__dirname + '/../Database');
  var MySQLEscaper = require(__dirname + '/../query/MySQLEscaper');
  var db           = new Database(require(__dirname + '/resource/testDB.json'));
  var escaper      = new MySQLEscaper();

  // Checks the constructor.
  it('checks the constructor.', function()
  {
    expect(function()
    {
      new From(db, escaper, {table: 'users'});
    }).not.toThrow();

    expect(function()
    {
      new From(db, escaper, 'users');
    }).not.toThrow();

    expect(function()
    {
      new From(db, escaper, {table: 'INVALID_NAME'});
    }).toThrowError('Table INVALID_NAME does not exist in database testDB.');
  });

  // Checks that the table alias cannot have non-word character characters.
  it('checks that the table alias cannot have non-word character characters.', function()
  {
    expect(function()
    {
      new From(db, escaper, {table: 'users', as: 'users alias'});
    }).toThrowError('Alises must only contain word characters.');

    expect(function()
    {
      new From(db, escaper, {table: 'users', as: 'users.alias'});
    }).toThrowError('Alises must only contain word characters.');
  });

  describe('From select test suite.', function()
  {
    // Checks that a basic select without columns specified is correct.
    it('checks that a basic select without columns specified is correct.', function()
    {
      var query = new From(db, escaper, {table: 'users'});

      expect(query.toString()).toBe
      (
        'SELECT  `users`.`userID` AS `users.ID`, `users`.`firstName` AS `users.first`, `users`.`lastName` AS `users.last`\n' +
        'FROM    `users` AS `users`'
      );
    });

    // Checks that the table can be specified as a string.
    it('checks that the table can be specified as a string.', function()
    {
      var query = new From(db, escaper, 'users');

      expect(query.toString()).toBe
      (
        'SELECT  `users`.`userID` AS `users.ID`, `users`.`firstName` AS `users.first`, `users`.`lastName` AS `users.last`\n' +
        'FROM    `users` AS `users`'
      );
    });

    // Selects with a table alias.
    it('selects with a table alias.', function()
    {
      var query = new From(db, escaper, {table: 'users', as: 'admins'});

      expect(query.toString()).toBe
      (
        'SELECT  `admins`.`userID` AS `admins.ID`, `admins`.`firstName` AS `admins.first`, `admins`.`lastName` AS `admins.last`\n' +
        'FROM    `users` AS `admins`'
      );
    });
      
    // Checks that a basic select with columns specified is correct.
    it('checks that a basic select with columns specified is correct.', function()
    {
      var query = new From(db, escaper, {table: 'users'})
        .select(['users.userID', 'users.firstName', 'users.lastName']);

      expect(query.toString()).toBe
      (
        'SELECT  `users`.`userID` AS `users.ID`, `users`.`firstName` AS `users.first`, `users`.`lastName` AS `users.last`\n' +
        'FROM    `users` AS `users`'
      );
    });

    // Checks that select can be called variadicly.
    it('checks that select can be called variadicly.', function()
    {
      var query = new From(db, escaper, {table: 'users'})
        .select('users.userID', 'users.firstName', 'users.lastName');

      expect(query.toString()).toBe
      (
        'SELECT  `users`.`userID` AS `users.ID`, `users`.`firstName` AS `users.first`, `users`.`lastName` AS `users.last`\n' +
        'FROM    `users` AS `users`'
      );
    });

    // Checks that select cannot be run twice on the same from.
    it('checks that select cannot be run twice on the same from.', function()
    {
      expect(function()
      {
        new From(db, escaper, {table: 'users'})
          .select(['users.userID', 'users.firstName', 'users.lastName'])
          .select(['users.userID', 'users.firstName', 'users.lastName']);
      }).toThrowError('select already performed on query.');
    });

    // Tries to select an invalid column.
    it('tries to select an invalid column.', function()
    {
      expect(function()
      {
        new From(db, escaper, {table: 'users'}).select('userID'); // Should be users.userID.
      }).toThrowError('The column name userID is not available for selection.  ' +
        'Column names must be fully-qualified (<table-alias>.<column-name>).');
    });

    // Makes sure that the primary key is required when selecting.
    it('makes sure that the primary key is required when selecting.', function()
    {
      expect(function()
      {
        new From(db, escaper, {table: 'users'}).select('users.firstName');
      }).toThrowError('The primary key of each table must be selected, but the primary key of table users is not present in the array of selected columns.');
    });

    // Checks that columns can have custom aliases.
    it('checks that columns can have custom aliases.', function()
    {
      var query = new From(db, escaper, {table: 'users'})
        .select('users.userID', {column: 'users.firstName', as: 'name'});

      expect(query.toString()).toBe
      (
        'SELECT  `users`.`userID` AS `users.ID`, `users`.`firstName` AS `users.name`\n' +
        'FROM    `users` AS `users`'
      );
    });

    // Checks that the same alias cannot be specified twice.
    it('checks that the same alias cannot be specified twice.', function()
    {
      expect(function()
      {
        new From(db, escaper, {table: 'users'})
          .select('users.userID', {column: 'users.firstName', as: 'name'}, {column: 'users.lastName', as: 'name'});
      }).toThrowError('Column alias users.name already selected.');
    });
  });

  describe('From where test suite.', function()
  {
    // Makes sure that the where clause gets added correctly.
    it('makes sure that the where clause gets added correctly.', function()
    {
      var query = new From(db, escaper, {table: 'users'})
        .select('users.userID')
        .where({$eq: {'users.userID': 4}});

      expect(query.toString()).toBe
      (
        'SELECT  `users`.`userID` AS `users.ID`\n' +
        'FROM    `users` AS `users`\n' +
        'WHERE   `users`.`userID` = 4'
      );
    });

    // Makes sure that where cannot be called twice on the same query.
    it('makes sure that where cannot be called twice on the same query.', function()
    {
      expect(function()
      {
        new From(db, escaper, {table: 'users'})
          .where({$eq: {'users.userID': 4}})
          .where({$eq: {'users.userID': 4}});
      }).toThrowError('where already performed on query.');
    });

    // Makes sure that invalid columns cannot exist in the where clause.
    it('makes sure that invalid columns cannot exist in the where clause.', function()
    {
      expect(function()
      {
        new From(db, escaper, {table: 'users'})
          .where({$eq: {userID: 4}}); // Should be users.userID.
      }).toThrowError('The column alias userID is not available for a where condition.');
    });
  });

  describe('From join test suite.', function()
  {
    // Inner joins on primary key.
    it('inner joins on primary key.', function()
    {
      var query = new From(db, escaper, {table: 'users', as: 'u'})
        .innerJoin({table: 'phone_numbers', as: 'pn', on: {$eq: {'u.userID':'pn.userID'}}})
        .select('u.userID', 'pn.phoneNumberID');

      expect(query.toString()).toBe
      (
        'SELECT  `u`.`userID` AS `u.ID`, `pn`.`phoneNumberID` AS `pn.ID`\n' +
        'FROM    `users` AS `u`\n' +
        'INNER JOIN `phone_numbers` AS `pn` ON `u`.`userID` = `pn`.`userID`'
      );
    });

    // Verifies that only available columns can be used in ON conditions.
    it('verifies that only available columns can be used in ON conditions.', function()
    {
      expect(function()
      {
        new From(db, escaper, {table: 'users', as: 'u'})
          .innerJoin({table: 'phone_numbers', as: 'pn', on: {$eq: {'u.INVALID':'pn.userID'}}});
      }).toThrowError('The column alias u.INVALID is not available for an on condition.');
    });

    // Checks a left outer join.
    it('checks a left outer join.', function()
    {
      var query = new From(db, escaper, {table: 'users', as: 'u'})
        .leftOuterJoin({table: 'phone_numbers', as: 'pn', on: {$eq: {'u.userID':'pn.userID'}}})
        .where({$is: {'pn.phoneNumberID':null}})
        .select('u.userID', 'pn.phoneNumberID');

      expect(query.toString()).toBe
      (
        'SELECT  `u`.`userID` AS `u.ID`, `pn`.`phoneNumberID` AS `pn.ID`\n' +
        'FROM    `users` AS `u`\n' +
        'LEFT OUTER JOIN `phone_numbers` AS `pn` ON `u`.`userID` = `pn`.`userID`\n' +
        'WHERE   `pn`.`phoneNumberID` IS NULL'
      );
    });

    // Checks a right outer join.
    it('checks a right outer join.', function()
    {
      var query = new From(db, escaper, {table: 'users', as: 'u'})
        .rightOuterJoin({table: 'phone_numbers', as: 'pn', on: {$and: [{$eq: {'u.userID':'pn.userID'}},{$eq: {'pn.type':':mobile'}}]}})
        .select('u.userID', 'pn.phoneNumberID');

      expect(query.toString()).toBe
      (
        'SELECT  `u`.`userID` AS `u.ID`, `pn`.`phoneNumberID` AS `pn.ID`\n' +
        'FROM    `users` AS `u`\n' +
        'RIGHT OUTER JOIN `phone_numbers` AS `pn` ON (`u`.`userID` = `pn`.`userID` AND `pn`.`type` = :mobile)'
      );
    });

    // Checks a join with no condition.
    it('checks a join with no condition.', function()
    {
      var query = new From(db, escaper, {table: 'users', as: 'u'})
        .innerJoin({table: 'phone_numbers', as: 'pn'})
        .select('u.userID', 'pn.phoneNumberID');

      expect(query.toString()).toBe
      (
        'SELECT  `u`.`userID` AS `u.ID`, `pn`.`phoneNumberID` AS `pn.ID`\n' +
        'FROM    `users` AS `u`\n' +
        'INNER JOIN `phone_numbers` AS `pn`'
      );
    });
  });
});

