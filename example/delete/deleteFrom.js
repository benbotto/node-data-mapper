'use strict';

var bikeShopDC = require('../bikeShopDataContext');

// Delete all employees that are over 50.
var query = bikeShopDC
  .from('staff')
  .where({$gt: {'staff.age': 50}})
  .delete('staff');

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
  })
  .finally(function()
  {
    bikeShopDC.getQueryExecuter().getConnectionPool().end();
  });
