'use strict';

var bikeShopDC = require('../bikeShopDataContext');

// Order by the shop name.
var query = bikeShopDC
  .from('bike_shops')
  .select('bikeShops.bikeShopID', 'bikeShops.name')
  .orderBy('bikeShops.name');

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
