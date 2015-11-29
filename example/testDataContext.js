var DataContext        = require(__dirname + '/../datacontext/DataContext');
var Database           = require(__dirname + '/../database/Database');
var MySQLEscaper       = require(__dirname + '/../query/MySQLEscaper');
var MySQLQueryExecuter = require(__dirname + '/../query/MySQLQueryExecuter');
var mysql              = require('mysql');

var escaper = new MySQLEscaper();
var db      = new Database(require(__dirname + '/testDB.json'));
var pool    = mysql.createPool
({
  host:            'localhost',
  user:            'testUser',
  password:        'secret',
  database:        'test',
  connectionLimit: 10
});
var queryExec = new MySQLQueryExecuter(pool);
var testDC    = new DataContext(db, escaper, queryExec);

module.exports = testDC;

