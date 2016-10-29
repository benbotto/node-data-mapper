xdescribe('DeleteModel test suite.', function()
{
  'use strict';

  var DeleteModel  = require('./DeleteModel');
  var Database     = require('../database/Database');
  var MySQLEscaper = require('./MySQLEscaper');
  var db           = new Database(require('../spec/testDB'));
  var escaper      = new MySQLEscaper();
  var qryExec;

  beforeEach(function()
  {
    qryExec = jasmine.createSpyObj('qryExec', ['delete']);
  });

  xdescribe('DeleteModel toString test suite.', function()
  {
    // Checks that a single-model query is correct.
    it('checks that a single-model query is correct.', function()
    {
      var del = new DeleteModel(db, escaper, qryExec, {users: {ID: 1}});

      expect(del.toString()).toBe
      (
        'DELETE  `users`\n' +
        'FROM    `users` AS `users`\n' +
        'WHERE   (`users`.`userID` = 1)'
      );
    });

    // If one works, multiple will work.  A multi-model spec is in
    // MutateModelSpec.js.
  });

  xdescribe('DeleteModel execute test suite.', function()
  {
    // Deletes a single model.
    it('deletes a single model.', function()
    {
      qryExec.delete.and.callFake(function(query, callback)
      {
        callback(null, {affectedRows: 1});
      });

      new DeleteModel(db, escaper, qryExec, {users: {ID: 14}})
        .execute()
        .then(function(result)
        {
          expect(result.affectedRows).toBe(1);
        });

      expect(qryExec.delete).toHaveBeenCalled();
    });

    // Deletes multiple models.
    it('deletes multiple models.', function()
    {
      qryExec.delete.and.callFake(function(query, callback)
      {
        callback(null, {affectedRows: 1});
      });

      new DeleteModel(db, escaper, qryExec, {users: [{ID: 14}, {ID: 33}]})
        .execute()
        .then(function(result)
        {
          expect(result.affectedRows).toBe(2);
        });

      expect(qryExec.delete.calls.count()).toBe(2);
    });

    // Checks that an error can be caught.
    it('checks that an error can be caught.', function()
    {
      qryExec.delete.and.callFake(function(query, callback)
      {
        callback('FAILURE');
      });

      new DeleteModel(db, escaper, qryExec, {users: [{ID: 14}, {ID: 33}]})
        .execute()
        .catch(function(err)
        {
          expect(err).toBe('FAILURE');
        });

      expect(qryExec.delete).toHaveBeenCalled();
    });
  });
});

