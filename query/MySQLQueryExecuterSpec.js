describe('MySQLQueryExecuter test suite.', function()
{
  'use strict';

  var MySQLQueryExecuter = require('./MySQLQueryExecuter');
  var qe, con;

  beforeEach(function()
  {
    // Mocked node-mysql connection.
    con = jasmine.createSpyObj('con', ['query']);

    qe = new MySQLQueryExecuter(con);
  });

  // Checks the select method.
  it('checks the select method.', function()
  {
    var callback = null; // Only checking the argument.  Normally this is a function.
    var query    = 'SELECT userID FROM users';
    qe.select(query, callback);

    expect(con.query.calls.argsFor(0)).toEqual([query, callback]);
  });

  // Checks the insert method.
  it('checks the insert method.', function()
  {
    var callback = null;
    var query = 'INSERT INTO users (userName) VALUES (\'foo bar\')';
    qe.insert(query, callback);

    expect(con.query.calls.argsFor(0)).toEqual([query, callback]);
  });

  // Checks the delete method.
  it('checks the delete method.', function()
  {
    var callback = null;
    var query = 'DELETE FROM users WHERE userID = 1';
    qe.delete(query, callback);

    expect(con.query.calls.argsFor(0)).toEqual([query, callback]);
  });
});

