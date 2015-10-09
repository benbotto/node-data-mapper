describe('MySQLEscaper test suite.', function()
{
  'use strict';

  var Escaper      = require(__dirname + '/../query/Escaper');
  var MySQLEscaper = require(__dirname + '/../query/MySQLEscaper');
  var escaper      = new MySQLEscaper();

  describe('constructor test suite.', function()
  {
    // Makes sure that MySQLEscaper extends Escaper.
    it('makes sure that MySQLEscaper extends Escaper.', function()
    {
      expect(escaper instanceof Escaper).toBe(true);
      expect(escaper instanceof MySQLEscaper).toBe(true);
    });
  });

  describe('property escape test suite.', function()
  {
    // Escapes a property.
    it('escapes a property.', function()
    {
      expect(escaper.escapeProperty('name')).toBe('`name`');
    });
  });

  describe('literal escape test suite.', function()
  {
    // Escapes a string.
    it('escapes strings.', function()
    {
      expect(escaper.escapeLiteral('')).toBe('\'\'');
      expect(escaper.escapeLiteral('Sue')).toBe('\'Sue\'');
      expect(escaper.escapeLiteral("Dali's Mom's Deli")).toBe("'Dali\\'s Mom\\'s Deli'");
    });

    // Escapes numbers
    it('escapes numbers.', function()
    {
      expect(escaper.escapeLiteral(32)).toBe('32');
      expect(escaper.escapeLiteral(1.2)).toBe('1.2');
      expect(escaper.escapeLiteral(0)).toBe('0');
    });

    // Escapes null and undefined.
    it('escapes null and undefined.', function()
    {
      expect(escaper.escapeLiteral(null)).toBe('NULL');
      expect(escaper.escapeLiteral(undefined)).toBe('NULL');
    });

    // Note: See node-mysql for escape details.
  });

  describe('fully-qualified column escape test suite.', function()
  {
    // Escapes a fully-qualified column.
    it('escapes a fully-qualified column.', function()
    {
      expect(escaper.escapeFullyQualifiedColumn('users.firstName')).toBe('`users`.`firstName`');
      expect(escaper.escapeFullyQualifiedColumn('users.first.Name')).toBe('`users`.`first.Name`');
      expect(escaper.escapeFullyQualifiedColumn('phone_numbers.phoneNumber')).toBe('`phone_numbers`.`phoneNumber`');
      expect(escaper.escapeFullyQualifiedColumn('phoneNumber')).toBe('`phoneNumber`');
    });
  });
});

