xdescribe('MutateModel test suite.', function()
{
  'use strict';

  // Note: This is a base class.  The execute method is tested in subclasses
  // (DeleteModel and UpdateModel).

  var MutateModel  = require('./MutateModel');
  var Database     = require('../database/Database');
  var MySQLEscaper = require('./MySQLEscaper');
  var db           = new Database(require('../spec/testDB'));
  var escaper      = new MySQLEscaper();
  var qryExec      = {};

  xdescribe('MutateModel constructor test suite.', function()
  {
    // Checks that the constructor functions.
    it('checks that the constructor functions.', function()
    {
      expect(function()
      {
        new MutateModel(db, escaper, qryExec, {users: {ID: 2}});
      }).not.toThrow();
    });

    // Checks that the number of queries is correct.
    it('checks that the number of queries is correct.', function()
    {
      var mm = new MutateModel(db, escaper, qryExec, {users: {ID: 2}});
      expect(mm.getQueries().length).toBe(1);

      mm = new MutateModel(db, escaper, qryExec,
      {
        users: {ID: 2},
        phoneNumbers: {ID: 4}}
      );
      expect(mm.getQueries().length).toBe(2);
    });
  });

  xdescribe('MutateModel createQueryInstance test suite.', function()
  {
    // Note: createQueryInstance is called from the constuctor.
    
    // Checks that the primary key is required.
    it('checks that the primary key is required.', function()
    {
      expect(function()
      {
        new MutateModel(db, escaper, qryExec, {users: {first: 'Joe'}});
      }).toThrowError('Primary key not provided on model users.');
    });
  });

  xdescribe('MutateModel toString test suite.', function()
  {
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
      var mm    = new MutateModel(db2, escaper, qryExec, model);

      expect(mm.toString()).toBe
      (
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
      var mm    = new MutateModel(db2, escaper, qryExec, model);

      expect(mm.toString()).toBe
      (
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
      
      var mm = new MutateModel(db, escaper, qryExec, model);

      expect(mm.toString()).toBe
      (
        'FROM    `users` AS `users`\n' +
        'WHERE   (`users`.`userID` = 12);\n\n' +

        'FROM    `users` AS `users`\n' +
        'WHERE   (`users`.`userID` = 44);\n\n' +

        'FROM    `phone_numbers` AS `phoneNumbers`\n' +
        'WHERE   (`phoneNumbers`.`phoneNumberID` = 1);\n\n' +

        'FROM    `phone_numbers` AS `phoneNumbers`\n' +
        'WHERE   (`phoneNumbers`.`phoneNumberID` = 8)'
      );
    });
  });
});

