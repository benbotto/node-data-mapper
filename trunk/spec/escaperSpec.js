describe('escaper test suite.', function()
{
  'use strict';

  var escaper = require(__dirname + '/../query/escaper');

  describe('escaper constructor test suite.', function()
  {
    // Checks the db type.
    it('checks the db type.', function()
    {
      // Defaults to MYSQL.
      expect(escaper.getDBType()).toBe(escaper.DB_TYPE.MYSQL);
      escaper.setDBType(escaper.DB_TYPE.MYSQL);
      expect(escaper.getDBType()).toBe(escaper.DB_TYPE.MYSQL);
      escaper.setDBType(escaper.DB_TYPE.MSSQL);
      expect(escaper.getDBType()).toBe(escaper.DB_TYPE.MSSQL);

      expect(function()
      {
        escaper.setDBType(2);
      }).toThrowError('Invalid database type.');
    });
  });

  describe('property escape test suite.', function()
  {
    // Escapes a MYSQL property.
    it('escapes a MYSQL property.', function()
    {
      escaper.setDBType(escaper.DB_TYPE.MYSQL);
      expect(escaper.escapeProperty('name')).toBe('`name`');
    });

    // Escapes a MSSQL property.
    it('escapes a MSSQL property.', function()
    {
      escaper.setDBType(escaper.DB_TYPE.MSSQL);
      expect(escaper.escapeProperty('name')).toBe('[name]');
    });
  });

  describe('literal escape test suite.', function()
  {
    // Escapes a string.
    it('escapes strings.', function()
    {
      expect(escaper.escapeLiteral('')).toBe('\'\'');
      expect(escaper.escapeLiteral('Sue')).toBe('\'Sue\'');
      expect(escaper.escapeLiteral('Dali\'s Mom\'s Deli')).toBe('\'Dali\'\'s Mom\'\'s Deli\'');
    });

    // Escapes numbers
    it('escapes numbers.', function()
    {
      expect(escaper.escapeLiteral(32)).toBe(32);
      expect(escaper.escapeLiteral(1.2)).toBe(1.2);
      expect(escaper.escapeLiteral(0)).toBe(0);
    });
  });

  describe('fully-qualified column escape test suite.', function()
  {
    // Escapes a fully-qualified column.
    it('escapes a fully-qualified column.', function()
    {
      escaper.setDBType(escaper.DB_TYPE.MYSQL);
      expect(escaper.escapeFullyQualifiedColumn('users.firstName')).toBe('`users`.`firstName`');
      expect(escaper.escapeFullyQualifiedColumn('users.first.Name')).toBe('`users`.`first.Name`');
      expect(escaper.escapeFullyQualifiedColumn('phone_numbers.phoneNumber')).toBe('`phone_numbers`.`phoneNumber`');
      expect(escaper.escapeFullyQualifiedColumn('phoneNumber')).toBe('`phoneNumber`');
    });
  });
});

