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
    function callback() {}
    var query = 'SELECT userID FROM users';
    qe.select(query, callback);

    expect(con.query.calls.argsFor(0)).toEqual([query, callback]);
  });

  // Checks the insert method.
  it('checks the insert method.', function()
  {
    function callback() {}
    var query = 'INSERT INTO users (userName) VALUES (\'foo bar\')';
    qe.insert(query, callback);

    expect(con.query.calls.argsFor(0)).toEqual([query, callback]);
  });
});

