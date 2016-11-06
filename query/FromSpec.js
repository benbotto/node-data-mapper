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

    it('throws an error if the table alias contains non-word characters.', function() {
      expect(function() {
        new From(db, escaper, qryExec, {table: 'users', as: 'users alias'});
      }).toThrowError('Alises must only contain word characters.');

      expect(function() {
        new From(db, escaper, qryExec, {table: 'users', as: 'users.alias'});
      }).toThrowError('Alises must only contain word characters.');
    });
  });

  /**
   * Create fully-qualified column name.
   */
  describe('.createFQColName()', function() {
    it('returns the unescaped name.', function() {
      const from = new From(db, escaper, qryExec, {table: 'users'});
      expect(from.createFQColName('users', 'firstName')).toBe('users.firstName');
    });
  });

  /**
   * Is column available.
   */
  describe('.isColumnAvailable()', function() {
    it('returns true when a column is available.', function() {
      const from = new From(db, escaper, qryExec, {table: 'users'});
      expect(from.isColumnAvailable('users.firstName')).toBe(true);
      expect(from.isColumnAvailable('users.lastName')).toBe(true);
    });

    it('returns false when a column is not available.', function() {
      const from = new From(db, escaper, qryExec, {table: 'users'});
      expect(from.isColumnAvailable('users.other')).toBe(false);
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
      }).toThrowError('The column alias userID is not available for a where condition.');
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
   * Inner join.
   */
  describe('.innerJoin()', function() {
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
      }).toThrowError('The column alias u.INVALID is not available for an on condition.');
    });

    it('throws an error if a parent is supplied which does not match a table alias.', function() {
      expect(function() {
        new From(db, escaper, qryExec, 'users')
          .innerJoin({table: 'phone_numbers', as: 'pn', parent: 'BAD_NAME'});
      }).toThrowError('Parent table alias BAD_NAME is not a valid table alias.');
    });

    it('throw an error if the mapTo is already used at the top level.', function() {
      expect(function() {
        new From(db, escaper, qryExec, {table: 'users', as: 'u1', mapTo: 'users'})
          .innerJoin({table: 'users', as: 'u2', mapTo: 'users'});
      }).toThrowError('The mapping "users" is not unique.');
    });

    it('throw an error if the mapTo is already used for a given parent.', function() {
      expect(function() {
        new From(db, escaper, qryExec, {table: 'users', as: 'u1', mapTo: 'users'})
          .innerJoin({table: 'users', as: 'u2', mapTo: 'users'});
      }).toThrowError('The mapping "users" is not unique.');
    });

    it('allows the same mapTo provided the parent is different.', function() {
      expect(function() {
        new From(db, escaper, qryExec, {table: 'users', as: 'u'})
          .innerJoin({table: 'phone_numbers', as: 'pn1', mapTo: 'phone', parent: 'u'})
          .innerJoin({table: 'phone_numbers', as: 'pn1', mapTo: 'phone', parent: 'u'});
      }).toThrowError('The mapping "phone" is not unique.');
    });

    it('allows the same mapTo if one is top-level and one is not.', function() {
      expect(function() {
        new From(db, escaper, qryExec, {table: 'users', as: 'u'})
          .innerJoin({table: 'phone_numbers', as: 'pn', mapTo: 'phone', parent: 'u'})
          .innerJoin({table: 'users', as: 'u2', mapTo: 'users', parent: 'pn'});
      }).not.toThrow();
    });

    it('allows the same table to be nested twice under the same table if the mapTo is unique.', function() {
      expect(function() {
        new From(db, escaper, qryExec, {table: 'users', as: 'u'})
          .innerJoin({table: 'phone_numbers', as: 'pn1', mapTo: 'phone', parent: 'u'})
          .innerJoin({table: 'phone_numbers', as: 'pn1', mapTo: 'phone2', parent: 'u'});
      }).not.toThrow();
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
  });
});

