'use strict';

var bikeShopDC = require('../bikeShopDataContext');

// Find all employees that have received bonuses.
var query = bikeShopDC
  .from('staff')
  .leftOuterJoin({table: 'bonuses', on: {$eq: {'staff.staffID':'bonuses.bonusID'}}})
  .select('staff.staffID', 'staff.firstName', 'staff.lastName')
  .where({$is: {'bonuses.bonusID': null}});

console.log('Query:');
console.log(query.toString(), '\n');

query.execute().then(function(result)
{
  console.log('Result:');
  console.log(result);
})
.catch(function(err)
{
  console.log(err);
}).finally(function()
{
  bikeShopDC.getQueryExecuter().getConnectionPool().end();
});
