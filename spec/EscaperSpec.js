describe('Escaper test suite.', function()
{
  'use strict';

  var Escaper = require(__dirname + '/../query/Escaper');
  var escaper = new Escaper();

  describe('property escape test suite.', function()
  {
    // Checks that escapeProperty is required.
    it('checks that escapeProperty is required.', function()
    {
      expect(function()
      {
        escaper.escapeProperty();
      }).toThrowError('Function escapeProperty() is not implemented.');
    });
  });

  describe('literal escape test suite.', function()
  {
    // Checks that escapeProperty is required.
    it('checks that escapeProperty is required.', function()
    {
      expect(function()
      {
        escaper.escapeLiteral();
      }).toThrowError('Function escapeLiteral() is not implemented.');
    });
  });

  describe('fully-qualified column escape test suite.', function()
  {
    // Verifies that escapeFullyQualifiedColumn can't be called on the base class.
    it('verifies that escapeFullyQualifiedColumn can\'t be called on the base class.', function()
    {
      expect(function()
      {
        escaper.escapeFullyQualifiedColumn('u.name');
      }).toThrowError('Function escapeProperty() is not implemented.');
    });
  });
});

