describe('From (SELECT query) test suite', function()
{
  'use strict';

  var From     = require(__dirname + '/../query/From');
  var Database = require(__dirname + '/../Database');
  var db       = new Database(require(__dirname + '/resource/testDB.json'));

  // Checks the constructor.
  it('checks the constructor.', function()
  {
    expect(function()
    {
      new From(db, 'users');
    }).not.toThrow();

    expect(function()
    {
      new From(db, 'INVALID_NAME');
    }).toThrowError('Table INVALID_NAME does not exist in database testDB.');
  });

  // Checks that a basic select without columns specified is correct.
  it('checks that a basic select without columns specified is correct.', function()
  {
    var query = new From(db, 'users');

    expect(query.toString()).toBe
    (
      'SELECT  `users`.`userID` AS `users.userID`, `users`.`firstName` AS `users.firstName`, `users`.`lastName` AS `users.lastName`\n' +
      'FROM    `users` AS `users`'
    );
  });

  // Checks that a basic select with columns specified is correct.
  it('checks that a basic select with columns specified is correct.', function()
  {
    /*var query = new From(db, 'users')
      .select(['users.firstName', 'users.lastName']);

    // Note that the primary key is implicitly added.
    expect(query.toString()).toBe
    (
      'SELECT  `users`.`firstName` AS `users.firstName`, `users`.`lastName` AS `users.lastName`, `users`.`userID` AS `users.userID`\n' +
      'FROM    `users` AS `users`'
    );*/
  });
});
