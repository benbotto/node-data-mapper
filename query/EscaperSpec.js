describe('Escaper()', function() {
  'use strict';

  const insulin = require('insulin');
  const Escaper = insulin.get('ndm_Escaper');
  const escaper = new Escaper();

  /**
   * Escape property.
   */
  describe('.escapeProperty()', function() {
    it('is required to be implemented.', function() {
      expect(function() {
        escaper.escapeProperty();
      }).toThrowError('Function escapeProperty() is not implemented.');
    });
  });

  /**
   * Escape literal.
   */
  describe('.escapeLiteral()', function() {
    it('is required to be implemented.', function() {
      expect(function() {
        escaper.escapeLiteral();
      }).toThrowError('Function escapeLiteral() is not implemented.');
    });
  });

  /**
   * Escape fully-qualified column name.
   */
  describe('.escapeFullyQualifiedColumn()', function() {
    it('cannot be invoked without implementations of escapeProperty() and escapeLiteral().', function() {
      expect(function() {
        escaper.escapeFullyQualifiedColumn('u.name');
      }).toThrowError('Function escapeProperty() is not implemented.');
    });
  });
});

