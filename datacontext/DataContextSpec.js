describe('DataContext test suite', function()
{
  'use strict';

  var DataContext  = require('./DataContext');
  var Database     = require('../database/Database');
  var MySQLEscaper = require('../query/MySQLEscaper');
  var From         = require('../query/From');
  var db           = new Database(require('../spec/testDB.json'));
  var escaper      = new MySQLEscaper();
  var exec         = {};

  // Checks the constructor.
  it('checks the constructor.', function()
  {
    var dc = new DataContext(db, escaper, exec);

    expect(dc.getDatabase()).toBe(db);
    expect(dc.getEscaper()).toBe(escaper);
    expect(dc.getQueryExecuter()).toBe(exec);
  });

  // Checks that a From query can be created.
  it('checks that a From query can be created.', function()
  {
    var dc   = new DataContext(db, escaper);
    var from = dc.from({table: 'users'});

    expect(from instanceof From).toBe(true);
  });
});
