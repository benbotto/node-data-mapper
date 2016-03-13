describe('From test suite.', function()
{
  'use strict';

  var From         = require('./From');
  var Database     = require('../database/Database');
  var MySQLEscaper = require('./MySQLEscaper');
  var db           = new Database(require('../spec/testDB'));
  var escaper      = new MySQLEscaper();
  var qryExec      = {};

  describe('From constructor test suite.', function()
  {
    // Checks the constructor.
    it('checks the constructor.', function()
    {
      expect(function()
      {
        new From(db, escaper, qryExec, {table: 'users'});
      }).not.toThrow();

      expect(function()
      {
        new From(db, escaper, qryExec, 'users');
      }).not.toThrow();

      expect(function()
      {
        new From(db, escaper, qryExec, {table: 'INVALID_NAME'});
      }).toThrowError('Table INVALID_NAME does not exist in database testDB.');
    });

    // Checks that the database can be retrieved.
    it('checks that the database can be retrieved.', function()
    {
      var from = new From(db, escaper, qryExec, {table: 'users'});
      expect(from.getDatabase()).toBe(db);
    });

    // Checks that the table alias cannot have non-word character characters.
    it('checks that the table alias cannot have non-word character characters.', function()
    {
      expect(function()
      {
        new From(db, escaper, qryExec, {table: 'users', as: 'users alias'});
      }).toThrowError('Alises must only contain word characters.');

      expect(function()
      {
        new From(db, escaper, qryExec, {table: 'users', as: 'users.alias'});
      }).toThrowError('Alises must only contain word characters.');
    });
  });

  describe('From where test suite.', function()
  {
    // Makes sure that the where clause gets added correctly.
    it('makes sure that the where clause gets added correctly.', function()
    {
      var query = new From(db, escaper, qryExec, {table: 'users'})
        .where({$eq: {'users.userID': 4}});

      expect(query.toString()).toBe
      (
        'FROM    `users` AS `users`\n' +
        'WHERE   `users`.`userID` = 4'
      );
    });

    // Makes sure that where cannot be called twice on the same query.
    it('makes sure that where cannot be called twice on the same query.', function()
    {
      expect(function()
      {
        new From(db, escaper, qryExec, {table: 'users'})
          .where({$eq: {'users.userID': 4}})
          .where({$eq: {'users.userID': 4}});
      }).toThrowError('where already performed on query.');
    });

    // Makes sure that invalid columns cannot exist in the where clause.
    it('makes sure that invalid columns cannot exist in the where clause.', function()
    {
      expect(function()
      {
        new From(db, escaper, qryExec, {table: 'users'})
          .where({$eq: {userID: 4}}); // Should be users.userID.
      }).toThrowError('The column alias userID is not available for a where condition.');
    });

    // Checks that parameters get replaced.
    it('checks that parameters get replaced.', function()
    {
      var query = new From(db, escaper, qryExec, {table: 'users'})
        .where({$eq: {'users.firstName':':firstName'}}, {firstName: 'Sally'});
      expect(query.toString()).toBe
      (
        'FROM    `users` AS `users`\n' +
        'WHERE   `users`.`firstName` = \'Sally\''
      );
    });
  });

  describe('From join test suite.', function()
  {
    // Inner joins on primary key.
    it('inner joins on primary key.', function()
    {
      var query = new From(db, escaper, qryExec, {table: 'users', as: 'u'})
        .innerJoin({table: 'phone_numbers', as: 'pn', parent: 'u', on: {$eq: {'u.userID':'pn.userID'}}});

      expect(query.toString()).toBe
      (
        'FROM    `users` AS `u`\n' +
        'INNER JOIN `phone_numbers` AS `pn` ON `u`.`userID` = `pn`.`userID`'
      );
    });

    // Makes sure that if the parent is passed that it is a valid table.
    it('makes sure that if the parent is passed that it is a valid table.', function()
    {
      expect(function()
      {
        new From(db, escaper, qryExec, 'users')
          .innerJoin({table: 'phone_numbers', as: 'pn', parent: 'BAD_NAME'});
      }).toThrowError('Parent table alias BAD_NAME is not a valid table alias.');
    });

    // Verifies that only available columns can be used in ON conditions.
    it('verifies that only available columns can be used in ON conditions.', function()
    {
      expect(function()
      {
        new From(db, escaper, qryExec, {table: 'users', as: 'u'})
          .innerJoin({table: 'phone_numbers', as: 'pn', parent: 'u', on: {$eq: {'u.INVALID':'pn.userID'}}});
      }).toThrowError('The column alias u.INVALID is not available for an on condition.');
    });

    // Checks a left outer join.
    it('checks a left outer join.', function()
    {
      var query = new From(db, escaper, qryExec, {table: 'users', as: 'u'})
        .leftOuterJoin({table: 'phone_numbers', as: 'pn', parent: 'u', on: {$eq: {'u.userID':'pn.userID'}}})
        .where({$is: {'pn.phoneNumberID':null}});

      expect(query.toString()).toBe
      (
        'FROM    `users` AS `u`\n' +
        'LEFT OUTER JOIN `phone_numbers` AS `pn` ON `u`.`userID` = `pn`.`userID`\n' +
        'WHERE   `pn`.`phoneNumberID` IS NULL'
      );
    });

    // Checks a right outer join.
    it('checks a right outer join.', function()
    {
      var query = new From(db, escaper, qryExec, {table: 'users', as: 'u'})
        .rightOuterJoin({table: 'phone_numbers', as: 'pn', parent: 'u', on: {$and: [{$eq: {'u.userID':'pn.userID'}},{$eq: {'pn.type':':phoneType'}}]}}, {phoneType: 'mobile'});

      expect(query.toString()).toBe
      (
        'FROM    `users` AS `u`\n' +
        'RIGHT OUTER JOIN `phone_numbers` AS `pn` ON (`u`.`userID` = `pn`.`userID` AND `pn`.`type` = \'mobile\')'
      );
    });

    // Checks a join with no condition.
    it('checks a join with no condition.', function()
    {
      var query = new From(db, escaper, qryExec, {table: 'users', as: 'u'})
        .innerJoin({table: 'phone_numbers', as: 'pn'});

      expect(query.toString()).toBe
      (
        'FROM    `users` AS `u`\n' +
        'INNER JOIN `phone_numbers` AS `pn`'
      );
    });
  });
});

