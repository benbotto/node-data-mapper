describe('Column()', function() {
  'use strict';

  require('../bootstrap');

  const insulin = require('insulin');
  const Column  = insulin.get('ndm_Column');

  /**
   * Constructor.
   */
  describe('.constructor()', function() {
    it('only needs a name.', function() {
      const col = new Column({name: 'TestCol'});
      expect(col.name).toBe('TestCol');
      expect(col.mapTo).toBe('TestCol');
      expect(col.isPrimary).toBe(false);
      expect(col.converter).toEqual({});
    });

    it('can accept a mapTo.', function() {
      const col = new Column({name: 'Testcol', mapTo: 'test', isPrimary: false});
      expect(col.name).toBe('Testcol');
      expect(col.mapTo).toBe('test');
      expect(col.isPrimary).toBe(false);
      expect(col.converter).toEqual({});
    });

    it('stores the isPrimary flag.', function() {
      const col = new Column({name: 'Testcol', isPrimary: true});
      expect(col.isPrimary).toBe(true);
    });

    it('can have converters attached.', function() {
      const converter = {};
      const col = new Column({name: 'Testcol', converter: converter});

      expect(col.converter).toBe(converter);
    });
  });
});

