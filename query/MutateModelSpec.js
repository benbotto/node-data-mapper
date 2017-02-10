describe('MutateModel()', function() {
  'use strict';

  // Note: This is a base class.  The execute method is tested in subclasses
  // (DeleteModel and UpdateModel).

  const insulin      = require('insulin');
  const MutateModel  = insulin.get('ndm_MutateModel');
  const Database     = insulin.get('ndm_Database');
  const MySQLEscaper = insulin.get('ndm_MySQLEscaper');
  const db           = insulin.get('ndm_testDB');
  const escaper      = new MySQLEscaper();
  const qryExec      = {};

  /**
   * Ctor.
   */
  describe('.constructor()', function() {
    it('extends Query.', function() {
      expect(function() {
        const Query = insulin.get('ndm_Query');
        const mm    = new MutateModel(db, escaper, qryExec, {users: {ID: 2}});

        expect(mm instanceof Query).toBe(true);
      }).not.toThrow();
    });

    it('creates a query for each model.', function() {
      let mm = new MutateModel(db, escaper, qryExec, {users: {ID: 2}});
      expect(mm.queries.length).toBe(1);

      mm = new MutateModel(db, escaper, qryExec, {
        users: {ID: 2},
        phoneNumbers: {ID: 4}}
      );
      expect(mm.queries.length).toBe(2);
    });
  });

  /**
   * Create query.
   */
  describe('.createQuery()', function() {
    // Note: createQuery is called from the constuctor.
    
    it('throws an error if the primary key is not provided.', function() {
      expect(function() {
        new MutateModel(db, escaper, qryExec, {users: {first: 'Joe'}});
      }).toThrowError('Primary key not provided on model "users."');
    });
  });

  /**
   * To string.
   */
  describe('.toString()', function() {
    it('returns the SQL for a single model.', function() {
      const db2 = new Database({
        name: 'testDB',
        tables: [
          {
            name: 'example',
            columns: [
              {
                name: 'ex',
                isPrimary: true
              }
            ]
          }
        ]
      });
      const model = {example: {ex: "Joe's Shop"}};
      const mm    = new MutateModel(db2, escaper, qryExec, model);

      expect(mm.toString()).toBe(
        'FROM    `example` AS `example`\n' +
        "WHERE   (`example`.`ex` = :example_ex_0)"
      );
    });

    it('generates the correct where clause for composite keys.', function() {
      const db2 = new Database({
        name: 'testDB',
        tables: [
          {
            name: 'example',
            columns: [
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
      const model = {example: {ex1: 13, ex2: 44}};
      const mm    = new MutateModel(db2, escaper, qryExec, model);

      expect(mm.toString()).toBe(
        'FROM    `example` AS `example`\n' +
        'WHERE   (`example`.`ex1` = :example_ex1_0 AND `example`.`ex2` = :example_ex2_1)'
      );
    });

    it('generates the correct multi-model SQL.', function() {
      const model = {
        users: [
          {ID: 12},
          {ID: 44},
        ],
        phoneNumbers: [
          {ID: 1},
          {ID: 8}
        ]
      };
      
      const mm = new MutateModel(db, escaper, qryExec, model);

      expect(mm.toString()).toBe(
        'FROM    `users` AS `users`\n' +
        'WHERE   (`users`.`userID` = :users_userID_0);\n\n' +

        'FROM    `users` AS `users`\n' +
        'WHERE   (`users`.`userID` = :users_userID_0);\n\n' +

        'FROM    `phone_numbers` AS `phone_numbers`\n' +
        'WHERE   (`phone_numbers`.`phoneNumberID` = :phone_numbers_phoneNumberID_0);\n\n' +

        'FROM    `phone_numbers` AS `phone_numbers`\n' +
        'WHERE   (`phone_numbers`.`phoneNumberID` = :phone_numbers_phoneNumberID_0)'
      );
    });
  });
});

