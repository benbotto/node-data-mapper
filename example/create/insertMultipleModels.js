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
  // Insert two bike_shops records and a single bikes record in a batch.
  const query = dataContext
    .insert({
      bike_shops: [
        {
          name:    'Cycle City',
          address: '82 Bloom St.'
        },
        {
          name:    'Cadence and Clip',
          address: '7712 Ackworth Barn Dr.'
        }
      ],
      bikes: {
        brand: 'Gary Fisher',
        model: 'Remedy',
        msrp:  5499.99
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

