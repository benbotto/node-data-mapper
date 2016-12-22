describe('ParameterList()', function() {
  'use strict';

  const insulin       = require('insulin');
  const ParameterList = insulin.get('ndm_ParameterList');

  /**
   * Ctor.
   */
  describe('.constructor()', function() {
    it('initially contains no parameters.', function() {
      const paramList = new ParameterList();

      expect(Object.keys(paramList.params).length).toBe(0);
    });
  });

  /**
   * Add parameter.
   */
  describe('.addParameter()', function() {
    let paramList;

    beforeEach(() => paramList = new ParameterList());

    it('stores the parameter.', function() {
      paramList.addParameter('name', 'Jack');
      expect(paramList.params.name).toBe('Jack');
    });

    it('raises an exception if the param already exists and the value is different.', function() {
      expect(function() {
        paramList.addParameter('name', 'Jack');
        paramList.addParameter('name', 'Jill');
      }).toThrowError('Parameter "name" already exists with value "Jack".');
    });

    it('does not raise an exception if the same key-value pair is set twice.', function() {
      expect(function() {
        paramList.addParameter('name', 'Jack');
        paramList.addParameter('name', 'Jack');
      }).not.toThrow();
    });

    it('allows parameters to be blindly overwritten.', function() {
      expect(function() {
        paramList.addParameter('name', 'Jack');
        paramList.addParameter('name', 'Jill', true);
      }).not.toThrow();
    });
  });
});

