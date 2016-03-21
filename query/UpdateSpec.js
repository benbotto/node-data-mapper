describe('Update test suite.', function()
{
  'use strict';

  var Update       = require('./Update');
  var From         = require('./From');
  var Database     = require('../database/Database');
  var MySQLEscaper = require('./MySQLEscaper');
  var db           = new Database(require('../spec/testDB'));
  var escaper      = new MySQLEscaper();
  var qryExec;

  beforeEach(function()
  {
    qryExec = jasmine.createSpyObj('qryExec', ['update']);
  });

  function getFrom(meta)
  {
    return new From(db, escaper, qryExec, meta);
  }

  describe('Update constructor test suite.', function()
  {
    // Checks the basic constructor.
    it('checks the basic constructor.', function()
    {
      expect(function()
      {
        new Update(getFrom('users'), {users: {first: 'Joe', last: 'Simpson'}});
      }).not.toThrow();

      expect(function()
      {
        new Update(getFrom('users'),
        {
          users: {first: 'Joe', last: 'Simpson'},
          products: {description: 'Nike Shoes'}
        });
      }).toThrowError('Table alias products is not available to be updated.');

      expect(function()
      {
        var from = getFrom('users')
          .innerJoin({table: 'phone_numbers', on: {$eq: {'users.userID':'phoneNumbers.userID'}}});

        new Update(from,
        {
          users: {first: 'Joe', last: 'Simpson'},
          phoneNumbers: {type: 'Mobile'}
        });
      }).not.toThrow();
    });

    // Checks the basic getters.
    it('checks the basic getters.', function()
    {
      var upd = new Update(getFrom('users'), {users: {first: 'Joe', last: 'Simpson'}});

      expect(upd.getDatabase()).toBe(db);
      expect(upd.getEscaper()).toBe(escaper);
      expect(upd.getQueryExecuter()).toBe(qryExec);
    });
  });

  describe('Update toString test suite.', function()
  {
    // Checks an empty model.
    it('checks an empty model.', function()
    {
      var upd = new Update(getFrom('users'), {users: {}});
      expect(upd.toString()).toBe('');
    });

    // Checks a model that has not table aliases.
    it('checks a model that has not table aliases.', function()
    {
      var upd = new Update(getFrom('users'), {});
      expect(upd.toString()).toBe('');
    });

    // Checks a single table update.
    it('checks a single table update.', function()
    {
      var upd = new Update(getFrom('users'), {users: {first: 'Joe'}});
      expect(upd.toString()).toBe
      (
        'UPDATE  `users` AS `users`\n' +
        'SET\n' +
        "`users`.`firstName` = 'Joe'"
      );

      upd = new Update(getFrom('users'), {users: {first: 'Joe', last: 'Smith'}});
      expect(upd.toString()).toBe
      (
        'UPDATE  `users` AS `users`\n' +
        'SET\n' +
        "`users`.`firstName` = 'Joe',\n" +
        "`users`.`lastName` = 'Smith'"
      );
    });

    // Checks an update with an aliased table.
    it('checks an update with an aliased table.', function()
    {
      var upd = new Update(getFrom({table: 'users', as: 'u'}), {u: {first: 'Joe'}});
      expect(upd.toString()).toBe
      (
        'UPDATE  `users` AS `u`\n' +
        'SET\n' +
        "`u`.`firstName` = 'Joe'"
      );
    });

    // Checks an update with a WHERE clause and joins.
    it('checks an update with a WHERE clause and joins.', function()
    {
      var from = getFrom('users')
        .innerJoin({table: 'phone_numbers', on: {$eq: {'users.userID':'phoneNumbers.userID'}}})
        .where({$eq: {'users.userID':12}});
      var upd = new Update(from,
        {
          users: {first: 'Steve', last: "O'Hare"},
          phoneNumbers: {phone: '222-333-4444', type: 'Mobile'}
        });
      
      expect(upd.toString()).toBe
      (
        'UPDATE  `users` AS `users`\n' +
        'INNER JOIN `phone_numbers` AS `phoneNumbers` ON `users`.`userID` = `phoneNumbers`.`userID`\n' +
        'SET\n' +
        "`users`.`firstName` = 'Steve',\n" +
        "`users`.`lastName` = 'O\\'Hare',\n" +
        "`phoneNumbers`.`type` = 'Mobile'\n" +
        'WHERE   `users`.`userID` = 12'
      );
    });

    // Checks an update with a WHERE clause, joins, and aliases.
    it('checks an update with a WHERE clause, joins, and aliases.', function()
    {
      var from = getFrom({table: 'users', as: 'u'})
        .innerJoin({table: 'phone_numbers', as: 'pn', on: {$eq: {'u.userID':'pn.userID'}}})
        .where({$eq: {'u.userID':12}});
      var upd = new Update(from,
        {
          u: {first: 'Steve', last: "O'Hare"},
          pn: {phone: '222-333-4444', type: 'Mobile'}
        });
      
      expect(upd.toString()).toBe
      (
        'UPDATE  `users` AS `u`\n' +
        'INNER JOIN `phone_numbers` AS `pn` ON `u`.`userID` = `pn`.`userID`\n' +
        'SET\n' +
        "`u`.`firstName` = 'Steve',\n" +
        "`u`.`lastName` = 'O\\'Hare',\n" +
        "`pn`.`type` = 'Mobile'\n" +
        'WHERE   `u`.`userID` = 12'
      );
    });
  });

  describe('Update execute test suite.', function()
  {
    // Updates a single model.
    it('updates a single model.', function()
    {
      var from = getFrom('users')
        .where({$eq: {'users.userID': 1}});
      var upd  = new Update(from, {users: {first: 'Joe', last: 'Simpson'}});

      upd.execute();
      expect(qryExec.update).toHaveBeenCalled();
    });

    // Checks that an empty update resolves with zero affected rows.
    it('checks that an empty update resolves with zero affected rows.', function()
    {
      var from = getFrom('users')
        .where({$eq: {'users.userID': 1}});
      var upd  = new Update(from, {users: {}});

      expect(upd.toString()).toBe('');

      upd.execute().then(function(result)
      {
        expect(result.affectedRows).toBe(0);
      });

      expect(qryExec.update).not.toHaveBeenCalled();
    });

    // Checks that the promise is resolved.
    it('checks that the promise is resolved.', function()
    {
      var upd = new Update(getFrom('users'), {users: {first: 'Joe'}});

      qryExec.update.and.callFake(function(query, callback)
      {
        var result = {affectedRows: 1};
        callback(null, result);
      });

      upd.execute().then(function(result)
      {
        expect(result.affectedRows).toBe(1);
      });

      expect(qryExec.update).toHaveBeenCalled();
    });

    // Checks that the promise is rejected.
    it('checks that the promise is rejected.', function()
    {
      var upd = new Update(getFrom('users'), {users: {first: 'Joe'}});

      qryExec.update.and.callFake(function(query, callback)
      {
        callback('FAIL');
      });

      upd.execute().catch(function(err)
      {
        expect(err).toBe('FAIL');
      });

      expect(qryExec.update).toHaveBeenCalled();
    });
  });
});

