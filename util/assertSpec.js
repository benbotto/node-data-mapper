describe('assert function test suite', function()
{
  'use strict';

  var assert = require('./assert');

  // Checks true and false.
  it('checks true and false.', function()
  {
    expect(function()
    {
      assert(false, 'Error!');
    }).toThrowError('Error!');

    expect(function()
    {
      assert(true, 'Error!');
    }).not.toThrow();
  });

  // Checks truthy falues.
  it('checks truthy falues.', function()
  {
    expect(function()
    {
      assert('test', 'Error!');
    }).not.toThrow();

    expect(function()
    {
      assert(1, 'Error!');
    }).not.toThrow();

    expect(function()
    {
      assert(1 === 1, 'Error!');
    }).not.toThrow();
  });

  // Checks falsy values.
  it('checks falsy values.', function()
  {
    expect(function()
    {
      assert(0, 'Error!');
    }).toThrowError('Error!');

    expect(function()
    {
      assert(undefined, 'Error!');
    }).toThrowError('Error!');

    expect(function()
    {
      assert(null, 'Error!');
    }).toThrowError('Error!');

    expect(function()
    {
      assert(3 === 4, 'Error!');
    }).toThrowError('Error!');
  });
});
