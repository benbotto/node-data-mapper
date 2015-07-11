describe('Column test suite', function()
{
  'use strict';

  var Column = require(__dirname + '/../Column');

  // Checks the constructor.
  it('checks the constructor.', function()
  {
    var col = new Column('TestCol');
    expect(col.getName()).toBe('TestCol');
    expect(col.getAlias()).toBe('TestCol');

    var col2 = new Column('TestCol2', 'test');
    expect(col2.getName()).toBe('TestCol2');
    expect(col2.getAlias()).toBe('test');
  });
});
