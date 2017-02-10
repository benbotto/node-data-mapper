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
  // Get all the bonuses in the system, with the single staff member for each
  // bonus, but only for staff members over the age of 21.
  const query = dataContext
    .from('bonuses b')
    .innerJoin(
      {
        parent:  'b',
        table:   'staff',
        as:      's',
        relType: 'single',
        on: {
          $and: [
            {$eq:  {'s.staffID': 'b.staffID'}},
            {$gte: {'s.age': ':minAge'}}
          ]
        }
      },
      {minAge: 22}
    )
    .select(
      's.staffID', 's.lastName', 's.age',
      'b.bonusID', 'b.amount'
    );

  console.log('Query:');
  console.log(query.toString(), '\n');

  return query
    .execute();
}

function printResult(result) {
  console.log('Result:');
  console.log(util.inspect(result, {depth: null}));
}

