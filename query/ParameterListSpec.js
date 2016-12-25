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
   * Create parameter name.
   */
  describe('.createParameterName()', function() {
    let paramList;

    beforeEach(() => paramList = new ParameterList());

    it('replaces non-word characters with underscores.', function() {
      expect(paramList.createParameterName('here"is a.name')).toBe('here_is_a_name_0');
    });

    it('adds an ID at the end of each parameter.', function() {
      expect(paramList.createParameterName('name')).toBe('name_0');
      expect(paramList.createParameterName('name')).toBe('name_1');
      expect(paramList.createParameterName('name')).toBe('name_2');
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

    it('raises an exception of the parameter has invalid characters.', function() {
      paramList.addParameter('test-1',   'asdf');
      paramList.addParameter('test_2',   'asdf');
      paramList.addParameter('test_2-3', 'asdf');

      expect(function() {
        paramList.addParameter('0test', 'asdf');
      }).toThrowError('Parameter keys must match "/^[A-Za-z][\\w\\-]*$/".');
    });
  });

  /**
   * Add parameters.
   */
  describe('.addParameters()', function() {
    let paramList;

    beforeEach(() => paramList = new ParameterList());

    it('can copy key-value pairs from an object.', function() {
      const params = {name: 'Jack', age: 50};
      paramList.addParameters(params);
    });
  });
});

