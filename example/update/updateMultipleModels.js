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
  // Update two bonuses records and one staff record by ID.
  const query = dataContext
    .update({
      bonuses: [
        {
          bonusID: 1,
          amount:  300,
          reason:  'Best salesperson ever.'
        },
        {
          bonusID: 2,
          amount:  400
        }
      ],
      staff: {
        staffID:   1,
        firstName: 'Rand'
      }
    });

  console.log('Query:');
  console.log(query.toString(), '\n');

  return query
    .execute();
}

function printResult(result) {
  console.log('Result:');
  console.log(result);
}

