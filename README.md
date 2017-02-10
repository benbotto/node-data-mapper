[![Build Status](https://travis-ci.org/benbotto/node-data-mapper.svg?branch=1.1.x)](https://travis-ci.org/benbotto/node-data-mapper)
[![Coverage Status](https://coveralls.io/repos/benbotto/node-data-mapper/badge.svg?branch=1.1.x&service=github)](https://coveralls.io/github/benbotto/node-data-mapper?branch=1.1.x)

# node-data-mapper

node-data-mapper in object-relational mapper for Node.js.  It uses the data-mapper pattern.

##### What does it do?

It takes queries that look like this:

```sql
SELECT  bs.bikeShopID, bs.name, bs.address,
        s.staffID, s.firstName, s.lastName
FROM    bike_shops bs
INNER JOIN staff s ON bs.bikeShopID = s.bikeShopID
ORDER BY bs.name, s.firstName
```
and makes them look like this:

```js
dataContext
  .from('bike_shops bs')
  .innerJoin('bs.staff s')
  .select(
    'bs.bikeShopID', 'bs.name', 'bs.address',
    's.staffID', 's.firstName', 's.lastName')
  .orderBy('bs.name', 's.firstName')
```

It maps relational, tabular data that look like this:

bikeShopID|name|address|staffID|firstName|lastName
---|---|---|---|---|---
1|Bob's Bikes|9107 Sunrise Blvd|2|John|Stovall
1|Bob's Bikes|9107 Sunrise Blvd|1|Randy|Alamedo
1|Bob's Bikes|9107 Sunrise Blvd|3|Tina|Beckenworth
3|Cycle Works|3100 La Riviera Wy|7|Kimberly|Fenters
3|Cycle Works|3100 La Riviera Wy|8|Michael|Xavier
3|Cycle Works|3100 La Riviera Wy|5|Sal|Green
3|Cycle Works|3100 La Riviera Wy|6|Valerie|Stocking
2|Zephyr Cove Cruisers|18271 Highway 50|4|Abe|Django

to a normalized document like this:

```js
[ { bikeShopID: 1,
    name: 'Bob\'s Bikes',
    address: '9107 Sunrise Blvd',
    staff: 
     [ { staffID: 2, firstName: 'John', lastName: 'Stovall' },
       { staffID: 1, firstName: 'Randy', lastName: 'Alamedo' },
       { staffID: 3, firstName: 'Tina', lastName: 'Beckenworth' } ] },
  { bikeShopID: 3,
    name: 'Cycle Works',
    address: '3100 La Riviera Wy',
    staff: 
     [ { staffID: 7, firstName: 'Kimberly', lastName: 'Fenters' },
       { staffID: 8, firstName: 'Michael', lastName: 'Xavier' },
       { staffID: 5, firstName: 'Sal', lastName: 'Green' },
       { staffID: 6, firstName: 'Valerie', lastName: 'Stocking' } ] },
  { bikeShopID: 2,
    name: 'Zephyr Cove Cruisers',
    address: '18271 Highway 50',
    staff: [ { staffID: 4, firstName: 'Abe', lastName: 'Django' } ] } ]
```

##### Why should you use it?

* It's fast.
* The code is well documented and thoroughly tested.
* Tutorials and documentation help you to get started quickly.
* It works well with existing projects and databases.
* The query interface is intuitive and closely resembles SQL.
* Unlike other ORMs, there's no need to define models.
* Queries use plain ol' JavaScript objects and arrays.
* Security concerns like SQL injection are covered.
* CRUD operations can be reused.  Create a select query, and use the same query for updates and deletes.
* It lets you easily create queries that can be filtered and ordered dynamically.
* There are hooks for global conversions and transformations, like normalizing dates and formatting phone numbers.
* Database modifications show up immediately.  If you add a column to the database, you don't have to change any code.
* It eliminates incosistent property names, which is a common problem in APIs.

##### How do I get started?

[Go check out the tutorials!](https://benbotto.github.io/doc/node-data-mapper/1.1.x/tutorial-000%20-%20Example%20Database%20Setup.html)

##### Table of Contents

- Getting Started
  - [Example Database Setup](https://benbotto.github.io/doc/node-data-mapper/1.1.x/tutorial-000 - Example Database Setup.html)
  - [Installing and Connecting](https://benbotto.github.io/doc/node-data-mapper/1.1.x/tutorial-001 - Installing and Connecting.html)
- Selecting
  - [Select all from a Single Table](https://benbotto.github.io/doc/node-data-mapper/1.1.x/tutorial-002 - Select - Select all from a Single Table.html)
  - [Limiting Columns](https://benbotto.github.io/doc/node-data-mapper/1.1.x/tutorial-003 - Select - Limiting Columns.html)
  - [Ad-Hoc Mapping](https://benbotto.github.io/doc/node-data-mapper/1.1.x/tutorial-004 - Select - Ad-Hoc Mapping.html)
  - [Ordering](https://benbotto.github.io/doc/node-data-mapper/1.1.x/tutorial-005 - Select - Ordering.html)
  - [Ad-Hoc Converters](https://benbotto.github.io/doc/node-data-mapper/1.1.x/tutorial-006 - Select - Ad-Hoc Converters.html)
  - [Conditions I](https://benbotto.github.io/doc/node-data-mapper/1.1.x/tutorial-007 - Select - Conditions.html)
  - [Conditions II](https://benbotto.github.io/doc/node-data-mapper/1.1.x/tutorial-008 - Select - Conditions.html)
  - [Joins](https://benbotto.github.io/doc/node-data-mapper/1.1.x/tutorial-009 - Select - Joins.html)
- Inserting
  - [Create a Single Model](https://benbotto.github.io/doc/node-data-mapper/1.1.x/tutorial-010 - Insert - Create a Single Model.html)
  - [Create Multiple Models](https://benbotto.github.io/doc/node-data-mapper/1.1.x/tutorial-011 - Insert - Create Multiple Models.html)
- Deleting
  - [Delete a Single Model](https://benbotto.github.io/doc/node-data-mapper/1.1.x/tutorial-012 - Delete - Delete a Single Model.html)
  - [Delete Multiple Models](https://benbotto.github.io/doc/node-data-mapper/1.1.x/tutorial-013 - Delete - Delete Multiple Models.html)
  - [Delete Using a From Instance](https://benbotto.github.io/doc/node-data-mapper/1.1.x/tutorial-014 - Delete - Delete Using a From Instance.html)
- Updating
  - [Update a Single Model](https://benbotto.github.io/doc/node-data-mapper/1.1.x/tutorial-015 - Update - Update a Single Model.html)
  - [Update Multiple Models](https://benbotto.github.io/doc/node-data-mapper/1.1.x/tutorial-016 - Update - Update Multiple Models.html)
  - [Updating Using a From Instance](https://benbotto.github.io/doc/node-data-mapper/1.1.x/tutorial-017 - Update - Updating Using a From Instance.html)
- Schema Objects (Global Property Names and Conversions)
  - [Schema Generation Overview](https://benbotto.github.io/doc/node-data-mapper/1.1.x/tutorial-018 - Schema - Schema Generation Overview.html)
  - [Customizing Names (Mapping)](https://benbotto.github.io/doc/node-data-mapper/1.1.x/tutorial-019 - Schema - Customizing Names (Mapping).html)
  - [Converters](https://benbotto.github.io/doc/node-data-mapper/1.1.x/tutorial-020 - Schema - Converters.html)
