var mysql = require('mysql');

exports.connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123',
  database: 'Voip',
  connectionLimit: 0,
  pool: false
});
