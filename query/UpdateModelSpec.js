describe('UpdateModel()', function() {
  'use strict';

  // MySQLUpdateModel is used for testing because it has a concrete
  // implementation of buildQuery(), making testing easier.
  const insulin          = require('insulin');
  const MySQLUpdateModel = insulin.get('ndm_MySQLUpdateModel');
  const MySQLEscaper     = insulin.get('ndm_MySQLEscaper');
  const db               = insulin.get('ndm_testDB');
  const escaper          = new MySQLEscaper();
  let qryExec;

  beforeEach(() => qryExec = jasmine.createSpyObj('qryExec', ['update']));

  /**
   * To string.
   */
  describe('.toString()', function() {
    it('returns a blank string if there are no properties to update.', function() {
      const upd = new MySQLUpdateModel(db, escaper, qryExec, {users: {ID: 1}});
      expect(upd.toString()).toBe('');
    });

    it('returns the correct SQL for a single model, converting the table and ' +
      'column mappings appropriately.', function() {
      const upd = new MySQLUpdateModel(db, escaper, qryExec, {
        users: {
          ID:    1,
          first: 'Joe',
          last:  'Smith'
        }
      });

      expect(upd.toString()).toBe(
        'UPDATE  `users` AS `users`\n' +
        'SET\n' +
        '`users`.`firstName` = :users_firstName_1,\n' +
        '`users`.`lastName` = :users_lastName_2\n' +
        'WHERE   (`users`.`userID` = :users_userID_0)'
      );
    });

    it('ignores properties that do not correspond to column mappings.', function() {
      const upd = new MySQLUpdateModel(db, escaper, qryExec, {
        users: {
          ID:    1,
          first: 'Joe',
          last:  'Smith',
          foo :  'bar' // Ignored.
        }
      });

      expect(upd.toString()).toBe(
        'UPDATE  `users` AS `users`\n' +
        'SET\n' +
        "`users`.`firstName` = :users_firstName_1,\n" +
        "`users`.`lastName` = :users_lastName_2\n" +
        'WHERE   (`users`.`userID` = :users_userID_0)'
      );
    });
  });

  /**
   * Execute.
   */
  describe('.execute()', function() {
    it('can update a single model using the queryExecuter.update() method.', function() {
      qryExec.update.and.callFake((query, params, callback) =>
        callback(null, {affectedRows: 1}));

      new MySQLUpdateModel(db, escaper, qryExec, {users: {ID: 14, first: 'Joe'}})
        .execute()
        .then(result => expect(result.affectedRows).toBe(1))
        .catch(() => expect(true).toBe(false))
        .done();

      expect(qryExec.update).toHaveBeenCalled();
    });

    it('can update multiple models.', function() {
      qryExec.update.and.callFake((query, params, callback) =>
        callback(null, {affectedRows: 1}));

      new MySQLUpdateModel(db, escaper, qryExec, {
          users: [
            {ID: 14, first: 'Joe'},
            {ID: 33, first: 'Sam'}
          ]
        })
        .execute()
        .then(result => expect(result.affectedRows).toBe(2))
        .catch(() => expect(true).toBe(false))
        .done();

      expect(qryExec.update.calls.count()).toBe(2);
    });

    it('propagates errors from the queryExecuter.update() method.', function() {
      const err = new Error();
      qryExec.update.and.callFake((query, params, callback) => callback(err));

      new MySQLUpdateModel(db, escaper, qryExec, {users: {ID: 14, first: 'Joe'}})
        .execute()
        .then(() => expect(true).toBe(false))
        .catch(e => expect(e).toBe(err))
        .done();

      expect(qryExec.update).toHaveBeenCalled();
    });
  });
});

