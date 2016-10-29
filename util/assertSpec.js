describe('assert()', function() {
  'use strict';

  const insulin = require('insulin');
  const assert  = insulin.get('ndm_assert');

  it('allows booleans to be used directly.', function() {
    expect(function() {
      assert(false, 'Error!');
    }).toThrowError('Error!');

    expect(function() {
      assert(true, 'Error!');
    }).not.toThrow();
  });

  it('can use truthy values.', function() {
    expect(function() {
      assert('test', 'Error!');
    }).not.toThrow();

    expect(function() {
      assert(1, 'Error!');
    }).not.toThrow();

    expect(function() {
      assert(1 === 1, 'Error!');
    }).not.toThrow();
  });

  it('throws on falsy values.', function() {
    expect(function() {
      assert(0, 'Error!');
    }).toThrowError('Error!');

    expect(function() {
      assert(undefined, 'Error!');
    }).toThrowError('Error!');

    expect(function() {
      assert(null, 'Error!');
    }).toThrowError('Error!');

    expect(function() {
      assert(3 === 4, 'Error!');
    }).toThrowError('Error!');
  });
});

