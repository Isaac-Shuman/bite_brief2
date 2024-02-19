// import mysql from "mysql2";
//https://sidorares.github.io/node-mysql2/docs/documentation


var mysql      = require('mysql2');
//change your info as needed
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '12345678',
  database : 'default_db' //usr/local/mysql/bin/mysql -u root -e "CREATE DATABASE IF NOT EXISTS default_db" -p
});

connection.connect(function(err) {
    if (err) {
      console.error('error connecting: ' + err.stack);
      return;
    }
  
    console.log('connected as id ' + connection.threadId);
  });

  module.exports = connection;
