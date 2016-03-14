describe('DataContext test suite', function()
{
  'use strict';

  var DataContext  = require('./DataContext');
  var Database     = require('../database/Database');
  var MySQLEscaper = require('../query/MySQLEscaper');
  var From         = require('../query/From');
  var Insert       = require('../query/Insert');
  var DeleteModel  = require('../query/DeleteModel');
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

  // Checks that a database can be passed as a second parameter to from.
  it('checks that a database can be passed as a second parameter to from.', function()
  {
    var dc   = new DataContext(db, escaper);
    var db2  = db.clone();
    var from = dc.from({table: 'users'}, db2);

    expect(from instanceof From).toBe(true);
    expect(from.getDatabase()).toBe(db2);
  });

  // Checks that an Insert query can be created.
  it('checks that an Insert query can be created.', function()
  {
    var dc     = new DataContext(db, escaper);
    var insert = dc.insert({});

    expect(insert instanceof Insert).toBe(true);
  });

  // Checks that a database can be passed as a second parameter to insert.
  it('checks that a database can be passed as a second parameter to insert.', function()
  {
    var dc     = new DataContext(db, escaper);
    var db2    = db.clone();
    var insert = dc.insert({}, db2);

    expect(insert.getDatabase()).toBe(db2);
  });

  // Checks that a Delete query can be created.
  it('checks that a Delete query can be created.', function()
  {
    var dc  = new DataContext(db, escaper);
    var del = dc.delete({});

    expect(del instanceof DeleteModel).toBe(true);
  });

  // Checks that a database can be passed as a second parameter to Delete.
  it('checks that a database can be passed as a second parameter to Delete.', function()
  {
    var dc  = new DataContext(db, escaper);
    var db2 = db.clone();
    var del = dc.delete({}, db2);

    expect(del.getDatabase()).toBe(db2);
  });
});

