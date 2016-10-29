xdescribe('QueryExeucter test suite.', function()
{
  'use strict';

  var QueryExecuter = require('./QueryExecuter');
  var qe;

  beforeEach(function()
  {
    qe = new QueryExecuter();
  });

  // Checks that select is not implemented.
  it('checks that select is not implemented.', function()
  {
    expect(function()
    {
      qe.select();
    }).toThrowError('QueryExecuter::select not implemented.');
  });

  // Checks that update is not implemented.
  it('checks that update is not implemented.', function()
  {
    expect(function()
    {
      qe.update();
    }).toThrowError('QueryExecuter::update not implemented.');
  });

  // Checks that delete is not implemented.
  it('checks that delete is not implemented.', function()
  {
    expect(function()
    {
      qe.delete();
    }).toThrowError('QueryExecuter::delete not implemented.');
  });

  // Checks that insert is not implemented.
  it('checks that insert is not implemented.', function()
  {
    expect(function()
    {
      qe.insert();
    }).toThrowError('QueryExecuter::insert not implemented.');
  });
});

