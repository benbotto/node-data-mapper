describe('MySQLDataContext test suite', function()
{
  'use strict';

  var DataContext      = require('./DataContext');
  var MySQLDataContext = require('./MySQLDataContext');
  var Database         = require('../database/Database');
  var db               = new Database(require('../spec/testDB.json'));
  var pool             = {};

  // Checks the constructor.
  it('checks the constructor.', function()
  {
    var dc = new MySQLDataContext(db, pool);

    expect(dc instanceof DataContext).toBe(true);
    expect(dc.getQueryExecuter().getConnectionPool()).toBe(pool);
  });
});
