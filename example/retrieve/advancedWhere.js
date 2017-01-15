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

/**
 * Get a {@link From} instance which is a combination of staff, staff bonuses,
 * and place of employment.
 */
function retrieveStaffQuery(dataContext) {
  return dataContext
    .from('staff')
    .leftOuterJoin('staff.bonuses')
    .innerJoin('staff.bike_shops');
}

function runQuery(dataContext) {
  // Condition object to find all staff that are either:
  // 1) male and over the age of 25, or
  // 2) female and over the age of 23.
  const cond = {
    $or: [
      {
        // Male and over the age of 25.
        $and: [
          {$eq: {'staff.sex': ':maleSex'}},
          {$gt: {'staff.age': ':maleAge'}}
        ]
      },
      {
        // Female and over the age of 23.
        $and: [
          {$eq: {'staff.sex': ':femaleSex'}},
          {$gt: {'staff.age': ':femaleAge'}}
        ]
      }
    ]
  };

  const params = {
    maleSex:   'male',
    maleAge:   25,
    femaleSex: 'female',
    femaleAge: 23
  };

  const query = retrieveStaffQuery(dataContext)
    .where(cond, params)
    .select()
    .orderBy('staff.sex', 'staff.age');

  console.log('Query:');
  console.log(query.toString(), '\n');

  return query
    .execute();
}

function printResult(result) {
  console.log('Result:');
  console.log(util.inspect(result, {depth: null}));
}

