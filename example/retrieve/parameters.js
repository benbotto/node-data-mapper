'use strict';

var bikeShopDC = require('../bikeShopDataContext');

// Find employees with a firstName of "Valerie."
var query = bikeShopDC
  .from('staff')
  .where({$eq: {'staff.firstName':':firstName'}}, {firstName: 'Valerie'});

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
