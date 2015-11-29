describe('MySQLDataContext test suite', function()
{
  'use strict';

  var DataContext      = require(__dirname + '/DataContext');
  var MySQLDataContext = require(__dirname + '/MySQLDataContext');
  var Database         = require(__dirname + '/../database/Database');
  var db               = new Database(require(__dirname + '/../spec/testDB.json'));
  var pool             = {};

  // Checks the constructor.
  it('checks the constructor.', function()
  {
    var dc = new MySQLDataContext(db, pool);

    expect(dc instanceof DataContext).toBe(true);
    expect(dc.getQueryExecuter().getConnectionPool()).toBe(pool);
  });
});
