'use strict';

var bikeShopDC = require(__dirname + '/../bikeShopDataContext');

// Select all columns from the bike_shops table.
var query = bikeShopDC.from('bike_shops');

// This is the query that will be executed.
console.log(query.toString());

query.execute().then(function(result)
{
  console.log(result);
})
.catch(function(err)
{
  console.log(err);
}).finally(function()
{
  bikeShopDC.getQueryExecuter().getConnectionPool().end();
});
