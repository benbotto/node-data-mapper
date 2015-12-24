describe('Column test suite', function()
{
  'use strict';

  var Column = require('./Column');

  // Checks the constructor.
  it('checks the constructor.', function()
  {
    var col = new Column({name: 'TestCol'});
    expect(col.getName()).toBe('TestCol');
    expect(col.getAlias()).toBe('TestCol');
    expect(col.isPrimary()).toBe(false);
    expect(col.getConverter()).toEqual({});

    var col2 = new Column({name: 'TestCol2', alias: 'test', isPrimary: false});
    expect(col2.getName()).toBe('TestCol2');
    expect(col2.getAlias()).toBe('test');
    expect(col2.isPrimary()).toBe(false);
    expect(col2.getConverter()).toEqual({});

    var col3 = new Column({name: 'TestCol3', isPrimary: true});
    expect(col3.isPrimary()).toBe(true);

    var converter =
    {
      onRetrieve: function(r) { return r; },
      onSave:     function(s) { return s; }
    };
    var col4 = new Column({name: 'TestCol4', converter: converter});

    expect(col4.getConverter()).toBe(converter);
  });
});
