describe('utcConverter converter test.', function()
{
  'use strict';

  var utcConverter = require('./utcConverter');
  var moment       = require('moment');

  describe('utcConverter onSave test suite.', function()
  {
    // Checks with null values.
    it('checks with null values.', function()
    {
      expect(utcConverter.onSave(null)).toBe(null);
      expect(utcConverter.onSave(undefined)).toBe(null);
      expect(utcConverter.onSave('')).toBe(null);
    });

    // Checks with a valid date.
    it('checks with a valid date.', function()
    {
      var date    = new Date(2016, 0, 1);
      var dString = utcConverter.onSave(date);
      var mDate   = moment(dString, 'YYYY-MM-DD HH:mm:ss');

      expect(dString).toMatch(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/);
      expect(mDate.isValid()).toBe(true);
    });
  });
});
