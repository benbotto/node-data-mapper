describe('Query test suite.', function()
{
  'use strict';

  var Query = require('./Query');

  // Checks the constructor and getters.
  it('checks the constructor and getters.', function()
  {
    var db      = {};
    var escaper = {};
    var execr   = {};
    var q       = new Query(db, escaper, execr);

    expect(q.getDatabase()).toBe(db);
    expect(q.getEscaper()).toBe(escaper);
    expect(q.getQueryExecuter()).toBe(execr);
  });
});

