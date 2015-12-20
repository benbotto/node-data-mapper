'use strict';

var util       = require('util');
var bikeShopDC = require('../bikeShopDataContext');

// Find all employees that have received bonuses.
var query = bikeShopDC
  .from('staff')
  .innerJoin({table: 'bonuses', parent: 'staff', on: {$eq: {'staff.staffID':'bonuses.bonusID'}}})
  .select('staff.staffID', 'staff.firstName', 'staff.lastName', 'bonuses.bonusID', 'bonuses.amount');

console.log('Query:');
console.log(query.toString(), '\n');

query.execute().then(function(result)
{
  console.log('Result:');
  console.log(util.inspect(result, {depth: null}));
})
.catch(function(err)
{
  console.log(err);
}).finally(function()
{
  bikeShopDC.getQueryExecuter().getConnectionPool().end();
});
