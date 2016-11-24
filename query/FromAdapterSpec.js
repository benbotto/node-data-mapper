describe('FromAdapterAdapter()', function() {
  'use strict';

  const insulin      = require('insulin');
  const FromAdapter  = insulin.get('ndm_FromAdapter');
  const MySQLEscaper = insulin.get('ndm_MySQLEscaper');
  const db           = insulin.get('ndm_testDB');
  const escaper      = new MySQLEscaper();
  let   qryExec;

  beforeEach(() => qryExec = jasmine.createSpyObj('qryExec', ['select', 'delete']));

  /**
   * Ctor.
   */
  describe('.constructor()', function() {
    it('extends From.', function() {
      const From = insulin.get('ndm_From');
      const fa = new FromAdapter(db, escaper, qryExec, 'users u');

      expect(fa instanceof From).toBe(true);
      expect(fa.database).toBe(db);
      expect(fa.queryExecuter).toBe(qryExec);
      expect(fa.escaper).toBe(escaper);
    });
  });

  /**
   * Select.
   */
  describe('.select().', function() {
    it('selects all columns by default.', function() {
      const sel = new FromAdapter(db, escaper, qryExec, {table: 'users'})
        .select();

      expect(sel.toString()).toBe(
        'SELECT  `users`.`userID` AS `users.userID`,\n' +
        '        `users`.`firstName` AS `users.firstName`,\n' +
        '        `users`.`lastName` AS `users.lastName`\n' +
        'FROM    `users` AS `users`');
    });

    it('can be passed columns explicitly.', function() {
      const sel = new FromAdapter(db, escaper, qryExec, {table: 'users'})
        .select('users.userID', 'users.firstName');

      expect(sel.toString()).toBe(
        'SELECT  `users`.`userID` AS `users.userID`,\n' +
        '        `users`.`firstName` AS `users.firstName`\n' +
        'FROM    `users` AS `users`');
    });

    it('returns a Select instance.', function() {
      const Select = insulin.get('ndm_Select');
      const sel    = new FromAdapter(db, escaper, qryExec, {table: 'users'})
        .select();

      expect(sel instanceof Select).toBe(true);
    });

    /**
     * Delete.
     */
    describe('.delete()', function() {
      it('returns a Delete instance.', function() {
        const Delete = insulin.get('ndm_Delete');
        const del    = new FromAdapter(db, escaper, qryExec, 'users')
          .where({$eq: {'users.userID': 1}})
          .delete();

        expect(del instanceof Delete).toBe(true);
      });

      it('can be provided an optional table alias.', function() {
        const del    = new FromAdapter(db, escaper, qryExec, 'users u')
          .where({$eq: {'u.userID': 1}})
          .delete();

        expect(del.toString()).toBe(
          'DELETE  `u`\n' +
          'FROM    `users` AS `u`\n' +
          'WHERE   `u`.`userID` = 1');
      });
    });

    /**
     * Update.
     */
    describe('.update()', function() {
      it('extends Update.', function() {
        const Update = insulin.get('ndm_Update');
        const upd    = new FromAdapter(db, escaper, qryExec, 'users u')
          .where({$eq: {'u.userID': 1}})
          .update({'u.firstName': 'Joe'});

        expect(upd instanceof Update).toBe(true);
      });

      it('passes the model to the Update constructor.', function() {
        const upd = new FromAdapter(db, escaper, qryExec, 'users u')
          .where({$eq: {'u.userID': 1}})
          .update({'u.firstName': 'Joe'});

        expect(upd.toString()).toBe(
          'UPDATE  `users` AS `u`\n' +
          'SET\n' +
          "`u`.`firstName` = 'Joe'\n" +
          'WHERE   `u`.`userID` = 1');
      });
    });
  });
});

