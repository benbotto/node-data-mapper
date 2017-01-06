'use strict';

const MySQLDriver = require('node-data-mapper-mysql').MySQLDriver;
const driver      = new MySQLDriver(require('../bikeShopConOpts.json'));

driver
  .initialize()
  .then(runQuery)
  .then(printResult)
  .catch(console.error)
  .finally(() => driver.end());

function runQuery(dataContext) {
  // Find all employees that have received bonuses.
  const query = dataContext
    .from('staff s')

    // Join in bonuses as a child of staff.  Implicit join predicates are
    // possible when there is a exactly one relationship between two tables.
    // In this case bonuses has a staffID column that is a foreign key pointing
    // at staff.staffID.
    .innerJoin('s.bonuses b')

    // Limit the selection to these columns.
    .select('s.staffID', 's.firstName', 's.lastName', 'b.bonusID', 'b.amount');

  console.log('Query:');
  console.log(query.toString(), '\n');

  return query
    .execute();
}

function printResult(result) {
  const util = require('util');

  console.log('Result:');
  console.log(util.inspect(result, {depth: null}));
}

