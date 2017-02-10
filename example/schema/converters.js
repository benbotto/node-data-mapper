'use strict';

const MySQLDriver      = require('node-data-mapper-mysql').MySQLDriver;
const driver           = new MySQLDriver(require('../bikeShopConOpts.json'));
const util             = require('util');
// This converter converts from database bits to JavaScript booleans.
const booleanConverter = require('node-data-mapper').booleanConverter;

// Listen for ADD_COLUMN events and add converters as needed.
driver.generator.on('ADD_COLUMN', onAddColumn);

driver
  .initialize()
  .then(runQuery)
  .then(printResult)
  .catch(console.error)
  .finally(() => driver.end());

function runQuery(dataContext) {
  // Pull all staff members.
  return dataContext
    .from('staff s')
    .select('s.staffID', 's.firstName', 's.hasStoreKeys')
    .execute();
}

function printResult(result) {
  // Note that hasStoreKeys is converted from a Buffer to a boolean.
  console.log(util.inspect(result, {depth: null}));
}

/**
 * Add a converter to BIT columns that converts to boolean.
 */
function onAddColumn(col, table) {
  if (col.dataType === 'bit') {
    col.converter = booleanConverter;
  }
}

