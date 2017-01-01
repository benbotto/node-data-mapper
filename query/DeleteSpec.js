describe('Delete()', function() {
  'use strict';

  const insulin      = require('insulin');
  const Delete       = insulin.get('ndm_Delete');
  const From         = insulin.get('ndm_From');
  const MySQLEscaper = insulin.get('ndm_MySQLEscaper');
  const db           = insulin.get('ndm_testDB');
  const escaper      = new MySQLEscaper();
  let qryExec;

  beforeEach(() => qryExec = jasmine.createSpyObj('qryExec', ['delete']));

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
    it('returns the sql from buildQuery().', function() {
      const query = new Delete(getFrom('users'));

      spyOn(query, 'buildQuery').and.returnValue({sql: 'DELETE FOO1'});
      expect(query.toString()).toBe('DELETE FOO1');
    });
  });

  /**
   * Execute.
   */
  describe('.execute()', function() {
    // MySQLDelete is used for testing because it has a concrete implementation
    // of buildQuery().
    const MySQLDelete = insulin.get('ndm_MySQLDelete');

    it('uses the QueryExecuter.delete() method to delete.', function() {
      const from = getFrom('users u')
        .where({$eq: {'u.userID': ':userID'}}, {userID: 1});
      const del      = new MySQLDelete(from);

      del.execute();
      expect(qryExec.delete).toHaveBeenCalled();
      expect(qryExec.delete.calls.argsFor(0)[0]).toBe(
        'DELETE  `u`\n' +
        'FROM    `users` AS `u`\n' +
        'WHERE   `u`.`userID` = :userID'
      );

      expect(qryExec.delete.calls.argsFor(0)[1]).toEqual({userID: 1});
    });

    it('returns a promise that resolves with the result of QueryExecuter.delete().', function() {
      const del = new MySQLDelete(getFrom('users'));

      qryExec.delete.and.callFake((query, params, callback) =>
        callback(null, {affectedRows: 42}));

      del
        .execute()
        .then(result => expect(result.affectedRows).toBe(42))
        .catch(() => expect(true).toBe(false))
        .done();
    });

    it('propagates errors from the QueryExecuter.delete() method.', function() {
      const del = new MySQLDelete(getFrom('users'));

      qryExec.delete.and.callFake((q, p, cb) => cb('FAIL'));

      del
        .execute()
        .then(() => expect(true).toBe(false))
        .catch(err => expect(err).toBe('FAIL'))
        .done();
    });
  });
});

