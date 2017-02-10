'use strict';

const MySQLDriver = require('node-data-mapper-mysql').MySQLDriver;
const driver      = new MySQLDriver(require('../bikeShopConOpts.json'));

// Listen for ADD_TABLE events during initialization, and customize table
// mappings.
driver.generator.on('ADD_TABLE', onAddTable);

driver
  .initialize()
  .then(runQuery)
  .then(printResult)
  .catch(console.error)
  .finally(() => driver.end());

function runQuery(dataContext) {
  // Retrieve the bike shop with ID 1, along with all the bikes sold
  // at the shop.
  return dataContext
    .from('bike_shops bs')
    .innerJoin('bs.bike_shop_bikes bsb')
    .innerJoin('bsb.bikes b')
    .where({$eq: {'bs.bikeShopID': ':id'}}, {id: 1})
    .select(
      'bs.bikeShopID', 'bs.name',
      'bsb.bikeShopBikeID',
      'b.bikeID', 'b.model')
    .execute();
}

function printResult(result) {
  // Note that the tables that were originally snake case (bike_shops and
  // bike_shop_bikes) are now camel case.
  console.log(JSON.stringify(result, null, 2));
}

/**
 * The table mapping (mapTo) removes any underscores and uppercases the
 * proceeding character.  Ex: bike_shop_bikes => bikeShopBikes
 * @param {Table} table - An ndm.Table instance with a name property.
 * @return {void}
 */
function onAddTable(table) {
  table.mapTo = table.name.replace(/_[a-z]/g, c => c.substr(1).toUpperCase());
}

