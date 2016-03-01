'use strict';

var bikeShopDC = require('../bikeShopDataContext');

// Alias the table and columns.
var query = bikeShopDC
  .from({table: 'bike_shops', as: 'shops'})
  .select({column: 'shops.bikeShopID', as: 'id'}, {column: 'shops.name', as: 'shopName'});

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
