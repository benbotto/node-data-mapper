describe('DeleteModel test suite.', function()
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

  describe('DeleteModel constructor test suite.', function()
  {
    // Checks that the primary key for each model is required.
    it('checks that the primary key for each model is required.', function()
    {
      expect(function()
      {
        new DeleteModel(db, escaper, qryExec, {users: {ID: 1}});
      }).not.toThrow();

      expect(function()
      {
        new DeleteModel(db, escaper, qryExec, {users: {firstName: 'Joe'}});
      }).toThrowError('Primary key not provided on model users.');
    });
  });

  describe('DeleteModel toString test suite.', function()
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

    // Checks a single model with a string for a primary key.
    it('checks a single model with a string for a primary key.', function()
    {
      var db2 = new Database
      ({
        name: 'testDB',
        tables:
        [
          {
            name: 'example',
            columns:
            [
              {
                name: 'ex',
                isPrimary: true
              }
            ]
          }
        ]
      });
      var model = {example: {ex: "Joe's Shop"}};
      var del   = new DeleteModel(db2, escaper, qryExec, model);

      expect(del.toString()).toBe
      (
        'DELETE  `example`\n' +
        'FROM    `example` AS `example`\n' +
        "WHERE   (`example`.`ex` = 'Joe\\'s Shop')"
      );
    });

    // Checks a single model with a composite key.
    it('checks a single model with a composite key.', function()
    {
      var db2 = new Database
      ({
        name: 'testDB',
        tables:
        [
          {
            name: 'example',
            columns:
            [
              {
                name: 'ex1',
                isPrimary: true
              },
              {
                name: 'ex2',
                isPrimary: true
              }
            ]
          }
        ]
      });
      var model = {example: {ex1: 13, ex2: 44}};
      var del   = new DeleteModel(db2, escaper, qryExec, model);

      expect(del.toString()).toBe
      (
        'DELETE  `example`\n' +
        'FROM    `example` AS `example`\n' +
        'WHERE   (`example`.`ex1` = 13 AND `example`.`ex2` = 44)'
      );
    });

    // Checks multiple models.
    it('checks multiple models.', function()
    {
      var model =
      {
        users:
        [
          {ID: 12},
          {ID: 44},
        ],
        phoneNumbers:
        [
          {ID: 1},
          {ID: 8}
        ]
      };
      
      var del = new DeleteModel(db, escaper, qryExec, model);

      expect(del.toString()).toBe
      (
        'DELETE  `users`\n' +
        'FROM    `users` AS `users`\n' +
        'WHERE   (`users`.`userID` = 12);\n\n' +

        'DELETE  `users`\n' +
        'FROM    `users` AS `users`\n' +
        'WHERE   (`users`.`userID` = 44);\n\n' +

        'DELETE  `phoneNumbers`\n' +
        'FROM    `phone_numbers` AS `phoneNumbers`\n' +
        'WHERE   (`phoneNumbers`.`phoneNumberID` = 1);\n\n' +

        'DELETE  `phoneNumbers`\n' +
        'FROM    `phone_numbers` AS `phoneNumbers`\n' +
        'WHERE   (`phoneNumbers`.`phoneNumberID` = 8)'
      );
    });
  });

  describe('DeleteModel execute test suite.', function()
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

      expect(qryExec.delete).toHaveBeenCalled();
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

