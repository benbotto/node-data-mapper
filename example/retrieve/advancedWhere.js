'use strict';

var bikeShopDC = require('../bikeShopDataContext');

// Find all employees that can rent cars.
var query = bikeShopDC
  .from('staff')
  .where
  ({
    $or:
    [
      {$and: [{$eq: {'staff.sex':':male'}},   {$gte: {'staff.age':25}}]},
      {$and: [{$eq: {'staff.sex':':female'}}, {$gte: {'staff.age':23}}]}
    ]
  },
  {male: 'male', female: 'female'})
  .select('staff.staffID', 'staff.firstName', 'staff.lastName', 'staff.sex', 'staff.age');

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
