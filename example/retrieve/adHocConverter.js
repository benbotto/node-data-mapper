'use strict';

var bikeShopDC = require('../bikeShopDataContext');

// Convert a str to upper case.
function ucConverter(str)
{
  return str.toUpperCase();
}

// The firstName property will be converted to upper case.
var query = bikeShopDC
  .from('staff')
  .select('staff.staffID', {column: 'staff.firstName', convert: ucConverter});

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
