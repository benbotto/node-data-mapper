describe('bitToBool converter test.', function()
{
  'use strict';

  var bitToBool = require('./bitToBool');

  // Checks with a 0 buffer.
  it('checks with a 0 buffer.', function()
  {
    var b = new Buffer([0]);
    expect(bitToBool(b)).toBe(false);
  });

  // Checks with a 1 buffer.
  it('checks with a 1 buffer.', function()
  {
    var b = new Buffer([1]);
    expect(bitToBool(b)).toBe(true);
  });

  // Checks with a falsey value.
  it('checks with a falsey value.', function()
  {
    expect(bitToBool(null)).toBe(null);
    expect(bitToBool(undefined)).toBe(null);
    expect(bitToBool('')).toBe(null);
  });

  // Checks with numbers.
  it('checks with numbers.', function()
  {
    expect(bitToBool(0)).toBe(false);
    expect(bitToBool(1)).toBe(true);
    expect(bitToBool('1')).toBe(true);
    expect(bitToBool('0')).toBe(false);
  });
});

