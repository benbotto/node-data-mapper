'use strict';

var bikeShopDC = require('../bikeShopDataContext');

// Order by hasStoreKeys DESC, then by staff.firstName.
var query = bikeShopDC
  .from('staff')
  .select('staff.staffID', 'staff.hasStoreKeys', 'staff.firstName')
  .orderBy({column: 'staff.hasStoreKeys', dir: 'DESC'}, 'staff.firstName');

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
