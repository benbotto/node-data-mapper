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
  // Update a single model by ID.
  const query = dataContext
    .update({
      bonuses: {
        // The primary key is required when updating a model.
        bonusID: 3,
        amount:  600,
        reason:  'Super outstanding technical skills.'
      }
    });

  console.log('Query:');
  console.log(query.toString(), '\n');

  return query
    .execute();
}

function printResult(result) {
  // The result object will contain an affectedRows property, which is an
  // integer that that reflects the number of updated records.
  console.log('Result:');
  console.log(result);
}

