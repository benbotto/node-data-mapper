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

    var converter = {};
    var col4 = new Column({name: 'TestCol4', converter: converter});

    expect(col4.getConverter()).toBe(converter);
  });

  // Checks the toObject method.
  it('checks the toObject method.', function()
  {
    var col = new Column({name: 'TestCol'});
    expect(col.toObject()).toEqual({name: 'TestCol', alias: 'TestCol', isPrimary: false, converter: {}});

    var col2 = new Column({name: 'TestCol2', alias: 'test', isPrimary: false});
    expect(col2.toObject()).toEqual({name: 'TestCol2', alias: 'test', isPrimary: false, converter: {}});

    var col3 = new Column({name: 'TestCol3', isPrimary: true});
    expect(col3.toObject()).toEqual({name: 'TestCol3', alias: 'TestCol3', isPrimary: true, converter: {}});

    var converter = {onSave: 'foo', onRetrieve: 'bar'};
    var col4 = new Column({name: 'TestCol4', converter: converter});
    expect(col4.toObject()).toEqual({name: 'TestCol4', alias: 'TestCol4', isPrimary: false, converter: converter});
  });

  // Checks the clone method.
  it('checks the clone method.', function()
  {
    var col = new Column({name: 'userID', alias: 'ID', isPrimary: true, converter: {}});
    var clone = col.clone();

    expect(col.toObject()).toEqual(clone.toObject());
    
  });
});
