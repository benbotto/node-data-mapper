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
   * Set string.
   */
  describe('.getSetString()', function() {
    it('returns a blank string if there are no columns to update.', function() {
      const upd = new Update(getFrom('users u'), {});

      expect(upd.getSetString()).toBe('');
    });

    it('returns a single SET column if there is only one column to update.', function() {
      const upd = new Update(getFrom('users u'), {'u.lastName':"O'Hare"});

      expect(upd.getSetString()).toBe(
        'SET\n'+
        "`u`.`lastName` = 'O\\'Hare'");
    });

    it('returns multiple SET columns if there are multiple columns to update.', function() {
      const upd = new Update(getFrom('users u'), {
        'u.lastName':  "O'Hare",
        'u.firstName': 'Joe'
      });

      expect(upd.getSetString()).toBe(
        'SET\n'+
        "`u`.`lastName` = 'O\\'Hare',\n" +
        "`u`.`firstName` = 'Joe'");
    });

    it('uses onSave converters that are defined in the Database instance.', function() {
      const upd = new Update(getFrom('products p'), {
        'p.isActive': false
      });

      expect(upd.getSetString()).toBe(
        'SET\n'+
        '`p`.`isActive` = 0');
    });
  });

  /**
   * To string.
   */
  describe('.toString()', function() {
    it('returns an empty string if there are no columns to update.', function() {
      const upd = new Update(getFrom('users u'), {});

      expect(upd.getSetString()).toBe('');
    });

    it('returns a valid SQL string if there is only one column to update.', function() {
      const upd = new Update(getFrom('users u'), {
        'u.firstName': 'Joe'
      });

      expect(upd.toString()).toBe(
        'UPDATE  `users` AS `u`\n' +
        'SET\n'+
        "`u`.`firstName` = 'Joe'");
    });

    it('returns a valid SQL string if there are multiple columns.', function() {
      const upd = new Update(getFrom('users u'), {
        'u.lastName':  "O'Hare",
        'u.firstName': 'Joe'
      });

      expect(upd.toString()).toBe(
        'UPDATE  `users` AS `u`\n' +
        'SET\n'+
        "`u`.`lastName` = 'O\\'Hare',\n" +
        "`u`.`firstName` = 'Joe'");
    });

    it('returns a valid SQL string if a WHERE clause is provided.', function() {
      const from = getFrom('users u')
        .where({$eq: {'u.userID': 12}});
      const upd  = new Update(from, {
        'u.firstName': 'Joe'
      });

      expect(upd.toString()).toBe(
        'UPDATE  `users` AS `u`\n' +
        'SET\n'+
        "`u`.`firstName` = 'Joe'\n" +
        'WHERE   `u`.`userID` = 12');
    });

    it('returns a valid SQL string if a JOIN is provided.', function() {
      const from = getFrom('users u')
        .innerJoin('u.phone_numbers pn')
        .where({$eq: {'u.userID': 12}});
      const upd  = new Update(from, {
        'u.firstName':    'Joe',
        'pn.phoneNumber': '123-456-789'
      });

      expect(upd.toString()).toBe(
        'UPDATE  `users` AS `u`\n' +
        'INNER JOIN `phone_numbers` AS `pn` ON `u`.`userID` = `pn`.`userID`\n' +
        'SET\n'+
        "`u`.`firstName` = 'Joe',\n" +
        "`pn`.`phoneNumber` = '123-456-789'\n" +
        'WHERE   `u`.`userID` = 12');
    });
  });

  /**
   * Execute.
   */
  describe('.execute()', function() {
    it('resolves with 0 affectedRows if there are no columns to update.', function() {
      const upd = new Update(getFrom('users u'), {});

      upd
        .execute()
        .then(res => expect(res.affectedRows).toBe(0))
        .catch(() => expect(true).toBe(false))
        .done();

      expect(qryExec.update).not.toHaveBeenCalled();
    });

    it('uses the queryExecuter.update() method to execute the SQL.', function() {
      const upd = new Update(getFrom('users u'), {'u.firstName':'joe'});

      upd
        .execute()
        .then(res => expect(res.affectedRows).toBe(0))
        .catch(() => expect(true).toBe(false))
        .done();

      expect(qryExec.update).toHaveBeenCalled();
    });

    it('resolves with an object containing affectedRows, as reported by the '+
      'queryExecuter.update() method.', function() {
      const upd = new Update(getFrom('users u'), {'u.firstName':'joe'});

      qryExec.update.and.callFake((query, callback) =>
        callback(null, {affectedRows: 1}));

      upd
        .execute()
        .then(res => expect(res.affectedRows).toBe(1))
        .catch(() => expect(true).toBe(false))
        .done();
    });

    it('propagates errors from the queryExecuter.update() method.', function() {
      const err = new Error();
      const upd = new Update(getFrom('users u'), {'u.firstName':'joe'});

      qryExec.update.and.callFake((query, callback) => callback(err));

      upd
        .execute()
        .then(() => expect(true).toBe(false))
        .catch(e => expect(e).toBe(err))
        .done();
    });
  });
});

