describe('FromAdapter()', function() {
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
    it('is not implemented.', function() {
      expect(function() {
        new FromAdapter(db, escaper, qryExec, {table: 'users'})
          .select();
      }).toThrowError('select not implemented.');
    });
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
    it('is not implemented.', function() {
      expect(function() {
        new FromAdapter(db, escaper, qryExec, {table: 'users'})
          .update();
      }).toThrowError('update not implemented.');
    });
  });
});

