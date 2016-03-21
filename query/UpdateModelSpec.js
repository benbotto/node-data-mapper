describe('UpdateModel test suite.', function()
{
  'use strict';

  var UpdateModel  = require('./UpdateModel');
  var Database     = require('../database/Database');
  var MySQLEscaper = require('./MySQLEscaper');
  var db           = new Database(require('../spec/testDB'));
  var escaper      = new MySQLEscaper();
  var qryExec;

  beforeEach(function()
  {
    qryExec = jasmine.createSpyObj('qryExec', ['update']);
  });

  describe('UpdateModel toString test suite.', function()
  {
    // Checks that a model with nothing to update results in a blank query.
    it('checks that a model with nothing to update results in a blank query.', function()
    {
      var upd = new UpdateModel(db, escaper, qryExec, {users: {ID: 1}});
      expect(upd.toString()).toBe('');
    });

    // Checks that a single-model query is correct.
    it('checks that a single-model query is correct.', function()
    {
      var upd = new UpdateModel(db, escaper, qryExec,
      {
        users:
        {
          ID:    1,
          first: 'Joe',
          last:  'Smith'
        }
      });
      expect(upd.toString()).toBe
      (
        'UPDATE  `users` AS `users`\n' +
        'SET\n' +
        "`users`.`firstName` = 'Joe',\n" +
        "`users`.`lastName` = 'Smith'\n" +
        'WHERE   (`users`.`userID` = 1)'
      );
    });
  });

  describe('UpdateModel execute test suite.', function()
  {
    // Updates a single model.
    it('updates a single model.', function()
    {
      qryExec.update.and.callFake(function(query, callback)
      {
        callback(null, {affectedRows: 1});
      });

      new UpdateModel(db, escaper, qryExec, {users: {ID: 14, first: 'Joe'}})
        .execute()
        .then(function(result)
        {
          expect(result.affectedRows).toBe(1);
        });

      expect(qryExec.update).toHaveBeenCalled();
    });

    // Updates multiple models.
    it('updates multiple models.', function()
    {
      qryExec.update.and.callFake(function(query, callback)
      {
        callback(null, {affectedRows: 1});
      });

      new UpdateModel(db, escaper, qryExec, {users: [{ID: 14, first: 'Joe'}, {ID: 33, first: 'Sam'}]})
        .execute()
        .then(function(result)
        {
          expect(result.affectedRows).toBe(2);
        });

      expect(qryExec.update.calls.count()).toBe(2);
    });

    // Checks that an error can be caught.
    it('checks that an error can be caught.', function()
    {
      qryExec.update.and.callFake(function(query, callback)
      {
        callback('FAILURE');
      });

      new UpdateModel(db, escaper, qryExec, {users: {ID: 14, first: 'Joe'}})
        .execute()
        .catch(function(err)
        {
          expect(err).toBe('FAILURE');
        });

      expect(qryExec.update).toHaveBeenCalled();
    });
  });
});

