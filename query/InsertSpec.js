describe('Insert test suite.', function()
{
  'use strict';

  var Insert       = require('./Insert');
  var Database     = require('../database/Database');
  var MySQLEscaper = require('./MySQLEscaper');
  var db           = new Database(require('../spec/testDB.json'));
  var escaper      = new MySQLEscaper();
  var qryExec;

  beforeEach(function()
  {
    qryExec = jasmine.createSpyObj('qryExec', ['insert']);
  });

  describe('Insert constructor test suite.', function()
  {
    // Checks the basic constructor.
    it('checks the basic constructor.', function()
    {
      new Insert(db, escaper, qryExec, {});
    });
  });
});

