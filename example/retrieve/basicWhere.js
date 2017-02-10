'use strict';

const MySQLDriver = require('node-data-mapper-mysql').MySQLDriver;
const driver      = new MySQLDriver(require('../bikeShopConOpts.json'));
const util        = require('util');

driver
  .initialize()
  .then(runQuery)
  .then(printResult)
  .catch(console.error)
  .finally(() => driver.end());

function runQuery(dataContext) {
  // Find all staff under the age of 22.
  const cond = {
    $lt: {
      'staff.age': ':age'
    }
  };

  const params = {
    age: 22
  };

  const query = dataContext
    .from('staff')
    .leftOuterJoin('staff.bonuses')
    .innerJoin('staff.bike_shops')
    .where(cond, params)
    .select()
    .orderBy('staff.age');

  console.log('Query:');
  console.log(query.toString(), '\n');

  return query
    .execute();
}

function printResult(result) {
  console.log('Result:');
  console.log(util.inspect(result, {depth: null}));
}

