describe('utcConverter', function() {
  'use strict';

  const insulin      = require('insulin');
  const utcConverter = insulin.get('ndm_utcConverter');
  const moment       = insulin.get('moment');

  /**
   * Save.
   */
  describe('.onSave()', function() {
    it('returns null when null or undefined is passed in.', function() {
      expect(utcConverter.onSave(null)).toBe(null);
      expect(utcConverter.onSave(undefined)).toBe(null);
      expect(utcConverter.onSave('')).toBe(null);
    });

    it('converts dates to UTC strings in ISO8601 format.', function() {
      const date    = new Date(2016, 0, 1);
      const dString = utcConverter.onSave(date);
      const mDate   = moment(dString, 'YYYY-MM-DD HH:mm:ss');

      expect(dString).toMatch(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/);
      expect(mDate.isValid()).toBe(true);
    });
  });
});

