describe('bitConverter', function() {
  'use strict';

  const insulin      = require('insulin');
  const bitConverter = insulin.get('ndm_bitConverter');

  describe('.onRetrieve()', function() {
    it('returns null when null or undefined is passed in.', function() {
      expect(bitConverter.onRetrieve(null)).toBe(null);
      expect(bitConverter.onRetrieve(undefined)).toBe(null);
      expect(bitConverter.onRetrieve('')).toBe(null);
    });

    it('returns false when a Buffer holding 0 is passed in.', function() {
      const b = new Buffer([0]);
      expect(bitConverter.onRetrieve(b)).toBe(false);
    });

    it('returns true when a Buffer containing 1 is passed in.', function() {
      const b = new Buffer([1]);
      expect(bitConverter.onRetrieve(b)).toBe(true);
    });

    it('converts 1 and 0 to true and false, respectively.', function() {
      expect(bitConverter.onRetrieve(0)).toBe(false);
      expect(bitConverter.onRetrieve(1)).toBe(true);
      expect(bitConverter.onRetrieve('1')).toBe(true);
      expect(bitConverter.onRetrieve('0')).toBe(false);
    });
  });

  describe('.onSave()', function() {
    it('returns null when null or undefined is passed in.', function() {
      expect(bitConverter.onSave(null)).toBe(null);
      expect(bitConverter.onSave(undefined)).toBe(null);
      expect(bitConverter.onSave('')).toBe(null);
    });

    it('converts booleans to 1 and 0.', function() {
      expect(bitConverter.onSave(true)).toBe(1);
      expect(bitConverter.onSave(1)).toBe(1);
      expect(bitConverter.onSave(false)).toBe(0);
      expect(bitConverter.onSave(0)).toBe(0);
    });
  });
});

