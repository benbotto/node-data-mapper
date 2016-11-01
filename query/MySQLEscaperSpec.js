describe('MySQLEscaper()', function() {
  'use strict';

  const insulin      = require('insulin');
  const Escaper      = insulin.get('ndm_Escaper');
  const MySQLEscaper = insulin.get('ndm_MySQLEscaper');
  const escaper      = new MySQLEscaper();

  /**
   * Ctor.
   */
  describe('.constructor().', function() {
    it('extends Escaper.', function() {
      expect(escaper instanceof Escaper).toBe(true);
      expect(escaper instanceof MySQLEscaper).toBe(true);
    });
  });

  /**
   * Escape property.
   */
  describe('.escapeProperty()', function() {
    it('escapes strings.', function() {
      expect(escaper.escapeProperty('name')).toBe('`name`');
    });

    it('preserves dots.', function() {
      expect(escaper.escapeProperty('my.name')).toBe('`my.name`');
    });

    // Note: see mysql.escapeId.
  });

  /**
   * Escape literal.
   */
  describe('.escapeLiteral()', function() {
    it('escapes strings.', function() {
      expect(escaper.escapeLiteral('')).toBe('\'\'');
      expect(escaper.escapeLiteral('Sue')).toBe('\'Sue\'');
      expect(escaper.escapeLiteral("Dali's Mom's Deli")).toBe("'Dali\\'s Mom\\'s Deli'");
    });

    it('escapes numbers.', function() {
      expect(escaper.escapeLiteral(32)).toBe('32');
      expect(escaper.escapeLiteral(1.2)).toBe('1.2');
      expect(escaper.escapeLiteral(0)).toBe('0');
    });

    it('escapes null and undefined as NULL.', function() {
      expect(escaper.escapeLiteral(null)).toBe('NULL');
      expect(escaper.escapeLiteral(undefined)).toBe('NULL');
    });

    // Note: See node-mysql for escape details.
  });

  /**
   * Escape FQC.
   */
  describe('.escapeFullqyQualifiedColumn()', function() {
    // Escapes a fully-qualified column.
    it('escapes the table and the column independently.', function() {
      expect(escaper.escapeFullyQualifiedColumn('users.firstName')).toBe('`users`.`firstName`');
      expect(escaper.escapeFullyQualifiedColumn('users.first.Name')).toBe('`users`.`first.Name`');
      expect(escaper.escapeFullyQualifiedColumn('phone_numbers.phoneNumber')).toBe('`phone_numbers`.`phoneNumber`');
      expect(escaper.escapeFullyQualifiedColumn('phoneNumber')).toBe('`phoneNumber`');
    });
  });
});

