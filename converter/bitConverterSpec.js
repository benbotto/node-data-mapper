xdescribe('bitConverter converter test.', function()
{
  'use strict';

  const bitConverter = require('./bitConverter');

  xdescribe('bitConverter onRetrieve test suite.', function() {
    // Checks with null values.
    it('checks with null values.', function() {
      expect(bitConverter.onRetrieve(null)).toBe(null);
      expect(bitConverter.onRetrieve(undefined)).toBe(null);
      expect(bitConverter.onRetrieve('')).toBe(null);
    });

    // Checks with a 0 buffer.
    it('checks with a 0 buffer.', function() {
      const b = new Buffer([0]);
      expect(bitConverter.onRetrieve(b)).toBe(false);
    });

    // Checks with a 1 buffer.
    it('checks with a 1 buffer.', function() {
      const b = new Buffer([1]);
      expect(bitConverter.onRetrieve(b)).toBe(true);
    });

    // Checks with numbers.
    it('checks with numbers.', function() {
      expect(bitConverter.onRetrieve(0)).toBe(false);
      expect(bitConverter.onRetrieve(1)).toBe(true);
      expect(bitConverter.onRetrieve('1')).toBe(true);
      expect(bitConverter.onRetrieve('0')).toBe(false);
    });
  });

  xdescribe('bitConverter onSave test suite.', function() {
    // Checks with null values.
    it('checks with null values.', function() {
      expect(bitConverter.onSave(null)).toBe(null);
      expect(bitConverter.onSave(undefined)).toBe(null);
      expect(bitConverter.onSave('')).toBe(null);
    });

    // Checks with boolean values.
    it('checks with boolean values.', function() {
      expect(bitConverter.onSave(true)).toBe(1);
      expect(bitConverter.onSave(1)).toBe(1);
      expect(bitConverter.onSave(false)).toBe(0);
      expect(bitConverter.onSave(0)).toBe(0);
    });
  });
});

