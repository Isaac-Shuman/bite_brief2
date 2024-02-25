//Code ripped from: https://www.linkedin.com/pulse/connecting-reactjs-nodejs-bit-by-bit-guide-ataur-rahman/

//For most of mysql2 stuff: https://sidorares.github.io/node-mysql2/docs/documentation/promise-wrapper

const express = require('express');
const app = express();
const port = 3001; //arbitrary

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());  //necessary for it to process post request which contain data

const mysql = require('mysql2/promise');
meh();
//async keyword lets you use 'await'
async function meh(){ //because await can't be used in top-level, so let's make a function...

  //"wait" for these commands to return instead of executing synchronously
  //wow that was an awfully long time spent debugging and googling
  db = await initialize();
  await readData();
  
  app.get('/api/rankings', async (req, res) => { //I hope that async doesn't break something later...
    rows = await randQuerry('*');
    console.log(JSON.stringify(rows)); //to see rows on console in readable format
    const data = { message: rows };
    res.json(data); //send it off
  });

  app.post('/api/favdishes', async (req, res) => { 
    //send back:
    //[meal, urlToNutritionPage, whether or not the user liked it]
    const meal = req.body.meal;
    //const data = { message: meal.length}
    const data = [
      { name: 'Item 1     ', likes: 69 },
      { name: 'Item 2     ', likes: 420 },
      { name: 'Item 3     ', likes: 1738 },
      { name: 'Item 4     ', likes: 25 },
      { name: 'Item 5     ', likes: 30 }
    ]
    res.json(data);
  });

  app.post('/api/profile', async (req, res) => { 
    //send back:
    //[meal, urlToNutritionPage, whether or not the user liked it]
    const meal = req.body.meal;
    //const data = { message: meal.length}
    const data = [
      { name: 'Item 1     ', likes: 69 },
      { name: 'Item 2     ', likes: 420 },
      { name: 'Item 3     ', likes: 1738 },
      { name: 'Item 4     ', likes: 25 },
      { name: 'Item 5     ', likes: meal.length }
    ]
    res.json(data);
  });

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });

}

//////helper functions:

async function initialize() {
  //change your parameters as needed
  const connection = await mysql.createConnection({
    host     : 'localhost',
    user     : 'isashu',
    password : 'Fizzy19123',
    database : 'a_database', //usr/local/mysql/bin/mysql -u root -e "CREATE DATABASE IF NOT EXISTS default_db" -p
    multipleStatements: true //not protected against sql injections, but meh ¯\_(ツ)_/¯
  });
  console.log('connected as id ' + connection.threadId);

  //create a food table and add some data
  await connection.execute('DROP TABLE IF EXISTS food;'); //delete it if it already exists, for now

  var sql = 'CREATE TABLE food (id BIGINT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(50));';
  try{
    const [rows, fields] = await connection.execute(sql);
  } catch(err){
    console.log(err);
    await connection.end();
  }

  return connection;
}

async function readData(){
  //probably where the web-scraping stuff goes
  //add some dummy data for now
  var sql = "INSERT INTO food (name) VALUES ('pizza'),('cake'), ('salad'), ('ice cream');";
  try{
    const [rows, fields] = await db.execute(sql);
  } catch(err){
    console.log(err);
  }

}

async function randQuerry(col){
  var sql = `SELECT ${col} FROM food;`; //get all columns in food table
		var response = '';
			const [rows, fields] = await db.execute(sql);
			// console.log(rows);
			// console.log(fields);
			response = rows;
		  return response;
}
