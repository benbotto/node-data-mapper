'use strict';

var ndm   = require('node-data-mapper');
var mysql = require('mysql');

// Create a database instance.  The easiest way is to define the database
// in an object, but one can also add tables and columns manually.
var db = new ndm.Database(require('./bikeShop'));

// Create a connection pool.  In this case we're using a MySQL connection
// pool with a 10 connection limit.  (Refer to the mysql documentation.)
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

