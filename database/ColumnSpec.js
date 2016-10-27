describe('Column()', function() {
  'use strict';

  const Column = require('./Column');

  /**
   * Constructor.
   */
  describe('.constructor()', function() {
    it('checks the constructor.', function() {
      const col = new Column({name: 'TestCol'});
      expect(col.name).toBe('TestCol');
      expect(col.mapTo).toBe('TestCol');
      expect(col.isPrimary).toBe(false);
      expect(col.converter).toEqual({});

      const col2 = new Column({name: 'TestCol2', mapTo: 'test', isPrimary: false});
      expect(col2.name).toBe('TestCol2');
      expect(col2.mapTo).toBe('test');
      expect(col2.isPrimary).toBe(false);
      expect(col2.converter).toEqual({});

      const col3 = new Column({name: 'TestCol3', isPrimary: true});
      expect(col3.isPrimary).toBe(true);

      const converter = {};
      const col4 = new Column({name: 'TestCol4', converter: converter});

      expect(col4.converter).toBe(converter);
    });
  });
});

