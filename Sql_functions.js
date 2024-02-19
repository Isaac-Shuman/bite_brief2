/*
var mysql      = require('mysql2');
//change your info as needed
const connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : '12345678',
	database : 'default_db', //usr/local/mysql/bin/mysql -u root -e "CREATE DATABASE IF NOT EXISTS default_db" -p
	multipleStatements: true //not protected against sql injections, but meh ¯\_(ツ)_/¯
});
connection.connect(function(err) {
	if (err) {
		console.error('error connecting: ' + err.stack);
		return;
	}
	console.log('connected as id ' + connection.threadId);
});

module.exports = connection;
*/

const mysql      = require('mysql2/promise');
class Sql_db{
/*
	constructor(){
		//since constructors can't be async...ok
		const connection = mysql.createConnection({
			host     : 'localhost',
			user     : 'root',
			password : '12345678',
			database : 'default_db', //usr/local/mysql/bin/mysql -u root -e "CREATE DATABASE IF NOT EXISTS default_db" -p
			multipleStatements: true //not protected against sql injections, but meh ¯\_(ツ)_/¯
		});
		connection.connect(function(err) {
			if (err) {
				console.error('error connecting: ' + err.stack);
				return;
			}
			console.log('connected as id ' + connection.threadId);
		  });
		  this.db = connection;
		
	}
*/


	constructor(connection){
		this.db = connection;
	}


	 async initialize(){
		try {
			const connection = await mysql.createConnection({
				host     : 'localhost',
				user     : 'root',
				password : '12345678',
				database : 'default_db', //usr/local/mysql/bin/mysql -u root -e "CREATE DATABASE IF NOT EXISTS default_db" -p
				multipleStatements: true //not protected against sql injections, but meh ¯\_(ツ)_/¯
			});

			console.log('connected as id ' + connection.threadId);
			return new Sql_db(connection);
		  } catch (err) {
			console.log(err);
		  }
		  console.log("uhhhh");
		  
	}


	disconnect(){
		this.db.end();
	}
	
	async randQuerry(col){
		//change later
		var sql = `SELECT ${col} FROM scores;`;
		var response = '';
		try {
			const [rows, fields] = await this.db.execute(sql);
			console.log(rows);
			// console.log(fields);
			response = rows;
		  } catch (err) {
			console.log(err);
		  }
		  return response;


		// this.db.execute(
		// 	{
		// 	sql, //since it complains when I pass in the template string directly
		// 	// rowsAsArray: true, //will return as just array of vals, not key-val
		// 	},
		// 	(err, rows, fields) => {
		// 	if (err instanceof Error) {
		// 		console.log(err);
		// 		return;
		// 	}
		// 	response = rows;
		// 	// console.log(JSON.stringify(response));
		// });
		// console.log(JSON.stringify(response));
		// console.log(response[0]['score']);
		// return response;
	}
}

module.exports = new Sql_db().initialize();


///////////////////

/*
const mysql      = require('mysql2'); //?

function connect(){
	const connection = mysql.createConnection({
		host     : 'localhost',
		user     : 'root',
		password : '12345678',
		database : 'default_db', //usr/local/mysql/bin/mysql -u root -e "CREATE DATABASE IF NOT EXISTS default_db" -p
		multipleStatements: true //not protected against sql injections, but meh ¯\_(ツ)_/¯
	});
	connection.connect(function(err) {
		if (err) {
			console.error('error connecting: ' + err.stack);
			// return;
			throw err;
    	}
    	console.log('connected as id ' + connection.threadId);
  	});
  	return connection;
}

function initialize(connection){
	//probably some web-scraping stuff

}

function randQuerry(connection, col){
	//change later
	var sql = `SELECT ${col} FROM scores`;
	var response;
	connection.execute(
	  {
	    sql, //since it complains when I pass in the template string directly
	    rowsAsArray: true,
	  },
	  (err, rows, fields) => {
	  if (err instanceof Error) {
	    console.log(err);
	    return;
	  }
	  console.log(rows);
	  console.log(fields);
	  response = rows;
	});
	return response;
}
const Sql_functions = {connect, initialize, randQuerry};
export default Sql_functions;


*/