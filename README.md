# node-data-mapper

An object-relational mapper for node.js using the data-mapper pattern.  node-data-mapper is fast, and it has an intuitive interface that closely resembles SQL.  And because the data-mapper pattern is used instead of active record, data models are plain old JavaScript objects.

[![Build Status](https://travis-ci.org/benbotto/node-data-mapper.svg?branch=master)](https://travis-ci.org/benbotto/node-data-mapper)
[![Coverage Status](https://coveralls.io/repos/benbotto/node-data-mapper/badge.svg?branch=master&service=github)](https://coveralls.io/github/benbotto/node-data-mapper?branch=master)

##### Table of Contents

- [Getting Started](#getting-started)
    - [Select all from a Single Table](#select-all-from-a-single-table)
    - [Install node-data-mapper](#install-node-data-mapper)
    - [Install a Supported Driver](#install-a-supported-driver)
    - [Define a Database](#define-a-database)
    - [Create a DataContext Instance](#create-a-datacontext-instance)
- [Examples](#examples)
  - [Selecting](#selecting)
      - [Limiting Columns](#limiting-columns)
      - [Ad-Hoc Aliasing](#ad-hoc-aliasing)
      - [Ordering](#ordering)
      - [Converters](#converters)
      - [Conditions](#conditions)
      - [Joins](#joins)
      - [Relationships](#relationships)
  - [Inserting](#inserting)
    - [Insert a Single Model](#insert-a-single-model)
    - [Insert Multiple Models](#insert-multiple-models)
    - [Converters](#converters-1)
    - [Sub-Model Relationships](#sub-model-relationships)
  - [Deleting](#deleting)
    - [Delete a Single Model](#delete-a-single-model)
    - [Delete Multiple Models](#delete-multiple-models)
    - [Delete From](#delete-from)
  - [Updating](#updating)
    - [Update a Single Model](#update-a-single-model)
    - [Update Multiple Models](#update-multiple-models)
    - [Update From](#update-from)
- [Extending](#extending)

### Getting Started

##### Install node-data-mapper

```bash
$ npm install node-data-mapper --save
```

##### Install a Supported Driver

The following drivers are supported.

* mysql
```bash
$ npm install mysql --save
```
Support for other database drivers is underway, but at this time only mysql is supported.
Extending node-data-mapper to support a new driver is trivial.  Refer the the [Extending](#extending) section.

##### Define a Database

The easiest way to define a database is using a simple object.  Here's a basic example for a bike shop database.  A database is made up of an array of tables, and each table is made up of an array of columns.  Each table must have a primary key column defined.  Tables and columns can be aliased; an alias defines how a table or column will be serialized.

```js
'use strict';

var ndm = require('node-data-mapper');

var db =
{
  name: 'bike_shop',
  tables:
  [
    {
      // The name of the database table.
      name: 'bike_shops',
      // When a query is mapped to an object or array, by default the object
      // will use the alias.  In this case, selecting from bike_shops will
      // result in an array of bikeShops.
      alias: 'bikeShops',
      columns:
      [
        // Each table must have a primary key.  Support for composite keys is
        // underway.
        {name: 'bikeShopID', isPrimary: true},
        {name: 'name'},
        {name: 'address'}
      ]
    },
    {
      name: 'staff',
      columns:
      [
        {name: 'staffID', isPrimary: true},
        {name: 'firstName'},
        {name: 'lastName'},
        {name: 'age'},
        // Columns can also be aliased.  Here, the column "sex" will be 
        // serialized as "gender."
        {name: 'sex', alias: 'gender'},
        // Converter objects can be added to Column definitions.  A converter
        // has an onRetrieve and an onSave function.  The former takes a value
        // from the database and converts it for serialization.  The latter
        // takes a serialized value and converts it such that it can be saved
        // to the database.  In this case bit values from the database will
        // be turned into booleans.
        {name: 'hasStoreKeys', converter: ndm.bitConverter},
        {name: 'hireDate'},
        {name: 'bikeShopID'}
      ]
    },
    {
      name: 'bonuses',
      columns:
      [
        {name: 'bonusID', isPrimary: true},
        {name: 'reason'},
        {name: 'amount'},
        {name: 'dateGiven'},
        {name: 'staffID'}
      ]
    },
    {
      name: 'bikes',
      columns:
      [
        {name: 'bikeID', isPrimary: true},
        {name: 'brand'},
        {name: 'model'},
        {name: 'msrp'}
      ]
    },
    {
      name: 'bike_shop_bikes',
      alias: 'bikeShopBikes',
      columns:
      [
        {name: 'bikeShopBikeID', isPrimary: true},
        {name: 'bikeShopID'},
        {name: 'bikeID'}
      ]
    }
  ]
};

module.exports = db;
```

##### Create a DataContext Instance

A DataContext instance is the interface through which queries are executed.  The DataContext constructor takes two parameters: a Database instance and a connection pool.  The example DataContext below uses the ```bikeShop.js``` Database definition, which is presented above and contained in the example/bikeShop.js file.

```js
'use strict';

var ndm   = require('node-data-mapper');
var mysql = require('mysql');

// Create a database instance.  The easiest way is to define the database
// in an object, but one can also add tables and columns manually.
var db = new ndm.Database(require('./bikeShop'));

// Create a connection pool.  In this case we're using a MySQL connection
// pool with a 10-connection limit.  (Refer to the mysql documentation.)
var pool = mysql.createPool
({
  host:            'localhost',
  user:            'example',
  password:        'secret',
  database:        db.getName(),
  connectionLimit: 10
});

// Export an instance of a DataContext object.  This is what will be used
// throughout your application for database access.
module.exports = new ndm.MySQLDataContext(db, pool);
```

## Examples

The following examples--all of which are contained in the "examples" directory--use the bike_shop database.  To import this database run the SQL in bike_shop.sql. To do so, log in to your MySQL server, then run:

```
source bike_shop.sql
```

The database contains a series of bike shops.  Each bike shop has staff, and staff can get bonuses.  Each bike shop sells bikes. When you source bike_shop.sql, two queries are run to show what data have been added.  The first shows all the bike shops, the staff for each, and each staff member's bonuses.  (Most staff members have not received any bonuses.)  The second query shows all the bike shops with all the bikes sold by each shop.  Note that some of the bikes are sold by multiple shops.

The bike_shop.sql script creates a user "example" with a password of "secret." If you change the credentials then you will need to update the bikeShopDataContext.js file accordingly.

### Selecting

##### Select all from a Single Table

The simplest query one can perform is selecting all data from a single table.

```js
'use strict';

var bikeShopDC = require('../bikeShopDataContext');

// Select all columns from the bike_shops table.
var query = bikeShopDC.from('bike_shops').select();

// This is the query that will be executed.
console.log('Query:');
console.log(query.toString(), '\n');

// Executing a query returns a promise, as defined by the deferred API.
// https://www.npmjs.com/package/deferred
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
    // Close the connection.
    bikeShopDC.getQueryExecuter().getConnectionPool().end();
  });
```

Running this code (```$ node example/retrieve/allFromSingleTable.js```) yields the following output.

```js
Query:
SELECT  `bikeShops`.`bikeShopID` AS `bikeShops.bikeShopID`, `bikeShops`.`name` AS `bikeShops.name`, `bikeShops`.`address` AS `bikeShops.address`
FROM    `bike_shops` AS `bikeShops` 

Result:
{ bikeShops: 
   [ { bikeShopID: 1,
       name: 'Bob\'s Bikes',
       address: '9107 Sunrise Blvd' },
     { bikeShopID: 2,
       name: 'Zephyr Cove Cruisers',
       address: '18271 Highway 50' },
     { bikeShopID: 3,
       name: 'Cycle Works',
       address: '3100 La Riviera Wy' } ] }
```
Because the table "bike_shops" is aliased (refer to the [Define a Database](#define-a-database) section), the associated property in the serialized object is named "bikeShops."

##### Limiting Columns

The selected columns can be limited by using the ```select``` method.  The ```select``` method is variadic, and in its simplest form it can be passed an array of fully-qualified column names.  A fully-qualified column name takes the form ```<table-alias>.<column-name>```.  For example, the ```bike_shops``` table is aliased ```bikeShops```, so limiting the above query to ```bikeShopID``` and ```name```:

```js
var query = bikeShopDC
  .from('bike_shops')
  .select('bikeShops.bikeShopID', 'bikeShops.name');
```
It's important to point out that if any columns are selected from a table, then the primary key must also be selected.  If the primary key is not selected then an exception will be raised.

##### Ad-Hoc Aliasing

Tables and columns can be aliased in the Database definition, but often it's convenient to alias on the fly.  Both ```from``` and ```select``` can be given objects to describe the serialization.  The ```from``` method takes a meta object with the following properties:

```js
{
  table:  string, // The name of the table to select from.
  as:     string  // An alias for the table.  This is needed if, for example,
                  // the same table is joined in multiple times.
                  // This defaults to the table's alias.
}
```

Likewise, the ```select``` method can be passed multiple column meta objects with the following properties:

```js
{
  column:   string, // The fully-qualified column name in the
                    // form: <table-alias>.<column-name>
  as:       string  // An alias for the column, used for serialization.
                    // If not provided this defaults to the column's alias.
}
```

Building on the previous examples, the table and columns can be aliased as follows:

```js
var query = bikeShopDC
  .from({table: 'bike_shops', as: 'shops'})
  .select({column: 'shops.bikeShopID', as: 'id'}, {column: 'shops.name', as: 'shopName'});
```

Running this example (```example/retrieve/adHocAlias.js```) yields the following output:

```js
Query:
SELECT  `shops`.`bikeShopID` AS `shops.id`, `shops`.`name` AS `shops.shopName`
FROM    `bike_shops` AS `shops` 

Result:
{ shops: 
   [ { id: 1, shopName: 'Bob\'s Bikes' },
     { id: 2, shopName: 'Zephyr Cove Cruisers' },
     { id: 3, shopName: 'Cycle Works' } ] }
```

##### Ordering

The results of a query can be ordered using the ```orderBy``` method.  In its simplest form, the method can be passed multiple strings that corresponds to fully-qualified columns names.  For example, to order the previous query ```by bikeShops.name```:

```js
var query = bikeShopDC
  .from('bike_shops')
  .select('bikeShops.bikeShopID', 'bikeShops.name')
  .orderBy('bikeShops.name');
```

Alternatively multiple objects can be passed to the ```orderBy``` method.  Each object is defined as follows:

```js
{
  column: string, // The fully-qualified column name in the
                  // form: <table-alias>.<column-name>
  dir:    string  // The sort direction: either "ASC" or "DESC."  Defaults to "ASC."
}
```

A more advanced ordering example is presented below:

```js
var query = bikeShopDC
  .from('staff')
  .select('staff.staffID', 'staff.hasStoreKeys', 'staff.firstName')
  .orderBy({column: 'staff.hasStoreKeys', dir: 'DESC'}, 'staff.firstName');
```

Running this example (```$ node example/retrieve/advancedOrder.js```) displays:

```js
Query:
SELECT  `staff`.`staffID` AS `staff.staffID`, `staff`.`hasStoreKeys` AS `staff.hasStoreKeys`, `staff`.`firstName` AS `staff.firstName`
FROM    `staff` AS `staff`
ORDER BY `staff.hasStoreKeys` DESC, `staff.firstName` ASC 

Result:
{ staff: 
   [ { staffID: 4, hasStoreKeys: true, firstName: 'Abe' },
     { staffID: 2, hasStoreKeys: true, firstName: 'John' },
     { staffID: 5, hasStoreKeys: true, firstName: 'Sal' },
     { staffID: 6, hasStoreKeys: true, firstName: 'Valerie' },
     { staffID: 7, hasStoreKeys: false, firstName: 'Kimberly' },
     { staffID: 8, hasStoreKeys: false, firstName: 'Michael' },
     { staffID: 1, hasStoreKeys: false, firstName: 'Randy' },
     { staffID: 3, hasStoreKeys: false, firstName: 'Tina' } ] }
```

##### Converters

In the last example you may have noticed that the ```hasStoreKeys``` property, which is defined as a bit in the database, is serialized as a boolean.  Look at the [Define a Database](#define-a-database) section and you'll see that the ```hasStoreKeys``` ```Column``` definition has a ```converter``` object.  A ```converter``` is an object with two functions: ```onRetrieve``` and ```onSave```.  Each function takes in a value and transforms it.  The former transforms for serialization, and the latter transforms for saving (INSERT or UPDATE).  For example, here is how the bitConverter is defined.

```js
'use strict';

module.exports =
{
  /**
   * Convert the "bit" to a boolean.
   * @param bit Either an instance of a Buffer containing a 1 or a 0, or a number.
   */
  onRetrieve: function(bit)
  {
    if (bit === null || bit === undefined || bit === '')
      return null;

    if (Buffer.isBuffer(bit))
      return bit[0] === 1;

    return bit === '1' || bit === 1;
  },

  /**
   * Convert a boolean to a bit.
   * @param bool A boolean value.
   */
  onSave: function(bool)
  {
    if (bool === null || bool === undefined || bool === '')
      return null;
    return bool ? 1 : 0;
  }
};
```

Converters can also be defined on the fly instead of at the ```Column```-definition level.  (Note that the property name is ```convert``` rather than ```converter``` when using an ad-hoc conversion function.  A ```converter``` object has two methods, but here ```convert``` is synonymous with a ```converter.onRetrieve``` method.)

```js
// Convert a str to upper case.
function ucConverter(str)
{
  return str.toUpperCase();
}

// The firstName property will be converted to upper case.
var query = bikeShopDC
  .from('staff')
  .select('staff.staffID', {column: 'staff.firstName', convert: ucConverter});
```

Running the above example (```$ node example/retrieve/adHocConverter.js```) shows:

```js
Query:
SELECT  `staff`.`staffID` AS `staff.staffID`, `staff`.`firstName` AS `staff.firstName`
FROM    `staff` AS `staff` 

Result:
{ staff: 
   [ { staffID: 1, firstName: 'RANDY' },
     { staffID: 2, firstName: 'JOHN' },
     { staffID: 3, firstName: 'TINA' },
     { staffID: 4, firstName: 'ABE' },
     { staffID: 5, firstName: 'SAL' },
     { staffID: 6, firstName: 'VALERIE' },
     { staffID: 7, firstName: 'KIMBERLY' },
     { staffID: 8, firstName: 'MICHAEL' } ] }
```

As you can see, the ```firstName``` property has been correctly transformed.

##### Conditions

Conditions (WHERE and ON) operate similarly to MongoDB.  The available operators are:

```js
// Comparison operators.
$eq
$neq
$lt
$lte
$gt
$gte
$like
$notLike

// NULL operators.
$is
$isnt

// Boolean operators.
$and
$or
```

Conditions are defined formally as a language, as described by the following grammer (EBNF):

```
<condition>                ::= "{" <comparison> | <null-comparison> | <in-comparison> | <logical-condition> "}"
<comparison>               ::= <comparison-operator> ":" "{" <column> ":" <value> "}"
<null-comparison>          ::= <null-comparison-operator> ":" "{" <column> ":" null "}"
<in-comparison>            ::= <in-comparison-operator> ":" "{" <column> ":" "[" <value> {"," <value>} "]" "}"
<logical-condition>        ::= <boolean-operator> ":" "[" <condition> {"," <condition>} "]"
<comparison-operator>      ::= "$eq" | "$neq" | "$lt" | "$lte" | "$gt" | "$gte" | "$like" | "$notlike"
<in-comparison-operator>   ::= "$in"
<null-comparison-operator> ::= "$is" | "$isnt"
<boolean-operator>         ::= "$and" | "$or"
<value>                    ::= <parameter> | <column> | <number>
<column>                   ::= <string>
<parameter>                ::= :<string>

```

Below is a WHERE condition that is used to find all staff that are older than 21:

```js
var query = bikeShopDC
  .from('staff')
  .where({$gt: {'staff.age':21}})
  .select();
```

Here is an example that uses parameters.  Note that **string values have to be parameterized**, which helps prevent SQL injection.

```js
// Find employees with a firstName of "Valerie."
var query = bikeShopDC
  .from('staff')
  .where({$eq: {'staff.firstName':':firstName'}}, {firstName: 'Valerie'})
  .select();
```

For a more advanced example, let's say that cars can be rented to males 25 and older, or females 23 and over.  To find all staff members that satisfy these criteria:

```js
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
```

Running this example (```$ node example/retrieve/advancedWhere.js```) yields the following output:

```js
SELECT  `staff`.`staffID` AS `staff.staffID`, `staff`.`firstName` AS `staff.firstName`, `staff`.`lastName` AS `staff.lastName`, `staff`.`sex` AS `staff.gender`, `staff`.`age` AS `staff.age`
FROM    `staff` AS `staff`
WHERE   ((`staff`.`sex` = 'male' AND `staff`.`age` >= 25) OR (`staff`.`sex` = 'female' AND `staff`.`age` >= 23)) 

Result:
{ staff: 
   [ { staffID: 2,
       firstName: 'John',
       lastName: 'Stovall',
       gender: 'male',
       age: 54 },
     { staffID: 4,
       firstName: 'Abe',
       lastName: 'Django',
       gender: 'male',
       age: 67 },
     { staffID: 5,
       firstName: 'Sal',
       lastName: 'Green',
       gender: 'male',
       age: 42 },
     { staffID: 6,
       firstName: 'Valerie',
       lastName: 'Stocking',
       gender: 'female',
       age: 29 } ] }
```

Note that AND and OR conditions get parenthesized appropriately.

##### Joins

Joins are completed using the ```innerJoin```, ```leftOuterJoin```, and ```rightOuterJoin``` methods.  Each of these methods takes a meta object that describes the join operation, along with an optional object containing parameter values (in case the join has parameters that need to be replaced).  The meta object has the following format:

```js
{
  table:   string,    // The name of the table to select from.
  as:      string,    // An alias for the table.  This is needed if, for example,
                      // the same table is joined in multiple times.  This is
                      // what the table will be serialized as, and defaults
                      // to the table's alias.
  on:      Condition, // The condition (ON) for the join.
  parent:  string,    // The alias of the parent table, if any.
  relType: string     // The type of relationship between the parent and this
                      // table ("single" or "many").  If set to "single" the
                      // table will be serialized into an object, otherwise
                      // the table will be serialized into an array.  "many"
                      // is the default.
}
```

A basic example of an INNER JOIN follows.  This example finds all staff members that have received bonuses.

```js
var query = bikeShopDC
  .from('staff')
  .innerJoin({table: 'bonuses', parent: 'staff', on: {$eq: {'staff.staffID':'bonuses.staffID'}}})
  .select('staff.staffID', 'staff.firstName', 'staff.lastName', 'bonuses.bonusID', 'bonuses.amount');
```

Running this query (```$ node example/retrieve/basicJoin.js```) shows the following output:

```js
Query:
SELECT  `staff`.`staffID` AS `staff.staffID`, `staff`.`firstName` AS `staff.firstName`, `staff`.`lastName` AS `staff.lastName`, `bonuses`.`bonusID` AS `bonuses.bonusID`, `bonuses`.`amount` AS `bonuses.amount`
FROM    `staff` AS `staff`
INNER JOIN `bonuses` AS `bonuses` ON `staff`.`staffID` = `bonuses`.`staffID` 

Result:
{ staff: 
   [ { staffID: 1,
       firstName: 'Randy',
       lastName: 'Alamedo',
       bonuses: [ { bonusID: 1, amount: 250 } ] },
     { staffID: 6,
       firstName: 'Valerie',
       lastName: 'Stocking',
       bonuses: [ { bonusID: 2, amount: 600 } ] },
     { staffID: 8,
       firstName: 'Michael',
       lastName: 'Xavier',
       bonuses: [ { bonusID: 3, amount: 320 } ] } ] }
```

Relationships between tables are not formally defined in node-data-mapper, so join conditions and relationships are left entirely up to the developer.

Let's consider another example.  To find all employees that have not received bonuses a minus operation (in set terminology) can be employed using a LEFT OUTER JOIN:

```js
var query = bikeShopDC
  .from('staff')
  .leftOuterJoin({table: 'bonuses', on: {$eq: {'staff.staffID':'bonuses.staffID'}}})
  .where({$is: {'bonuses.bonusID': null}})
  .select('staff.staffID', 'staff.firstName', 'staff.lastName');
```

In this query, no columns from the bonuses table are selected because the query is designed to find staff members *without* bonuses.  Hence, the join does not need a parent, and the resulting staff objects do not have "bonuses" properties.  Running this example (```$ node example/retrieve/leftJoin.js```) prints the following:

```js
Query:
SELECT  `staff`.`staffID` AS `staff.staffID`, `staff`.`firstName` AS `staff.firstName`, `staff`.`lastName` AS `staff.lastName`
FROM    `staff` AS `staff`
LEFT OUTER JOIN `bonuses` AS `bonuses` ON `staff`.`staffID` = `bonuses`.`staffID`
WHERE   `bonuses`.`bonusID` IS NULL 

Result:
{ staff: 
   [ { staffID: 2, firstName: 'John', lastName: 'Stovall' },
     { staffID: 3, firstName: 'Tina', lastName: 'Beckenworth' },
     { staffID: 4, firstName: 'Abe', lastName: 'Django' },
     { staffID: 5, firstName: 'Sal', lastName: 'Green' },
     { staffID: 7, firstName: 'Kimberly', lastName: 'Fenters' } ] }
```

##### Relationships

The join examples above all show one-to-many relationships; each staff member has zero or more bonuses.  Let's say we want to find all bonuses with their associated staff member.  In this case each bonus has exactly one related staff member, so the ```relType``` is set to ```single``` in the join meta object.

```js
var query = bikeShopDC
  .from('bonuses')
  .innerJoin({table: 'staff', parent: 'bonuses',
    relType: 'single', on: {$eq: {'bonuses.staffID':'staff.staffID'}}})
  .select('bonuses.bonusID', 'bonuses.amount', 'staff.staffID', 'staff.firstName', 'staff.lastName');
```

This example (```$ node example/retrieve/manyToOneJoin.js```) shows the following output.

```js
Query:
SELECT  `bonuses`.`bonusID` AS `bonuses.bonusID`, `bonuses`.`amount` AS `bonuses.amount`, `staff`.`staffID` AS `staff.staffID`, `staff`.`firstName` AS `staff.firstName`, `staff`.`lastName` AS `staff.lastName`
FROM    `bonuses` AS `bonuses`
INNER JOIN `staff` AS `staff` ON `bonuses`.`staffID` = `staff`.`staffID` 

Result:
{ bonuses: 
   [ { bonusID: 1,
       amount: 250,
       staff: { staffID: 1, firstName: 'Randy', lastName: 'Alamedo' } },
     { bonusID: 2,
       amount: 600,
       staff: { staffID: 6, firstName: 'Valerie', lastName: 'Stocking' } },
     { bonusID: 3,
       amount: 320,
       staff: { staffID: 8, firstName: 'Michael', lastName: 'Xavier' } } ] }
```

As expected, the "staff" property is serialized as an object instead of an array.

Lastly, for many-to-many relationships it's usually desirable to exclude the lookup table from the serialized results.  For example, each bike shop in the bike_shop database sells bikes, and some shops sell the same bikes: Both Bob's Bikes and Cycle Works sell Haro bikes.  Let's say that we want all bike shops, and we want each ```bikeShop``` to have an array of ```bikes``` in the serialized result.  To accomplish this:

1. Set the parent of ```bikes``` to ```bikeShops```.
2. Do not select any columns from the lookup table, which is ```bike_shop_bikes``` in this case.

```js
var query = bikeShopDC
  .from('bike_shops')
  .innerJoin({table: 'bike_shop_bikes', on: {$eq: {'bikeShops.bikeShopID':'bikeShopBikes.bikeShopID'}}})
  .innerJoin({table: 'bikes', parent: 'bikeShops', on: {$eq: {'bikeShopBikes.bikeID':'bikes.bikeID'}}})
  .select('bikeShops.bikeShopID', 'bikeShops.name', 'bikes.bikeID', 'bikes.brand', 'bikes.model');
```

Here is the result (```$ node example/retrieve/manyToManyJoin.js```):

```js
Query:
SELECT  `bikeShops`.`bikeShopID` AS `bikeShops.bikeShopID`, `bikeShops`.`name` AS `bikeShops.name`, `bikes`.`bikeID` AS `bikes.bikeID`, `bikes`.`brand` AS `bikes.brand`, `bikes`.`model` AS `bikes.model`
FROM    `bike_shops` AS `bikeShops`
INNER JOIN `bike_shop_bikes` AS `bikeShopBikes` ON `bikeShops`.`bikeShopID` = `bikeShopBikes`.`bikeShopID`
INNER JOIN `bikes` AS `bikes` ON `bikeShopBikes`.`bikeID` = `bikes`.`bikeID` 

Result:
{ bikeShops: 
   [ { bikeShopID: 1,
       name: 'Bob\'s Bikes',
       bikes: 
        [ { bikeID: 1, brand: 'Felt', model: 'F1' },
          { bikeID: 2, brand: 'Felt', model: 'Z5' },
          { bikeID: 5, brand: 'Stolen', model: 'Sinner Complete' },
          { bikeID: 6, brand: 'Haro', model: 'SDV2' },
          { bikeID: 7, brand: 'Haro', model: 'Leucadia DLX' } ] },
     { bikeShopID: 2,
       name: 'Zephyr Cove Cruisers',
       bikes: 
        [ { bikeID: 3, brand: 'Specialized', model: 'Stump Jumber HT' },
          { bikeID: 4, brand: 'Specialized', model: 'ERA Carbon 29' } ] },
     { bikeShopID: 3,
       name: 'Cycle Works',
       bikes: 
        [ { bikeID: 6, brand: 'Haro', model: 'SDV2' },
          { bikeID: 7, brand: 'Haro', model: 'Leucadia DLX' },
          { bikeID: 8, brand: 'Firmstrong', model: 'Bella Fashionista' },
          { bikeID: 9, brand: 'Firmstrong', model: 'Black Rock' },
          { bikeID: 10, brand: 'Firmstrong', model: 'Bella Classic' } ] } ] }
```

### Inserting

##### Insert a Single Model

In its most basic form, the insert method takes a single object.  If a key matches a table alias in the database, then the associated model(s) are inserted.

```js
'use strict';

var bikeShopDC = require('../bikeShopDataContext');

// Create a new bike shop.
var query = bikeShopDC.insert
({
  // This is the alias of the table, not the table name.
  bikeShops:
  {
    name:    "Phil Billy's Bikes",
    address: '432 Red Rider Rd.'
  }
});

console.log('Query:');
console.log(query.toString(), '\n');

// Just like the selections, insertions return a promise.  The inserted model
// is returned.
query.execute()
  .then(function(result)
  {
    // Notice that the new identifier is populated if the table has an
    // auto-incrementing primary key.
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
```

And here is the output (```$ node example/create/basicInsert.js```):

```js
Query:
INSERT INTO `bike_shops` (`name`, `address`)
VALUES ('Phil Billy\'s Bikes', '432 Red Rider Rd.') 

Result:
{ bikeShops: 
   { name: 'Phil Billy\'s Bikes',
     address: '432 Red Rider Rd.',
     bikeShopID: 4 } }
```

If the table has an auto-increment primary key, then the ID is added to the model.  The primary key column's alias is used when adding the auto-generated ID field.

##### Insert Multiple Models

As described in the previous example, each key in the object passed to the ```insert``` method should match a table alias.  Multiple models can be passed to ```insert``` simultaneously.  Likewise, each key can correspond to a single model, or to an array of models.

```js
// Create two new bike shops and a new bike.
var query = bikeShopDC.insert
({
  bikeShops:
  [
    {   
      name:    'Cycle City',
      address: '82 Bloom St.'
    },  
    {
      name:    'Cadence and Clip',
      address: '7712 Ackworth Barn Dr.'
    }   
  ],  
  bikes:
  {
    brand: 'Gary Fisher',
    model: 'Remedy',
    msrp:  5499.99
  }
});
```

Running this example (```$ node example/create/insertMultiple.js```) shows the following output:

```js
Query:
INSERT INTO `bike_shops` (`name`, `address`)
VALUES ('Cycle City', '82 Bloom St.');

INSERT INTO `bike_shops` (`name`, `address`)
VALUES ('Cadence and Clip', '7712 Ackworth Barn Dr.');

INSERT INTO `bikes` (`brand`, `model`, `msrp`)
VALUES ('Gary Fisher', 'Remedy', 5499.99) 

Result:
{ bikeShops: 
   [ { name: 'Cycle City', address: '82 Bloom St.', bikeShopID: 5 },
     { name: 'Cadence and Clip',
       address: '7712 Ackworth Barn Dr.',
       bikeShopID: 6 } ],
  bikes: 
   { brand: 'Gary Fisher',
     model: 'Remedy',
     msrp: 5499.99,
     bikeID: 11 } }
```
##### Converters

When inserting a model, converters defined on the database schema are respected.  For example, notice that the ```staff``` schema definition has a ```bitConverter``` defined on the ```hasStoreKeys``` column.  Hence, when a ```staff``` model is inserted, the ```hasStoreKeys``` column will be transformed from a boolean to a bit.

```js
var query = bikeShopDC.insert
({
  staff:
  {
    firstName:    'Stan',
    lastName:     'Stark',
    gender:       'male',
    hasStoreKeys: false,
    hireDate:     new Date(2016, 2, 4),
    bikeShopID:   8
  }
});
```

When run, this example prints the following (```$ node example/create/converters.js```):

```js
Query:
INSERT INTO `staff` (`firstName`, `lastName`, `sex`, `hasStoreKeys`, `hireDate`, `bikeShopID`)
VALUES ('Stan', 'Stark', 'male', 0, '2016-03-04 00:00:00.000', 8) 

Result:
{ staff: 
   { firstName: 'Stan',
     lastName: 'Stark',
     gender: 'male',
     hasStoreKeys: false,
     hireDate: Fri Mar 04 2016 00:00:00 GMT-0800 (PST),
     bikeShopID: 8,
     staffID: 9 } }
```

Unlike retrieve, ad-hoc converters are not available on ```Insert``` queries.  ```Database```, ```Table```, and ```Column``` all have ```clone()``` and ```toObject()``` methods, however, so it's trivial to clone a schema and add a converter to the clone.  The ```DataContext.insert(model, db)``` method takes a ```Database``` instance as an optional second paramater.

##### Sub-Model Relationships

When a model is inserted, node-data-mapper will attempt to set the new model's ID on any child models.  This will only work if the child model has a column name that matches the parent model's primary key column name.  For example, the primary key of the ```bike_shops``` table is ```bikeShopID```.  Each ```bike_shop``` has ```staff```, and the staff table has a column named ```bikeShopID```.  Hence, if a new ```bike_shop``` is created:

```js
var query = bikeShopDC.insert
({
  bikeShops:
  {
    name:    'Redwood Bikes',
    address: '2929 Alberton Blvd.',
    staff:
    [
      {
        firstName:    'Stan',
        lastName:     'Stark',
        gender:       'male',
        hasStoreKeys: false,
        hireDate:     new Date(2016, 2, 4)
      }
    ]
  }
});
```

Then the staff member's ```bikeShopID``` will be set (```$ node example/create/subModels.js```):

```js
Query:
INSERT INTO `bike_shops` (`name`, `address`)
VALUES ('Redwood Bikes', '2929 Alberton Blvd.') 

Result:
{ bikeShops: 
   { name: 'Redwood Bikes',
     address: '2929 Alberton Blvd.',
     staff: 
      [ { firstName: 'Stan',
          lastName: 'Stark',
          gender: 'male',
          hasStoreKeys: false,
          hireDate: Fri Mar 04 2016 00:00:00 GMT-0800 (PST),
          bikeShopID: 8 } ],
     bikeShopID: 8 } }
```

This behavior can be disabled on an ```Insert``` query by executing ```query.setUpdateChildKeys(false)```.

Note that child models are are __not__ inserted.  There are, however, some utility functions to help with inserting recursively.  For an example, take a look at ```example/create/recursiveInsert.js```.

### Deleting

##### Delete a Single Model

To delete a single model, simply pass the model to the ```DataContext.delete(model, [database])``` method.  Each key in the object that corresponds to a table alias will be deleted.  The primary key is required to be set on the model, and all other properties are ignored.

```js
'use strict';

var bikeShopDC = require('../bikeShopDataContext');

// Delete a single model by ID.
var query = bikeShopDC.delete
({
  // The key is a table alias, and the value can be
  // an object or an array.
  bonuses:
  {
    // The primary key is required when deleting a model.
    bonusID: 1
  }
});

console.log('Query:');
console.log(query.toString(), '\n');

// A promise is returned, and the result has an 'affectedRows' property.
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
```

Running the above example (```$ node example/delete/deleteSingleModel.js```) displays:

```js
Query:
DELETE  `bonuses`
FROM    `bonuses` AS `bonuses`
WHERE   (`bonuses`.`bonusID` = 1) 

Result:
{ affectedRows: 1 }
```
##### Delete Multiple Models

Like insert, multiple models can be passed to the ```DataContext.delete(model, [database])``` method.  For example, the following code deletes one record from the ```bonuses``` table and two records from the ```staff``` table:

```js
var query = bikeShopDC.delete
({
  bonuses: { bonusID: 3},
  staff:
  [
    {staffID: 1},
    {staffID: 3}
  ]
});
```

This example (```$ node example/delete/deleteMultipleModels.js```) prints:

```js
Query:
DELETE  `bonuses`
FROM    `bonuses` AS `bonuses`
WHERE   (`bonuses`.`bonusID` = 3);

DELETE  `staff`
FROM    `staff` AS `staff`
WHERE   (`staff`.`staffID` = 1);

DELETE  `staff`
FROM    `staff` AS `staff`
WHERE   (`staff`.`staffID` = 3) 

Result:
{ affectedRows: 3 }
```

##### Delete From

While the previous examples of deleting models reflect common cases, often there is a need to perform more complex delete queries.  Deletions can be performed using the ```DataContext.from(meta, [database])``` interface, in the same manner as selections.  For example, to delete all staff members over the age of 50  (refer to the [Selecting->Conditions](#conditions) section for documentation on conditions):

```js
var query = bikeShopDC
  .from('staff')
  .where({$gt: {'staff.age': 50}})
  .delete('staff');
```

Here is the result (```$ node example/delete/deleteFrom.js```):

```js
Query:
DELETE  `staff`
FROM    `staff` AS `staff`
WHERE   `staff`.`age` > 50 

Result:
{ affectedRows: 2 }
```

Here's another example using a join; the example deletes all staff members that have not received a bonus:

```js
var query = bikeShopDC
  .from('staff')
  .leftOuterJoin({table: 'bonuses', on: {$eq: {'staff.staffID':'bonuses.staffID'}}})
  .where({$is: {'bonuses.bonusID': null}})
  .delete('staff');
```

This results in the following SQL (```$ node example/delete/deleteJoin.js```):

```js
Query:
DELETE  `staff`
FROM    `staff` AS `staff`
LEFT OUTER JOIN `bonuses` AS `bonuses` ON `staff`.`staffID` = `bonuses`.`staffID`
WHERE   `bonuses`.`bonusID` IS NULL 

Result:
{ affectedRows: 5 }
```

More thorough examples of using the ```From``` interface are available in the [Selecting](#selecting) section.

### Updating

##### Update a Single Model

To update a single model by ID, simply pass the model to the ```DataContext.update(model, [database])``` method.  The ```model``` parameter is expected to be an object with keys that correspond to table aliases.  The value associated with each key should be an object (or array of objects) containing keys that correspond to column aliases, and the primary key is required.  For example, the following code updates a single ```bonus``` record:

```js
'use strict';

var bikeShopDC = require('../bikeShopDataContext');

// Updatea single model by ID.
var query = bikeShopDC.update
({
  // The key is a table alias, and the value is an object (or array of objects)
  // containing key-value pairs corresponding to column aliases.
  bonuses:
  {
    // The primary key is required when updating a model.
    bonusID: 3,
    amount: 600,
    reason: 'Super outstanding technical skills.'
  }
});

console.log('Query:');
console.log(query.toString(), '\n');

// A promise is returned, and the result has an 'affectedRows' property.
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
```

Running this example (```$ node example/update/updateSingleModel.js```) displays the following output:

```js
Query:
UPDATE  `bonuses` AS `bonuses`
SET
`bonuses`.`reason` = 'Super outstanding technical skills.',
`bonuses`.`amount` = 600
WHERE   (`bonuses`.`bonusID` = 3) 

Result:
{ affectedRows: 1 }
```

##### Update Multiple Models

As mentioned in the previous example, when calling ```DataContext.update(model, [database])``` the ```model``` parameter can be passed as multiple models simultaneously.

```js
var query = bikeShopDC.update
({
  bonuses:
  [
    {
      bonusID: 1,
      amount:  300,
      reason:  'Best salesperson ever.'
    },
    {
      bonusID: 2,
      amount: 400
    }
  ],
  staff:
  {
    staffID:   1,
    firstName: 'Rand'
  },
});
```

The above code snippet updates two ```bonus``` records and one ```staff``` record.  Running the code (```$ node example/update/updateMultipleModels.js```) results in the following output:

```js
Query:
UPDATE  `bonuses` AS `bonuses`
SET
`bonuses`.`reason` = 'Best salesperson ever.',
`bonuses`.`amount` = 300
WHERE   (`bonuses`.`bonusID` = 1);

UPDATE  `bonuses` AS `bonuses`
SET
`bonuses`.`amount` = 400
WHERE   (`bonuses`.`bonusID` = 2);

UPDATE  `staff` AS `staff`
SET
`staff`.`firstName` = 'Rand'
WHERE   (`staff`.`staffID` = 1) 

Result:
{ affectedRows: 3 }
```

Note that the ```affectedRows``` is the total number of rows affected by the batch of updates (in this case, 3 records were updated).

##### Update From

The last two examples are trivial cases where one or more models are updated by ID.  More complex updates can be done using the ```DataContext.from(meta, [database])``` interface, which allows for complex conditions and joins.  The following code snippet gives store keys to all exmployees over the age of 21.

```js
var query = bikeShopDC
  .from('staff')
  .where({$gt: {'staff.age':21}})
  .update({staff: {hasStoreKeys: true}});
```

And here is the resulting output (```$ node example/update/updateFrom.js```):

```js
Query:
UPDATE  `staff` AS `staff`
SET
`staff`.`hasStoreKeys` = 1
WHERE   `staff`.`age` > 21 

Result:
{ affectedRows: 5 }
```

Extending this example, the proceeding example gives store keys to all employees over the age of 21 who have received a bonus.

```js
var query = bikeShopDC
  .from('staff')
  .innerJoin({table: 'bonuses', on: {$eq: {'staff.staffID':'bonuses.staffID'}}})
  .where({$gt: {'staff.age':21}})
  .update({staff: {hasStoreKeys: true}});
```

Here is the output (```$ node example/update/updateJoin.js```):

```js
Query:
UPDATE  `staff` AS `staff`
INNER JOIN `bonuses` AS `bonuses` ON `staff`.`staffID` = `bonuses`.`staffID`
SET
`staff`.`hasStoreKeys` = 1
WHERE   `staff`.`age` > 21 

Result:
{ affectedRows: 2 }
```

Conditions, joins, and other examples of using the ```from``` interface are available in the [Selecting](#selecting) section.
## Extending

The node-data-mapper module is designed to be extendable.  Adding support for a new database dialect is simple, and involves extending and specializing the DataContext class.  The DataContext defines a standard interface for escaping and executing queries.  Refer to the MySQLDataContext implementation for an example.
