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
  

  app.get('/api/data', async (req, res) => { //I hope that async doesn't break something later...
    rows = await randQuerry('e');
    console.log(JSON.stringify(rows)); //to see rows on console in readable format
    const data = { message: rows };
    res.json(data); //send it off
  });

  app.post('/api/favdishes', async (req, res) => { 
    //send back:
    //[meal, urlToNutritionPage, whether or not the user liked it]
    // const meal = req.body.meal;
    // //const data = { message: meal.length}
    // const data = [
    //   { name: 'Item 1     ', likes: 69 },
    //   { name: 'Item 2     ', likes: 420 },
    //   { name: 'Item 3     ', likes: 1738 },
    //   { name: 'Item 4     ', likes: 25 },
    //   { name: 'Item 5     ', likes: 30 }
    // ]
    // res.json(data);
    console.log("refreshing trending list");

    var sql = `SELECT name, likes
    FROM Foods
    ORDER BY likes DESC;`
  
		var response = '';
    try{
			const [rFoods, fFoods] = await db.execute(sql);
			response = rFoods;
    } catch(err){
      // console.error(err);
      res.json(err.code); //for example, ER_DUP_ENTRY
    }
      console.log(JSON.stringify(response));
		  res.json(response);
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

  app.post('/api/myFavDishes', async (req, res) => { 
    const userID = req.body.id;
    var sql = `SELECT Foods.name, Users.username, Foods.id
  FROM Foods
  JOIN Foods_Users ON Foods_Users.food_id = Foods.id
  JOIN Users ON Foods_Users.user_id = Users.id
  WHERE Users.id = ${userID};` 
  
  console.log(userID);
  
		var response = '';
    try{
			const [rFoods, fFoods] = await db.execute(sql);
			response = rFoods;
    } catch(err){
      // console.error(err);
      res.json(err.code); //for example, ER_DUP_ENTRY
    }
		  res.json(response);
  });

  app.delete('/api/myFavDishes', async (req, res) => { 
    const foodID = req.body.Fid;
    const userID = req.body.Uid;
    var sql1 = `DELETE FROM Foods_Users
    WHERE user_id = ${userID} AND food_id = ${foodID};`
    var sql2= `UPDATE Foods SET likes = likes - 1
    WHERE id = ${foodID};` //also update like count

    console.log(sql1);
		var response = '';
    try{
			await db.execute(sql1);
      await db.execute(sql2);
    } catch(err){
      // console.error(err);
      res.json(err.code); //for example, ER_DUP_ENTRY
      return;
    }
      return;
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
    user     : 'root',
    password : '12345678',
    database : 'default_db', //usr/local/mysql/bin/mysql -u root -e "CREATE DATABASE IF NOT EXISTS default_db" -p
    multipleStatements: false //not protected against sql injections, but meh ¯\_(ツ)_/¯
  });
  console.log('connected as id ' + connection.threadId);

  //I labeled the helper tables in alphabetical order, btw
  await connection.execute('DROP TABLE IF EXISTS Foods_Users;');
  await connection.execute('DROP TABLE IF EXISTS Allergies_Users;');
  await connection.execute('DROP TABLE IF EXISTS Diets_Users;');
  await connection.execute('DROP TABLE IF EXISTS Allergies_Foods;');
  await connection.execute('DROP TABLE IF EXISTS Diets_Foods;');


  await connection.execute('DROP TABLE IF EXISTS Foods;'); //delete it if it already exists, for now
  await connection.execute('DROP TABLE IF EXISTS Users;');
  await connection.execute('DROP TABLE IF EXISTS Allergies;');
  await connection.execute('DROP TABLE IF EXISTS Diets;');

  var createFoodsTable = `
  CREATE TABLE Foods (
    id BIGINT PRIMARY KEY AUTO_INCREMENT, 
    name VARCHAR(50) NOT NULL UNIQUE,
    available BOOL DEFAULT 1,
    likes BIGINT DEFAULT 0
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
   name VARCHAR(255) NOT NULL UNIQUE
  );`; //creating an Allergies table (btw status I think was a good idea to add but wer can delete it. o it basically just indicates how dangerous the allergy is. We can probably make it so that the user inputs how dangerous it is for them)

  var createDietsTable = `
  CREATE TABLE IF NOT EXISTS Diets ( 
   id BIGINT AUTO_INCREMENT PRIMARY KEY,
   name VARCHAR(255) NOT NULL UNIQUE,
   description TEXT
  );`; //creating a Diets table

///////Helper tables
  var createFoodsUsersTable = `
  CREATE TABLE IF NOT EXISTS Foods_Users (
     food_id BIGINT,
     user_id BIGINT,
     FOREIGN KEY (food_id) REFERENCES Foods(id),
     FOREIGN KEY (user_id) REFERENCES Users(id),
     UNIQUE(food_id, user_id)
  );`; //helper table

  var createAllergiesUsersTable = `
  CREATE TABLE IF NOT EXISTS Allergies_Users (
     allergy_id BIGINT,
     user_id BIGINT,
     status VARCHAR(255) NOT NULL UNIQUE,
     FOREIGN KEY (allergy_id) REFERENCES Allergies(id),
     FOREIGN KEY (user_id) REFERENCES Users(id),
     UNIQUE(allergy_id, user_id)
  );`; //helper table

  var createDietsUsersTable = `
  CREATE TABLE IF NOT EXISTS Diets_Users (
    diet_id BIGINT,
    user_id BIGINT,
    FOREIGN KEY (diet_id) REFERENCES Diets(id),
    FOREIGN KEY (user_id) REFERENCES Users(id),
    UNIQUE(diet_id, user_id)
 );`; //helper table

 var createAllergiesFoodsTable = `
 CREATE TABLE IF NOT EXISTS Allergies_Foods (
   allergy_id BIGINT,
   food_id BIGINT,
   FOREIGN KEY (food_id) REFERENCES Foods(id),
   FOREIGN KEY (allergy_id) REFERENCES Allergies(id),
   UNIQUE(allergy_id, food_id)
);`; //helper table

var createDietsFoodsTable = `
CREATE TABLE IF NOT EXISTS Diets_Foods (
  diet_id BIGINT,
  food_id BIGINT,
  FOREIGN KEY (diet_id) REFERENCES Diets(id),
  FOREIGN KEY (food_id) REFERENCES Foods(id),
  UNIQUE(diet_id, food_id)
);`; //helper table

try{
    const [rFoods, fFoods] = await connection.execute(createFoodsTable);
    const [rUsers, fUsers] = await connection.execute(createUsersTable);
    const [rAllergies, fAllergies] = await connection.execute(createAllergiesTable);
    const [rDiets, fDiets] = await connection.execute(createDietsTable);
    await connection.execute(createFoodsUsersTable);
    await connection.execute(createAllergiesUsersTable);
    await connection.execute(createDietsUsersTable);
    await connection.execute(createAllergiesFoodsTable);
    await connection.execute(createDietsFoodsTable);

    console.log("Tables created successfully");
  } catch(err){
    console.log(err);
    console.error("Error creating tables:", err);
    await connection.end();
  }

  return connection;
}

async function readData(){
  //probably where the web-scraping stuff goes
  //add some dummy data for now
  var foodIn = "INSERT INTO Foods (name) VALUES ('pizza'), ('cake'), ('salad'), ('ice cream'), ('water');";
  var allergyIn = "INSERT INTO Allergies (name) VALUES ('dairy'), ('gluten'), ('eggs');";
  var dietIn = `INSERT INTO Diets (name, description) VALUES 
    ('healthy', 'what''s good for you'), 
    ('processed', 'what''s probably not good for you'), 
    ('vegan', 'no animal products')
  ;`;

  var usersIn = `INSERT INTO Users (username, password, email, bio) VALUES 
    ('blen', '12345678', 'blen@gmail.com', 'database nerd who has a bad gluten allergy'), 
    ('Mashamellow', 'abcdefg', 'mellow@gmail.com', 'database nerd2 who likes ice cream'), 
    ('Koopa', 'password', 'isaacishuman@yahoo.com', 'emacs lover that eats healthy'), 
    ('zeeehan', 'idk', 'zen@gmail.com', 'frontend nerd1 who''s vegan and lactose intolerant'), 
    ('0xyw', 'secret', 'erin@gmail.com', 'frontend nerd2 who likes ice cream but is lactose intolerant'),
    ('Kyuki', '??????', 'kelvin@gmail.com', 'security nerd who likes everything')
  ;`;

  var foodsUsersIn = `INSERT INTO Foods_Users (food_id, user_id) VALUES 
    (1, 6),
    (2, 6),
    (3, 1), (3, 6),
    (4, 2), (4, 5), (4, 6),
    (5,1), (5,2), (5,3), (5,4), (5,5), (5,6)
  ;`;
  var allergiesUsersIn = `INSERT INTO Allergies_Users (allergy_id, user_id, status) VALUES 
    (1, 4, 'not too bad'), (1, 5, 'very serious'), (2, 1, 'life-threatening')
  ;`;
  var dietsUsersIn = `INSERT INTO Diets_Users (diet_id, user_id) VALUES 
  (3, 4), (1, 3)
;`;
  var allergiesFoodsIn = `INSERT INTO Allergies_Foods (allergy_id, food_id) VALUES
  (1, 1), (1, 2), (1, 4),
  (2, 1), (2,2),
  (3, 2)
;`;
var dietsFoodsIn = `INSERT INTO Diets_Foods (diet_id, food_id) VALUES
  (1, 3), (1,5),
  (2, 1), (2, 2), (2, 4),
  (3, 3), (3, 5)
;`;

var updateLikes = `UPDATE Foods RIGHT JOIN (
SELECT food_id, COUNT(user_id) AS cnt FROM Foods_Users GROUP BY food_id) AS t
ON Foods.id = t.food_id
SET likes=cnt;`

  try{
    const [rFoods, fFoods] = await db.execute(foodIn);
    await db.execute(allergyIn);
    await db.execute(dietIn);
    await db.execute(usersIn);
    await db.execute(foodsUsersIn);
    await db.execute(allergiesUsersIn);
    await db.execute(dietsUsersIn);
    await db.execute(allergiesFoodsIn);
    await db.execute(dietsFoodsIn);

    await db.execute(updateLikes);

  } catch(err){
    console.log(err);
  }

}

async function randQuerry(arg){
  //here's some queries to play with:

  //get all columns in the food table
  // var sql = `SELECT * FROM Foods;`;

  //get all food-user pairs
  // var sql = `SELECT Foods.name, Users.username
  // FROM Foods
  // JOIN Foods_Users ON Foods_Users.food_id = Foods.id
  // JOIN Users ON Foods_Users.user_id = Users.id;` 

  //get the highest ranked foods
  // var sql = `SELECT name, likes
  //   FROM Foods
  //   ORDER BY likes DESC;`

  //search for foods by keywords
  var sql = `SELECT name
    FROM Foods
    WHERE name LIKE '%${arg}%';`
  
		var response = '';
    try{
			const [rFoods, fFoods] = await db.execute(sql);
			response = rFoods;
    } catch(err){
      // console.error(err);
      return err.code; //for example, ER_DUP_ENTRY
    }
		  return response;
}
