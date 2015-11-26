describe('DataContext test suite', function()
{
  'use strict';

  var DataContext  = require(__dirname + '/../DataContext');
  var Database     = require(__dirname + '/../Database');
  var MySQLEscaper = require(__dirname + '/../query/MySQLEscaper');
  var From         = require(__dirname + '/../query/From');
  var db           = new Database(require(__dirname + '/resource/testDB.json'));
  var escaper      = new MySQLEscaper();

  // Checks the constructor.
  it('checks the constructor.', function()
  {
    var dc = new DataContext(db, escaper);

    expect(dc.getDatabase()).toBe(db);
    expect(dc.getEscaper()).toBe(escaper);
  });

  // Checks that a From query can be created.
  it('checks that a From query can be created.', function()
  {
    var dc   = new DataContext(db, escaper);
    var from = dc.from({table: 'users'});

    expect(from instanceof From).toBe(true);
  });
});
