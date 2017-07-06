describe('ConditionError()', function() {
  'use strict';

  const insulin        = require('insulin');
  const ConditionError = insulin.get('ndm_ConditionError');

  describe('.constructor()', function() {
    it('has the correct message, name, detail, and code.', function() {
      let ce = new ConditionError('An error.');

      expect(ce.name).toBe('ConditionError');
      expect(ce.code).toBe('CONDITION_ERROR');
      expect(ce.message).toBe('An error.');
      expect(ce.detail).toBe('An error.');
    });
  });
});

