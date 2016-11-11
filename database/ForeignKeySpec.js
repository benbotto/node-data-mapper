describe('ForeignKey()', function() {
  'use strict';

  const insulin = require('insulin');
  const ForeignKey = insulin.get('ndm_ForeignKey');

  /**
   * Ctor.
   */
  describe('.constructor()', function() {
    it('throws an error if the table is not present.', function() {
      expect(function() {
        new ForeignKey({});
      }).toThrowError('table is required.');
    });

    it('throws an error if the column is not present.', function() {
      expect(function() {
        new ForeignKey({table: 'users'});
      }).toThrowError('column is required.');
    });

    it('throws an error if references is not present.', function() {
      expect(function() {
        new ForeignKey({table: 'users', column: 'userID'});
      }).toThrowError('references is required.');
    });

    it('throws an error if references.table is not present.', function() {
      expect(function() {
        new ForeignKey({table: 'users', column: 'userID', references: {}});
      }).toThrowError('Referenced table is required.');
    });

    it('throws an error if references.column is not present.', function() {
      expect(function() {
        new ForeignKey({table: 'users', column: 'userID', references: {table: 'users'}});
      }).toThrowError('Referenced column is required.');
    });

    it('preserves any extra properties.', function() {
      const fk = new ForeignKey({
        name:   'fk_users_userID',
        table:  'phone_numbers',
        column: 'userID',
        references: {
          table:  'users',
          column: 'userID'
        }
      });

      expect(fk.name).toBe('fk_users_userID'); // extra property.
      expect(fk.table).toBe('phone_numbers');
      expect(fk.column).toBe('userID');
      expect(fk.references.table).toBe('users');
      expect(fk.references.column).toBe('userID');
    });
  });
});

