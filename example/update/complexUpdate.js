'use strict';

var bikeShopDC = require('../bikeShopDataContext');

// Give store keys to all employees that are over 21.
var query = bikeShopDC
  .from('staff')
  .where({$gt: {'staff.age':21}})
  .update({staff: {hasStoreKeys: true}});

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
