describe('Delete()', function() {
  'use strict';

  const insulin      = require('insulin');
  const Delete       = insulin.get('ndm_Delete');
  const From         = insulin.get('ndm_From');
  const MySQLEscaper = insulin.get('ndm_MySQLEscaper');
  const db           = insulin.get('ndm_testDB');
  const escaper      = new MySQLEscaper();
  let qryExec;

  beforeEach(function() {
    qryExec = jasmine.createSpyObj('qryExec', ['delete']);
  });

  function getFrom(meta) {
    return new From(db, escaper, qryExec, meta);
  }

  /**
   * Ctor.
   */
  describe('.constructor()', function() {
    it('can be constructed using a From instance and no alias.', function() {
      expect(function() {
        new Delete(getFrom('users'));
      }).not.toThrow();
    });

    it('can be constructed using a From instance and a table alias.', function() {
      expect(function() {
        new Delete(getFrom('users'), 'users');
      }).not.toThrow();
    });

    it('throws an error if the table alias is not valid.', function() {
      expect(function() {
        new Delete(getFrom('users'), 'foo');
      }).toThrowError('"foo" is not a valid table alias.');
    });

    it('extends Query.', function() {
      const Query = insulin.get('ndm_Query');
      const del   = new Delete(getFrom('users'));

      expect(del instanceof Query).toBe(true);

      expect(del.database).toBe(db);
      expect(del.escaper).toBe(escaper);
      expect(del.queryExecuter).toBe(qryExec);
    });
  });

  /**
   * To string.
   */
  describe('.toString()', function() {
    it('can delete a single record by ID.', function() {
      const from = getFrom('users')
        .where({$eq: {'users.userID': 1}});
      const del = new Delete(from);

      expect(del.toString()).toBe(
        'DELETE  `users`\n' +
        'FROM    `users` AS `users`\n' +
        'WHERE   `users`.`userID` = 1'
      );
    });

    it('can have tables joined.', function() {
      const from = getFrom('users')
        .innerJoin({
          table: 'phone_numbers',
          parent: 'users',
          on: {$eq: {'users.userID':'phone_numbers.userID'}}
        })
        .where({$eq: {'users.userID': 1}});
      const del = new Delete(from);

      expect(del.toString()).toBe(
        'DELETE  `users`\n' +
        'FROM    `users` AS `users`\n' +
        'INNER JOIN `phone_numbers` AS `phone_numbers` ON `users`.`userID` = `phone_numbers`.`userID`\n' +
        'WHERE   `users`.`userID` = 1'
      );
    });

    it('can delete from a joined-in table.', function() {
      const from = getFrom('users')
        .innerJoin({
          table:  'phone_numbers',
          as:     'pn',
          parent: 'users',
          on:     {$eq: {'users.userID':'pn.userID'}}
        })
        .where({$eq: {'users.userID': 1}});
      const del = new Delete(from, 'pn');

      expect(del.toString()).toBe(
        'DELETE  `pn`\n' +
        'FROM    `users` AS `users`\n' +
        'INNER JOIN `phone_numbers` AS `pn` ON `users`.`userID` = `pn`.`userID`\n' +
        'WHERE   `users`.`userID` = 1'
      );
    });
  });

  /**
   * Execute.
   */
  describe('.execute()', function() {
    it('uses the QueryExecuter instance to delete a single record.', function() {
      const from = getFrom('users')
        .where({$eq: {'users.userID': 1}});
      const del      = new Delete(from);

      del.execute();
      expect(qryExec.delete).toHaveBeenCalled();
    });

    it('returns a promise that resolves with the result of QueryExecuter.delete().', function() {
      const del = new Delete(getFrom('users'));

      qryExec.delete.and.callFake((query, params, callback) =>
        callback(null, {affectedRows: 42}));

      del.execute().then(function(result) {
        expect(result.affectedRows).toBe(42);
      });
    });

    it('propagates errors from the QueryExecuter.delete() method.', function() {
      const del = new Delete(getFrom('users'));

      qryExec.delete.and.callFake(function(query, params, callback) {
        callback('FAIL');
      });

      del.execute().catch(function(err) {
        expect(err).toBe('FAIL');
      });
    });

    it('passes the parameters to the QueryExecuter.delete() method.', function() {
      const from = getFrom('users')
        .where({$eq: {'users.userID': ':userID'}}, {userID: 42});
      const del      = new Delete(from);

      qryExec.delete.and.callFake(function(query, params, callback) {
        expect(params).toEqual({userID: 42});
        callback(null, {affectedRows: 1});
      });

      del
        .execute()
        .catch(() => expect(true).toBe(false))
        .done();
    });
  });
});

