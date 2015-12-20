'use strict';

var util       = require('util');
var bikeShopDC = require('../bikeShopDataContext');

// Find all bonuses with the bonus's related staff member.
var query = bikeShopDC
  .from('bonuses')
  .innerJoin({table: 'staff', parent: 'bonuses',
    relType: 'single', on: {$eq: {'bonuses.staffID':'staff.staffID'}}})
  .select('bonuses.bonusID', 'bonuses.amount', 'staff.staffID', 'staff.firstName', 'staff.lastName');

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
