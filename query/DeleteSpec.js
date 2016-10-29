xdescribe('Delete test suite.', function()
{
  'use strict';

  var Delete       = require('./Delete');
  var From         = require('./From');
  var Database     = require('../database/Database');
  var MySQLEscaper = require('./MySQLEscaper');
  var db           = new Database(require('../spec/testDB'));
  var escaper      = new MySQLEscaper();
  var qryExec;

  beforeEach(function()
  {
    qryExec = jasmine.createSpyObj('qryExec', ['delete']);
  });

  function getFrom(meta)
  {
    return new From(db, escaper, qryExec, meta);
  }

  xdescribe('Delete constructor test suite.', function()
  {
    // Checks the basic constructor.
    it('checks the basic constructor.', function()
    {
      expect(function()
      {
        new Delete(getFrom('users'));
      }).not.toThrow();

      expect(function()
      {
        new Delete(getFrom('users'), 'users');
      }).not.toThrow();
    });

    // Checks the basic getters.
    it('checks the basic getters.', function()
    {
      var del = new Delete(getFrom('users'));

      expect(del.getDatabase()).toBe(db);
      expect(del.getEscaper()).toBe(escaper);
      expect(del.getQueryExecuter()).toBe(qryExec);
    });
  });

  xdescribe('Delete toString test suite.', function()
  {
    // Checks the single-item delete string.
    it('checks the single-item delete string.', function()
    {
      var from = getFrom('users')
        .where({$eq: {'users.userID': 1}});
      var del = new Delete(from);

      expect(del.toString()).toBe
      (
        'DELETE  `users`\n' +
        'FROM    `users` AS `users`\n' +
        'WHERE   `users`.`userID` = 1'
      );
    });

    // Checks a delete with a join.
    it('checks a delete with a join.', function()
    {
      var from = getFrom('users')
        .innerJoin({table: 'phone_numbers', parent: 'users', on: {$eq: {'users.userID':'phoneNumbers.userID'}}})
        .where({$eq: {'users.userID': 1}});
      var del = new Delete(from);

      expect(del.toString()).toBe
      (
        'DELETE  `users`\n' +
        'FROM    `users` AS `users`\n' +
        'INNER JOIN `phone_numbers` AS `phoneNumbers` ON `users`.`userID` = `phoneNumbers`.`userID`\n' +
        'WHERE   `users`.`userID` = 1'
      );
    });

    // Checks that a related table can be deleted.
    it('checks that a related table can be deleted.', function()
    {
      var from = getFrom('users')
        .innerJoin({table: 'phone_numbers', parent: 'users', on: {$eq: {'users.userID':'phoneNumbers.userID'}}})
        .where({$eq: {'users.userID': 1}});
      var del = new Delete(from, 'phoneNumbers');

      expect(del.toString()).toBe
      (
        'DELETE  `phoneNumbers`\n' +
        'FROM    `users` AS `users`\n' +
        'INNER JOIN `phone_numbers` AS `phoneNumbers` ON `users`.`userID` = `phoneNumbers`.`userID`\n' +
        'WHERE   `users`.`userID` = 1'
      );
    });
  });

  xdescribe('Delete execute test suite.', function()
  {
    // Deletes a single model.
    it('deletes a single model.', function()
    {
      var from = getFrom('users')
        .where({$eq: {'users.userID': 1}});
      var del      = new Delete(from);

      del.execute();
      expect(qryExec.delete).toHaveBeenCalled();
    });

    // Checks that the promise is resolved.
    it('checks that the promise is resolved.', function()
    {
      var del = new Delete(getFrom('users'));

      qryExec.delete.and.callFake(function(query, callback)
      {
        var result = {affectedRows: 42};
        callback(null, result);
      });

      del.execute().then(function(result)
      {
        expect(result.affectedRows).toBe(42);
      });
    });

    // Checks that the promise is rejected.
    it('checks that the promise is rejected.', function()
    {
      var del = new Delete(getFrom('users'));

      qryExec.delete.and.callFake(function(query, callback)
      {
        callback('FAIL');
      });

      del.execute().catch(function(err)
      {
        expect(err).toBe('FAIL');
      });
    });
  });
});

