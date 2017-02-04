describe('booleanConverter', function() {
  'use strict';

  const insulin          = require('insulin');
  const booleanConverter = insulin.get('ndm_booleanConverter');

  /**
   * Retrieve.
   */
  describe('.onRetrieve()', function() {
    it('returns null when null or undefined is passed in.', function() {
      expect(booleanConverter.onRetrieve(null)).toBe(null);
      expect(booleanConverter.onRetrieve(undefined)).toBe(null);
      expect(booleanConverter.onRetrieve('')).toBe(null);
    });

    it('returns false when a Buffer holding 0 is passed in.', function() {
      const b = new Buffer([0]);
      expect(booleanConverter.onRetrieve(b)).toBe(false);
    });

    it('returns true when a Buffer containing 1 is passed in.', function() {
      const b = new Buffer([1]);
      expect(booleanConverter.onRetrieve(b)).toBe(true);
    });

    it('converts 1 and 0 to true and false, respectively.', function() {
      expect(booleanConverter.onRetrieve(0)).toBe(false);
      expect(booleanConverter.onRetrieve(1)).toBe(true);
      expect(booleanConverter.onRetrieve('1')).toBe(true);
      expect(booleanConverter.onRetrieve('0')).toBe(false);
    });
  });

  /**
   * Save.
   */
  describe('.onSave()', function() {
    it('returns null when null or undefined is passed in.', function() {
      expect(booleanConverter.onSave(null)).toBe(null);
      expect(booleanConverter.onSave(undefined)).toBe(null);
      expect(booleanConverter.onSave('')).toBe(null);
    });

    it('converts booleans to 1 and 0.', function() {
      expect(booleanConverter.onSave(true)).toBe(1);
      expect(booleanConverter.onSave(1)).toBe(1);
      expect(booleanConverter.onSave(false)).toBe(0);
      expect(booleanConverter.onSave(0)).toBe(0);
    });
  });
});

