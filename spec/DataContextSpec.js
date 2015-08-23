describe('DataContext test suite', function()
{
  'use strict';

  var DataContext = require(__dirname + '/../DataContext');
  var Database    = require(__dirname + '/../Database');
  var db          = new Database(require(__dirname + '/resource/testDB.json'));

  // Checks the constructor.
  it('checks the constructor.', function()
  {
    var dc = new DataContext(db);

    expect(dc.getDatabase()).toBe(db);
  });
});
