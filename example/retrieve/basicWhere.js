'use strict';

var bikeShopDC = require('../bikeShopDataContext');

// Find all employees that can drink.
var query = bikeShopDC
  .from('staff')
  .where({$gt: {'staff.age':21}})
  .select();

console.log('Query:');
console.log(query.toString(), '\n');

query.execute()
  .then(function(result)
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
