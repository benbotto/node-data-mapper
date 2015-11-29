'use strict';

var testDC = require(__dirname + '/testDataContext');

try
{
  var query = testDC
    .from('people')
    .leftOuterJoin({table: 'phoneNumbers', parent: 'people', on: {$eq: {'people.personID':'phoneNumbers.personID'}}})
    .select('people.personID', 'people.firstName', 'people.lastName', 'phoneNumbers.phoneNumberID', 'phoneNumbers.phone');

  console.log(query.toString());

  query.execute().then(function(result)
  {
    console.log(result);
    testDC.getQueryExecuter().getConnectionPool().end();
  })
  .catch(function(err)
  {
    console.log('Error.');
    console.log(err);
  }).finally(function()
  {
    testDC.getQueryExecuter().getConnectionPool().end();
  });
}
catch (ex)
{
  console.log('Exception');
  console.log(ex);
  testDC.getQueryExecuter().getConnectionPool().end();
}
