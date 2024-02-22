//Code ripped from: https://www.linkedin.com/pulse/connecting-reactjs-nodejs-bit-by-bit-guide-ataur-rahman/

//For most of mysql2 stuff: https://sidorares.github.io/node-mysql2/docs/documentation/promise-wrapper

const express = require('express');
const app = express();
const port = 3001; //arbitrary

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());  //necessary for it to process post request which contain data

const mysql = require('mysql2/promise');
console.log("calling meh");
meh();
//async keyword lets you use 'await'
async function meh(){ //because await can't be used in top-level, so let's make a function...
  console.log("went into meh");
  //"wait" for these commands to return instead of executing synchronously
  //wow that was an awfully long time spent debugging and googling
  console.log ("calling initialize");
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
    const data = { message: meal.length}
    res.json(data);
  });


  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });

}

//////helper functions:

async function initialize() {
  //change your parameters as needed
  console.error("Went into initialize");
  const connection = await mysql.createConnection({
    host     : 'localhost',
    user     : 'Mashamellow',
    password : 'mY7733203***',
    database : 'bitebrief', //usr/local/mysql/bin/mysql -u root -e "CREATE DATABASE IF NOT EXISTS default_db" -p
    multipleStatements: false //not protected against sql injections, but meh ¯\_(ツ)_/¯  Masha: I think if we run the creation of each table separately then we can set it to false and it won't be a risk anymore
  });
  console.log('connected as id ' + connection.threadId);

  //create a food table and add some data
  await connection.execute('DROP TABLE IF EXISTS Foods;'); //delete it if it already exists, for now
  await connection.execute('DROP TABLE IF EXISTS Users;');
  await connection.execute('DROP TABLE IF EXISTS Allegies;');
  await connection.execute('DROP TABLE IF EXISTS Diets;');
  var createFoodsTable = `
  CREATE TABLE Foods (
    id BIGINT PRIMARY KEY AUTO_INCREMENT, 
    name VARCHAR(50) NOT NULL UNIQUE
    );`; //creating Foods table
  
  var createUsersTable = `
  CREATE TABLE IF NOT EXISTS Users ( 
   id BIGINT AUTO_INCREMENT PRIMARY KEY,
   username VARCHAR(255) NOT NULL UNIQUE,
   password VARCHAR(255) NOT NULL,
   email VARCHAR(255) NOT NULL UNIQUE,
   bio TEXT
  );`; //creating a Users table

  var createAllergiesTable = `
  CREATE TABLE IF NOT EXISTS Allergies ( 
   id BIGINT AUTO_INCREMENT PRIMARY KEY,
   name VARCHAR(255) NOT NULL UNIQUE,
   status VARCHAR(255) NOT NULL UNIQUE
  );`; //creating an Allergies table (btw status I think was a good idea to add but wer can delete it. o it basically just indicates how dangerous the allergy is. We can probably make it so that the user inputs how dangerous it is for them)

  var createDietsTable = `
  CREATE TABLE IF NOT EXISTS Diets ( 
   id BIGINT AUTO_INCREMENT PRIMARY KEY,
   name VARCHAR(255) NOT NULL UNIQUE,
   description TEXT
  );`; //creating a Diets table
    
  try{
    const [rFoods, fFoods] = await connection.execute(createFoodsTable);
    const [rUsers, fUsers] = await connection.execute(createUsersTable);
    const [rAllergies, fAllergies] = await connection.execute(createAllergiesTable);
    const [rDiets, fDiets] = await connection.execute(createDietsTable);
    console.log("Tables created successfully");
  } catch(err){
    console.error("Error creating tables:", err);
    await connection.end();
  }
  return connection;
}

async function readData(){
  //probably where the web-scraping stuff goes
  //add some dummy data for now
  var sql = "INSERT INTO Foods (name) VALUES ('pizza'),('cake'), ('salad'), ('ice cream');";
  try{
    const [rFoods, fFoods] = await db.execute(sql);
  } catch(err){
    console.log(err);
  }

}

async function randQuerry(col){
  var sql = `SELECT ${col} FROM Foods;`; //get all columns in food table
		var response = '';
			const [rFoods, fFoods] = await db.execute(sql);
			// console.log(rows);
			// console.log(fields);
			response = rows;
		  return response;
}
