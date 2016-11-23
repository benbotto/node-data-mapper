describe('Insert test suite.', function() {
  'use strict';

  const insulin      = require('insulin');
  const Insert       = insulin.get('ndm_Insert');
  const MySQLEscaper = insulin.get('ndm_MySQLEscaper');
  const db           = insulin.get('ndm_testDB');
  const escaper      = new MySQLEscaper();
  let qryExec;

  beforeEach(() => qryExec = jasmine.createSpyObj('qryExec', ['insert']));

  /**
   * Ctor.
   */
  describe('.constructor()', function() {
    it('extends Query.', function() {
      const Query = insulin.get('ndm_Query');
      const ins   = new Insert(db, escaper, qryExec, {});

      expect(ins instanceof Query).toBe(true);
    });
  });

  /**
   * To string.
   */
  describe('.toString()', function() {
    it('generates SQL for a single model.', function() {
      const query = new Insert(db, escaper, qryExec, {
        users: {first: 'Sandy', last: 'Perkins'}
      });

      expect(query.toString()).toEqual(
        'INSERT INTO `users` (`firstName`, `lastName`)\n' +
        "VALUES ('Sandy', 'Perkins')");
    });

    it('returns an empty string if there are no columns to insert.', function() {
      const query = new Insert(db, escaper, qryExec, {users: {}});

      expect(query.toString()).toEqual('');
    });

    it('ignores nested model properties that don\'t map to columns.', function() {
      const query = new Insert(db, escaper, qryExec, {
        users: {first: 'Sandy', last: 'Perkins', occupation: 'Code Wrangler'}
      });

      expect(query.toString()).toEqual(
        'INSERT INTO `users` (`firstName`, `lastName`)\n' +
        "VALUES ('Sandy', 'Perkins')");
    });

    it('converts table mappings to names.', function() {
      const query = new Insert(db, escaper, qryExec, {
        phoneNumbers: {userID: 12, phoneNumber: '444-555-6666', type: 'mobile'}
      });

      expect(query.toString()).toBe(
        'INSERT INTO `phone_numbers` (`userID`, `phoneNumber`, `type`)\n' +
        "VALUES (12, '444-555-6666', 'mobile')"
      );
    });

    it('escapes reserverd characters.', function() {
      const query = new Insert(db, escaper, qryExec, {
        users: {first: 'Sandy', last: "O'Hare"}
      });

      expect(query.toString()).toEqual(
        'INSERT INTO `users` (`firstName`, `lastName`)\n' +
        "VALUES ('Sandy', 'O\\'Hare')");
    });

    it('sets columns to NULL when a model property is null. ', function() {
      const query = new Insert(db, escaper, qryExec, {
        users: {first: 'Sandy', last: null}
      });

      expect(query.toString()).toEqual(
        'INSERT INTO `users` (`firstName`, `lastName`)\n' +
        "VALUES ('Sandy', NULL)");
    });

    it('generates a query for each model in an array.', function() {
      const query = new Insert(db, escaper, qryExec, {
        users: [
          {first: 'Sandy', last: 'Perkins'},
          {first: 'Sandy', last: "O'Hare"}
        ]
      });

      expect(query.toString()).toEqual(
        'INSERT INTO `users` (`firstName`, `lastName`)\n' +
        "VALUES ('Sandy', 'Perkins');\n\n" +
        'INSERT INTO `users` (`firstName`, `lastName`)\n' +
        "VALUES ('Sandy', 'O\\'Hare')");
    });

    it('uses converters when present in the Database instance.', function() {
      const query = new Insert(db, escaper, qryExec, {
        products: [
          {description: 'Innova Valkyrie', isActive: true},
          {description: 'Innova Valkyrie', isActive: false},
          {description: 'Innova Valkyrie', isActive: null}
        ]
      });

      expect(query.toString()).toEqual(
        'INSERT INTO `products` (`description`, `isActive`)\n' +
        "VALUES ('Innova Valkyrie', 1);\n\n" +
        'INSERT INTO `products` (`description`, `isActive`)\n' +
        "VALUES ('Innova Valkyrie', 0);\n\n" +
        'INSERT INTO `products` (`description`, `isActive`)\n' +
        "VALUES ('Innova Valkyrie', NULL)");
    });
  });

  /**
   * Execute.
   */
  describe('.execute()', function() {
    let insertId;

    beforeEach(function() {
      insertId = 0;
      qryExec  = jasmine.createSpyObj('qryExec', ['insert']);

      // When the QueryExecuter.insert method is called return
      // immediately with an insertId.  The insertId starts at
      // 1 and is incremented on each query.
      qryExec.insert.and.callFake((query, callback) => 
        callback(undefined, {insertId: ++insertId}));
    });

    it('uses the queryExecuter.insert() method to insert models.', function() {
      const query = new Insert(db, escaper, qryExec, {
        users: {first: 'Sandy', last: 'Perkins'}
      });

      query.execute();
      expect(qryExec.insert).toHaveBeenCalled();
      expect(insertId).toBe(1);
    });

    it('calls the queryExecuter.insert() method once for each model.', function() {
      const query = new Insert(db, escaper, qryExec, {
        users: [
          {first: 'Sandy',  last: 'Perkins'},
          {first: 'Cindy',  last: 'Perkins'},
          {first: 'Donald', last: 'Perkins'}
        ]
      });

      query.execute();
      expect(qryExec.insert.calls.count()).toBe(3);
      expect(insertId).toBe(3);
    });

    it('updates the primary key on the model when the insertId is available.', function() {
      const query = new Insert(db, escaper, qryExec, {
        users: [
          {first: 'Sandy',  last: 'Perkins'},
          {first: 'Cindy',  last: 'Perkins'},
          {first: 'Donald', last: 'Perkins'}
        ]
      });

      query
        .execute()
        .then(function(result) {
          expect(result.users[0].ID).toBe(1);
          expect(result.users[1].ID).toBe(2);
          expect(result.users[2].ID).toBe(3);
        })
        .catch(() => expect(true).toBe(false))
        .done();
    });

    it('does not modify the model if no insertId is returned.', function() {
      qryExec.insert.and.callFake(function(query, callback) {
        callback(undefined, {});
      });

      const query = new Insert(db, escaper, qryExec, {
        users: {first: 'Sandy', last: 'Perkins'}
      });

      query.execute().then(function(result) {
        expect(result.users.ID).not.toBeDefined();
      });
    });

    it('propagates errors from the queryExecuter.insert() method.', function() {
      const err   = new Error();
      const query = new Insert(db, escaper, qryExec, {
        users: {first: 'Sandy', last: 'Perkins'}
      });

      qryExec.insert.and.callFake((query, callback) => callback(err));

      query
        .execute()
        .then(() => expect(true).toBe(false))
        .catch(e => expect(e).toBe(err))
        .done();
    });
  });
});

