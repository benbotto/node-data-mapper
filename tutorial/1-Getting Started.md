### Getting Started

##### Install node-data-mapper

node-data-mapper is a core project, and database-specific code is implemented in separate modules.  Use the package that supports your RDBMS.

* mysql
```bash
$ npm install node-data-mapper-mysql --save
```

##### Connect

Create a `Driver` instance, and `initialize()` node-data-mapper.  The following example use a `MySQLDriver`; if you're using a different RDBMS, substitute for `MySQL` accordingly.

```js
'use strict';

const MySQLDriver = require('node-data-mapper-mysql').MySQLDriver;
const driver      = new MySQLDriver({
  host:            'localhost',
  user:            'example',
  password:        'secret',
  database:        'bike_shop',
  timezone:        'utc',
  connectionLimit: 10
});

// Initialize the driver, which returns a promise.  node-data-mapper uses
// deferred (https://www.npmjs.com/package/deferred) for a promise library.
driver
  .initialize()
  .then(onInit)
  .catch(console.error)
  .finally(endConnection);

function onInit(dataContext) {
  // dataContext is used to execute queries.  A reference to dataContext is
  // also available on driver (driver.dataContext).
  console.log('Ready to run queries.');
}

function endConnection() {
  // end() is also exposed on dataContext.
  driver.end();
  console.log('Connection closed.');
}
```
