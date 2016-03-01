'use strict';

var util       = require('util');
var bikeShopDC = require('../bikeShopDataContext');

// Find all bike shops with the bikes that each sells.  Note that no columns
// are selected from the lookup table (bike_shop_bikes), so it is excluded from
// the serialized result.  Also, the parent of the bikes table is set to
// bikeShops, so each bike shop will have an array of bikes.
var query = bikeShopDC
  .from('bike_shops')
  .innerJoin({table: 'bike_shop_bikes', on: {$eq: {'bikeShops.bikeShopID':'bikeShopBikes.bikeShopID'}}})
  .innerJoin({table: 'bikes', parent: 'bikeShops', on: {$eq: {'bikeShopBikes.bikeID':'bikes.bikeID'}}})
  .select('bikeShops.bikeShopID', 'bikeShops.name', 'bikes.bikeID', 'bikes.brand', 'bikes.model');

console.log('Query:');
console.log(query.toString(), '\n');

query.execute()
  .then(function(result)
  {
    console.log('Result:');
    console.log(util.inspect(result, {depth: null}));
  })
  .catch(function(err)
  {
    console.log(err);
  })
  .finally(function()
  {
    bikeShopDC.getQueryExecuter().getConnectionPool().end();
  });
