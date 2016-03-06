describe('DataContext test suite', function()
{
  'use strict';

  var DataContext  = require('./DataContext');
  var Database     = require('../database/Database');
  var MySQLEscaper = require('../query/MySQLEscaper');
  var From         = require('../query/From');
  var Insert       = require('../query/Insert');
  var db           = new Database(require('../spec/testDB'));
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

  // Checks that an Insert query can be created.
  it('checks that an Insert query can be created.', function()
  {
    var dc     = new DataContext(db, escaper);
    var insert = dc.insert
    ({
      users:
      [
        {first: 'Sandy', last: 'Perkins'}
      ]
    });

    expect(insert instanceof Insert).toBe(true);
  });

  // Checks that a database can be passed as a second parameter.
  it('checks that a database can be passed as a second parameter.', function()
  {
    var dc     = new DataContext(db, escaper);
    var db2    = db.clone();
    var insert = dc.insert
    ({
      users:
      [
        {first: 'Sandy', last: 'Perkins'}
      ]
    }, db2);

    expect(insert instanceof Insert).toBe(true);
    expect(insert.getDatabase()).toBe(db2);
  });
});
