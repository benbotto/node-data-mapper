describe('From()', function() {
  'use strict';

  const insulin      = require('insulin');
  const From         = insulin.get('ndm_From');
  const MySQLEscaper = insulin.get('ndm_MySQLEscaper');
  const db           = insulin.get('ndm_testDB');
  const escaper      = new MySQLEscaper();
  const qryExec      = {};

  /**
   * Ctor.
   */
  describe('.constructor()', function() {
    it('can be initialized with a meta object containing only the table name.', function() {
      expect(function() {
        new From(db, escaper, qryExec, {table: 'users'});
      }).not.toThrow();
    });

    it('can be initialized with just the table name.', function() {
      expect(function() {
        new From(db, escaper, qryExec, 'users');
      }).not.toThrow();
    });

    it('throws an error if the table name is not present in the database.', function() {
      expect(function() {
        new From(db, escaper, qryExec, {table: 'INVALID_NAME'});
      }).toThrowError('Table INVALID_NAME does not exist in database testDB.');
    });

    it('exposes the database publicly.', function() {
      const from = new From(db, escaper, qryExec, {table: 'users'});
      expect(from.database).toBe(db);
    });
  });

  /**
   * Parse from string.
   */
  describe('.parseFromString()', function() {
    let from;

    beforeEach(() => from = new From(db, escaper, qryExec, {table: 'users'}));

    it('can be used without an alias.', function() {
      const meta = from.parseFromString('users');
      expect(meta.table).toBe('users');
      expect(meta.as).toBe('users');
    });

    it('can be used with a table and an alias.', function() {
      const meta = from.parseFromString('users u');
      expect(meta.table).toBe('users');
      expect(meta.as).toBe('u');
    });

    it('allows "as" to be provided optionally.', function() {
      const meta = from.parseFromString('users as u');
      expect(meta.table).toBe('users');
      expect(meta.as).toBe('u');
    });

    it('ignores the case of "AS."', function() {
      const meta = from.parseFromString('users AS u');
      expect(meta.table).toBe('users');
      expect(meta.as).toBe('u');
    });

    it('ignores excess whitespace.', function() {
      const meta = from.parseFromString('users    AS     u');
      expect(meta.table).toBe('users');
      expect(meta.as).toBe('u');
    });

    it('throws an error if the from string is invalid.', function() {
      expect(function() {
        from.parseFromString('not a valid');
      }).toThrowError('From must be in the format: <table-name>[ [as ]<table-alias>].');
    });
  });

  /**
   * Parse join string.
   */
  describe('.parseJoinString()', function() {
    let from;

    beforeEach(() => from = new From(db, escaper, qryExec, {table: 'users', as: 'u'}));

    it('can be used with a parent and without an alias.', function() {
      const meta = from.parseJoinString('u.phone_numbers');
      expect(meta.parent).toBe('u');
      expect(meta.table).toBe('phone_numbers');
      expect(meta.as).toBe('phone_numbers');
      expect(meta.relType).toBe('many');
      expect(meta.cond).toEqual({$eq: {'u.userID': 'phone_numbers.userID'}});
    });

    it('can be used with a parent, a table, and an alias.', function() {
      const meta = from.parseJoinString('u.phone_numbers pn');
      expect(meta.parent).toBe('u');
      expect(meta.table).toBe('phone_numbers');
      expect(meta.as).toBe('pn');
      expect(meta.relType).toBe('many');
      expect(meta.cond).toEqual({$eq: {'u.userID': 'pn.userID'}});
    });

    it('can be used without a parent or an alias.', function() {
      const meta = from.parseJoinString('phone_numbers');
      expect(meta.parent).not.toBeDefined();
      expect(meta.table).toBe('phone_numbers');
      expect(meta.as).toBe('phone_numbers');
      expect(meta.relType).not.toBeDefined();
      expect(meta.cond).not.toBeDefined();
    });

    it('can be used without a parent and with an alias.', function() {
      const meta = from.parseJoinString('phone_numbers pn');
      expect(meta.parent).not.toBeDefined();
      expect(meta.table).toBe('phone_numbers');
      expect(meta.as).toBe('pn');
      expect(meta.relType).not.toBeDefined();
    });

    it('sets the relType to single if the child owns the foreign key.', function() {
      const from = new From(db, escaper, qryExec, {table: 'phone_numbers', as: 'pn'});
      const meta = from.parseJoinString('pn.users u');

      expect(meta.parent).toBe('pn');
      expect(meta.table).toBe('users');
      expect(meta.as).toBe('u');
      expect(meta.relType).toBe('single');
      expect(meta.cond).toEqual({$eq: {'pn.userID': 'u.userID'}});
    });

    it('throws an error if the joinStr is invalid.', function() {
      expect(function() {
        from.parseJoinString('not a valid');
      }).toThrowError('Join must be in the format: ' +
        '[<parent-table-alias>.]<table-name>[ [as ]<table-alias>].');
    });

    it('throws an error if there is not exactly 1 relationship between parent and child.',
      function() {

      expect(function() {
        // 2 relationships.
        const from = new From(db, escaper, qryExec, {table: 'photos', as: 'p'});
        from.parseJoinString('p.photos thumb');
      }).toThrowError('Automatic joins can only be performed if there is ' +
        'exactly one relationship between the parent and child tables.');

      expect(function() {
        // 0 relationships.
        const from = new From(db, escaper, qryExec, {table: 'users', as: 'u'});
        from.parseJoinString('u.products p');
      }).toThrowError('Automatic joins can only be performed if there is ' +
        'exactly one relationship between the parent and child tables.');
    });
  });

  /**
   * Where.
   */
  describe('.where()', function() {
    it('allows the user to add a where clause.', function() {
      const query = new From(db, escaper, qryExec, {table: 'users'})
        .where({$eq: {'users.userID': 4}});

      expect(query.toString()).toBe(
        'FROM    `users` AS `users`\n' +
        'WHERE   `users`.`userID` = 4');
    });

    it('throws an error if where is called multiple times on the same query.', function() {
      expect(function() {
        new From(db, escaper, qryExec, {table: 'users'})
          .where({$eq: {'users.userID': 4}})
          .where({$eq: {'users.userID': 4}});
      }).toThrowError('where already performed on query.');
    });

    it('throws an error if a where is performed on an unavailable column.', function() {
      expect(function() {
        new From(db, escaper, qryExec, {table: 'users'})
          .where({$eq: {userID: 4}}); // Should be users.userID.
      }).toThrowError('The column "userID" is not available for a where condition.');
    });

    it('replaces parameters in where conditions.', function() {
      const query = new From(db, escaper, qryExec, {table: 'users'})
        .where({$eq: {'users.firstName':':firstName'}}, {firstName: 'Sally'});
      expect(query.toString()).toBe(
        'FROM    `users` AS `users`\n' +
        'WHERE   `users`.`firstName` = \'Sally\'');
    });
  });

  /**
   * Join.
   * Most tests in innerJoin to save typing.
   */
  describe('.join()', function() {
    it('throws an error if joinType is not provided.', function() {
      expect(function() {
        new From(db, escaper, qryExec, {table: 'users', as: 'u'})
          .join({table: 'phone_numbers', as: 'pn'});
      }).toThrowError('joinType is required.');
    });
  });

  /**
   * Inner join.
   */
  describe('.innerJoin', function() {
    it('allows the table to be aliased.', function() {
      const query = new From(db, escaper, qryExec, {table: 'users', as: 'u'})
        .innerJoin({table: 'phone_numbers', as: 'pn'});

      expect(query.toString()).toBe(
        'FROM    `users` AS `u`\n' +
        'INNER JOIN `phone_numbers` AS `pn`');
    });

    it('defaults the table alias to the table name.', function() {
      const query = new From(db, escaper, qryExec, {table: 'users', as: 'u'})
        .innerJoin({table: 'phone_numbers'});

      expect(query.toString()).toBe(
        'FROM    `users` AS `u`\n' +
        'INNER JOIN `phone_numbers` AS `phone_numbers`');
    });

    it('allows the ON condition to be set explicitly.', function() {
      const query = new From(db, escaper, qryExec, {table: 'users', as: 'u'})
        .innerJoin({table: 'phone_numbers', as: 'pn', on: {$eq: {'u.userID':'pn.userID'}}});

      expect(query.toString()).toBe(
        'FROM    `users` AS `u`\n' +
        'INNER JOIN `phone_numbers` AS `pn` ON `u`.`userID` = `pn`.`userID`');
    });

    it('throws an error if an unavailable column is used in an ON condition.', function() {
      expect(function() {
        new From(db, escaper, qryExec, {table: 'users', as: 'u'})
          .innerJoin({table: 'phone_numbers', as: 'pn', on: {$eq: {'u.INVALID':'pn.userID'}}});
      }).toThrowError('The column "u.INVALID" is not available for an on condition.');
    });

    it('allows tables to be joined automatically.', function() {
      const query = new From(db, escaper, qryExec, 'users u')
        .innerJoin('u.phone_numbers pn');

      expect(query.toString()).toBe(
        'FROM    `users` AS `u`\n' +
        'INNER JOIN `phone_numbers` AS `pn` ON `u`.`userID` = `pn`.`userID`');
    });
  });

  /**
   * Left outer join.
   */
  describe('.leftOuterJoin()', function() {
    it('allows left outer joins.', function() {
      const query = new From(db, escaper, qryExec, {table: 'users', as: 'u'})
        .leftOuterJoin({table: 'phone_numbers', as: 'pn', on: {$eq: {'u.userID':'pn.userID'}}})
        .where({$is: {'pn.phoneNumberID':null}});

      expect(query.toString()).toBe(
        'FROM    `users` AS `u`\n' +
        'LEFT OUTER JOIN `phone_numbers` AS `pn` ON `u`.`userID` = `pn`.`userID`\n' +
        'WHERE   `pn`.`phoneNumberID` IS NULL');
    });

    it('allows tables to be joined automatically.', function() {
      const query = new From(db, escaper, qryExec, 'users u')
        .leftOuterJoin('u.phone_numbers pn');

      expect(query.toString()).toBe(
        'FROM    `users` AS `u`\n' +
        'LEFT OUTER JOIN `phone_numbers` AS `pn` ON `u`.`userID` = `pn`.`userID`');
    });
  });

  /**
   * Right outer join.
   */
  describe('.rightOuterJoin()', function() {
    it('allows right outer joins.', function() {
      const query = new From(db, escaper, qryExec, {table: 'users', as: 'u'})
        .rightOuterJoin({table: 'phone_numbers', as: 'pn', on: {$and: [{$eq: {'u.userID':'pn.userID'}},{$eq: {'pn.type':':phoneType'}}]}}, {phoneType: 'mobile'});

      expect(query.toString()).toBe(
        'FROM    `users` AS `u`\n' +
        'RIGHT OUTER JOIN `phone_numbers` AS `pn` ON (`u`.`userID` = `pn`.`userID` AND `pn`.`type` = \'mobile\')');
    });

    it('allows tables to be joined automatically.', function() {
      const query = new From(db, escaper, qryExec, 'users u')
        .rightOuterJoin('u.phone_numbers pn');

      expect(query.toString()).toBe(
        'FROM    `users` AS `u`\n' +
        'RIGHT OUTER JOIN `phone_numbers` AS `pn` ON `u`.`userID` = `pn`.`userID`');
    });
  });
});

