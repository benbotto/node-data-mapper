describe('Update()', function() {
  'use strict';

  const insulin      = require('insulin');
  const Update       = insulin.get('ndm_Update');
  const From         = insulin.get('ndm_From');
  const MySQLEscaper = insulin.get('ndm_MySQLEscaper');
  const db           = insulin.get('ndm_testDB');
  const escaper      = new MySQLEscaper();
  let qryExec;

  beforeEach(() => qryExec = jasmine.createSpyObj('qryExec', ['update']));

  function getFrom(meta) {
    return new From(db, escaper, qryExec, meta);
  }

  /**
   * Constructor.
   */
  describe('.constructor()', function() {
    it('extends Query.', function() {
      const Query = insulin.get('ndm_Query');
      const upd   = new Update(getFrom('users u'), {'u.firstName': 'jack'});

      expect(upd instanceof Query).toBe(true);
      expect(upd.database).toBeDefined();
      expect(upd.escaper).toBeDefined();
      expect(upd.queryExecuter).toBeDefined();
    });

    it('throws an error if a model key does not match a fully-qualified column name.', function() {
      expect(function() {
        new Update(getFrom('users u'), {foo: 'bar'});
      }).toThrowError('Column "foo" is not available for updating.');
    });
  });

  /**
   * To string.
   */
  describe('.toString()', function() {
    it('returns the sql from buildQuery().', function() {
      const query = new Update(db, escaper, qryExec, {});

      spyOn(query, 'buildQuery').and.returnValue({sql: 'UPDATE FOO'});

      expect(query.toString()).toBe('UPDATE FOO');
    });
  });

  /**
   * Execute.
   */
  describe('.execute()', function() {
    // MySQLUpdate is used for testing because it has a concrete implementation
    // of buildQuery, making testing convenient.
    const MySQLUpdate = insulin.get('ndm_MySQLUpdate');

    it('resolves with 0 affectedRows if there are no columns to update.', function() {
      const upd = new MySQLUpdate(getFrom('users u'), {});

      upd
        .execute()
        .then(res => expect(res.affectedRows).toBe(0))
        .catch(() => expect(true).toBe(false))
        .done();

      expect(qryExec.update).not.toHaveBeenCalled();
    });

    it('uses the queryExecuter.update() method to execute the SQL.', function() {
      const upd = new MySQLUpdate(getFrom('users u'), {'u.firstName':'joe'});

      upd.execute();
      expect(qryExec.update).toHaveBeenCalled();
    });

    it('resolves with an object containing affectedRows, as reported by the '+
      'queryExecuter.update() method.', function() {
      const upd = new MySQLUpdate(getFrom('users u'), {'u.firstName':'joe'});

      qryExec.update.and.callFake((query, params, callback) =>
        callback(null, {affectedRows: 1}));

      upd
        .execute()
        .then(res => expect(res.affectedRows).toBe(1))
        .catch(() => expect(true).toBe(false))
        .done();
    });

    it('propagates errors from the queryExecuter.update() method.', function() {
      const err = new Error();
      const upd = new MySQLUpdate(getFrom('users u'), {'u.firstName':'joe'});

      qryExec.update.and.callFake((query, params, callback) => callback(err));

      upd
        .execute()
        .then(() => expect(true).toBe(false))
        .catch(e => expect(e).toBe(err))
        .done();
    });

    it('passes the query parameters to the queryExecuter.update() method.', function() {
      const from = getFrom('users u')
        .where({$eq: {'u.userID': ':userID'}}, {userID: 12});
      const upd  = new MySQLUpdate(from, {
        'u.firstName': 'Joe'
      });

      qryExec.update.and.callFake((query, params) =>
        expect(params).toEqual({userID: 12, u_firstName_0: 'Joe'}));

      upd.execute();
      expect(qryExec.update).toHaveBeenCalled();
    });
  });
});

