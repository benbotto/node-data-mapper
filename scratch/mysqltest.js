'use strict';

var mysql = require('mysql');

var connection = mysql.createConnection
({
  host     : 'localhost',
  user     : 'testUser',
  password : '4me2n0',
  database : 'test'
});

connection.connect();

connection.query('SELECT * FROM people p LEFT OUTER JOIN phoneNumbers pn ON p.personID = pn.personID', function(err)
{
  if (err) throw err;
  console.dir(arguments);
});

connection.end();
