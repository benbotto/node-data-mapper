describe('DeleteModel()', function() {
  'use strict';

  const insulin      = require('insulin');
  const MySQLEscaper = insulin.get('ndm_MySQLEscaper');
  const db           = insulin.get('ndm_testDB');
  const escaper      = new MySQLEscaper();
  let qryExec;

  beforeEach(() => qryExec = jasmine.createSpyObj('qryExec', ['delete']));

  /**
   * Execute.
   */
  describe('.execute()', function() {
    // MySQLDeleteModel is used because it has an impl of buildQuery.
    const MySQLDeleteModel = insulin.get('ndm_MySQLDeleteModel');

    it('can delete a single model using QueryExecuter.delete().', function() {
      qryExec.delete.and.callFake((query, params, callback) =>
        callback(null, {affectedRows: 1}));

      new MySQLDeleteModel(db, escaper, qryExec, {users: {ID: 14}})
        .execute()
        .then(result => expect(result.affectedRows).toBe(1))
        .catch(() => expect(true).toBe(false))
        .done();

      expect(qryExec.delete).toHaveBeenCalled();
    });

    it('can delete multiple models, and reports the correct number of affected rows.',
      function() {
      qryExec.delete.and.callFake((query, params, callback) =>
        callback(null, {affectedRows: 1}));

      new MySQLDeleteModel(db, escaper, qryExec, {users: [{ID: 14}, {ID: 33}]})
        .execute()
        .then(result => expect(result.affectedRows).toBe(2))
        .catch(() => expect(true).toBe(false))
        .done();

      expect(qryExec.delete.calls.count()).toBe(2);
    });

    it('propagates query execution errors.', function() {
      qryExec.delete.and.callFake((query, params, callback) => callback('FAILURE'));

      new MySQLDeleteModel(db, escaper, qryExec, {users: [{ID: 14}, {ID: 33}]})
        .execute()
        .then(() => expect(true).toBe(false))
        .catch(err => expect(err).toBe('FAILURE'))
        .done();

      expect(qryExec.delete).toHaveBeenCalled();
    });
  });
});

