describe('Column test suite', function()
{
  'use strict';

  var Column = require(__dirname + '/../Column');

  // Checks the constructor.
  it('checks the constructor.', function()
  {
    var col = new Column({name: 'TestCol'});
    expect(col.getName()).toBe('TestCol');
    expect(col.getAlias()).toBe('TestCol');
    expect(col.isPrimary()).toBe(false);

    var col2 = new Column({name: 'TestCol2', alias: 'test', isPrimary: false});
    expect(col2.getName()).toBe('TestCol2');
    expect(col2.getAlias()).toBe('test');
    expect(col2.isPrimary()).toBe(false);

    var col3 = new Column({name: 'TestCol3', isPrimary: true});
    expect(col3.isPrimary()).toBe(true);
  });
});
