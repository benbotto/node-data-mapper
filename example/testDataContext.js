var MySQLDataContext = require(__dirname + '/../datacontext/MySQLDataContext');
var Database         = require(__dirname + '/../database/Database');
var mysql            = require('mysql');
var db               = new Database(require(__dirname + '/testDB.json'));
var pool             = mysql.createPool
({
  host:            'localhost',
  user:            'testUser',
  password:        'secret',
  database:        'test',
  connectionLimit: 10
});

module.exports = new MySQLDataContext(db, pool);

