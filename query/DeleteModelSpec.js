describe('DeleteModel()', function() {
  'use strict';

  const insulin      = require('insulin');
  const DeleteModel  = insulin.get('ndm_DeleteModel');
  const MySQLEscaper = insulin.get('ndm_MySQLEscaper');
  const db           = insulin.get('ndm_testDB');
  const escaper      = new MySQLEscaper();
  let qryExec;

  beforeEach(() => qryExec = jasmine.createSpyObj('qryExec', ['delete']));

  /**
   * To string.
   */
  describe('.toString()', function() {
    it('generates the correct sql for a single model.', function() {
      const del = new DeleteModel(db, escaper, qryExec, {users: {ID: 1}});

      expect(del.toString()).toBe(
        'DELETE  `users`\n' +
        'FROM    `users` AS `users`\n' +
        'WHERE   (`users`.`userID` = 1)'
      );
    });

    it('generates the correct sql for multiple models.', function() {
      const users = {users: [{ID: 1}, {ID: 3}]};
      const del = new DeleteModel(db, escaper, qryExec, users);

      expect(del.toString()).toBe(
        'DELETE  `users`\n' +
        'FROM    `users` AS `users`\n' +
        'WHERE   (`users`.`userID` = 1);\n\n' +

        'DELETE  `users`\n' +
        'FROM    `users` AS `users`\n' +
        'WHERE   (`users`.`userID` = 3)'
      );
    });
  });

  /**
   * Execute.
   */
  describe('.execute()', function() {
    it('can delete a single model using QueryExecuter.delete().', function() {
      qryExec.delete.and.callFake(function(query, callback) {
        callback(null, {affectedRows: 1});
      });

      new DeleteModel(db, escaper, qryExec, {users: {ID: 14}})
        .execute()
        .then(result => expect(result.affectedRows).toBe(1))
        .catch(() => expect(true).toBe(false))
        .done();

      expect(qryExec.delete).toHaveBeenCalled();
    });

    it('can delete multiple models, and reports the correct number of affected rows.',
      function() {
      qryExec.delete.and.callFake(function(query, callback) {
        callback(null, {affectedRows: 1});
      });

      new DeleteModel(db, escaper, qryExec, {users: [{ID: 14}, {ID: 33}]})
        .execute()
        .then(result => expect(result.affectedRows).toBe(2))
        .catch(() => expect(true).toBe(false))
        .done();

      expect(qryExec.delete.calls.count()).toBe(2);
    });

    it('propagates query execution errors.', function() {
      qryExec.delete.and.callFake(function(query, callback) {
        callback('FAILURE');
      });

      new DeleteModel(db, escaper, qryExec, {users: [{ID: 14}, {ID: 33}]})
        .execute()
        .then(() => expect(true).toBe(false))
        .catch(err => expect(err).toBe('FAILURE'))
        .done();

      expect(qryExec.delete).toHaveBeenCalled();
    });
  });
});

