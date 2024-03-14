//Code ripped from: https://www.linkedin.com/pulse/connecting-reactjs-nodejs-bit-by-bit-guide-ataur-rahman/

//For most of mysql2 stuff: https://sidorares.github.io/node-mysql2/docs/documentation/promise-wrapper

const express = require("express");
const app = express();
const port = 3001; //arbitrary
const email_rate = 60000; //every 10 s, low for testing
const csv = require("fast-csv"); //to parse the csv
const fs = require("fs"); //to be able to gain acsess to the csv file

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); //necessary for it to process post request which contain data
var cookieParser = require("cookie-parser");
app.use(cookieParser());

//var curUserID = "dog";

const mysql = require("mysql2/promise");
const { type } = require("@testing-library/user-event/dist/type");
var nodemailer = require("nodemailer");
let db = main();
//async keyword lets you use 'await'
async function main() {
  //because await can't be used in top-level, so let's make a function...

  //"wait" for these commands to return instead of executing synchronously
  //wow that was an awfully long time spent debugging and googling
  db = await initialize();
  await readData();
  return db;
}
setInterval(()=>{email()}, email_rate); //email all users

setInterval(() => {
  getAllergiesIndex();
}, 60000); //in milliseconds

app.get("/api/data", async (req, res) => {
  //I hope that async doesn't break something later...
  rows = await randQuerry("e");
  console.log(JSON.stringify(rows)); //to see rows on console in readable format
  const data = { message: rows };
  res.json(data); //send it off
});

app.get("/api/search", async (req, res) => {
  let searchTerm = req.query.term;
  if (!searchTerm) {
    return res.status(400).send("Search term is required");
  }
  try {
    let sql = `SELECT * FROM foods WHERE name LIKE ?`;
    const [results, fields] = await db.execute(sql, [`%${searchTerm}%`]);
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred while searching");
  }
});

app.get("/api/user/uid", async (req, res) => {
  const data = { userID: req.cookies.curUserId };
  res.json(data);
});

//add searching result(fav dish) to database
app.post("/api/user/addToFavorites", async (req, res) => {
  const { formerly_userID, foodID } = req.body; // Extract userId and foodId from the request body

  var userID = req.cookies["curUserId"];
  //console.log("userID in add to favorites", userID);

  if (!userID || !foodID) {
    return res.status(400).json({ message: "Missing user ID or food ID" });
  }

  try {
    var sql = `INSERT INTO Foods_Users (user_id, food_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE user_id = user_id;`; //prevent duplicates
    await db.execute(sql, [userID, foodID]);
    res.json({ message: "Favorite added successfully." });
  } catch (err) {
    console.error("Error adding favorite:", err);
    res.status(500).json({ message: "Error adding favorite" });
  }
});

app.get("/api/user/random", async (req, res) => {
  try {
    const [users, _] = await db.execute(
      "SELECT id, username, fun_fact FROM Users ORDER BY RAND() LIMIT 1"
    );
    const user = users[0];
    console.log(user);
    if (user) {
      res.json({ user });
    } else {
      res.status(404).json({ message: "No users found" });
    }
  } catch (err) {
    console.error("Error fetching random user:", err);
    res.status(500).json({ message: "Error fetching random user" });
  }
});

app.post("/api/user/addFact", async (req, res) => {
  var userID = req.cookies["curUserId"];
  const fact = req.body.fact;

  var sql = `UPDATE Users SET fun_fact = '${fact}' WHERE id = ${userID};`;

  console.log("userID when adding fun fact %s", userID);
  console.log("cookie in post is storing %s", req.cookies);

  try {
    await db.execute(sql);
    res.json({ message: "Fact added successfully." });
  } catch (err) {
    console.error("Error adding fact:", err);
    res.status(500).json({ message: "Error adding fact" });
  }
});

app.get("/api/recommendeddish", async (req, res) => {
  const { formerlyUserID, mealPeriodID } = req.query; // Extracting userID and mealPeriodID from query parameters
  var userID = req.cookies["curUserId"];
  //console.log("userID in add to favorites", userID);

  if (!userID) {
    return res.status(400).json({ message: "Missing user ID or food ID" });
  }

  if (!userID || !mealPeriodID) {
    return res
      .status(400)
      .json({ message: "Missing userID or mealPeriodID parameter" });
  }

  // First we check if the user has diet preferences
  let hasDietPreferencesQuery = `
        SELECT COUNT(*) AS dietCount 
        FROM Diets_Users 
        WHERE user_id = ?;
    `;
  let hasDietPreferences = false;
  try {
    const [dietPreferenceResults] = await db.execute(hasDietPreferencesQuery, [
      userID,
    ]);
    hasDietPreferences = dietPreferenceResults[0].dietCount > 0;
  } catch (error) {
    console.error("Error checking diet preferences:", error);
    return res.status(500).json({ message: "Error checking diet preferences" });
  }

  // Additional: Check if the user has allergies
  let hasAllergiesQuery = `
        SELECT COUNT(*) AS allergyCount 
        FROM Allergies_Users 
        WHERE user_id = ?;
    `;
  let hasAllergies = false;
  try {
    const [allergyResults] = await db.execute(hasAllergiesQuery, [userID]);
    hasAllergies = allergyResults[0].allergyCount > 0;
  } catch (error) {
    console.error("Error checking allergies:", error);
    return res.status(500).json({ message: "Error checking allergies" });
  }

  //set a condition that check if the user has diet
  let sql = "";
  if (hasDietPreferences) {
    // User has diet preferences
    sql = `
            SELECT Foods.name,Foods.id
            FROM Foods 
            JOIN Diets_Foods ON Diets_Foods.food_id = Foods.id 
            JOIN Diets ON Diets.id = Diets_Foods.diet_id 
            JOIN Diets_Users ON Diets_Users.diet_id = Diets.id 
            JOIN Foods_MealPeriods ON Foods.id = Foods_MealPeriods.food_id
            WHERE Diets_Users.user_id = ?
            AND Foods_MealPeriods.meal_id = ?;
        `;
  } else if (hasAllergies) {
    // User does not have diet preferences but has allergies
    sql = `
            SELECT Foods.name,Foods.id
            FROM Foods 
            JOIN Foods_MealPeriods ON Foods.id = Foods_MealPeriods.food_id
            WHERE Foods.id NOT IN (
                SELECT food_id 
                FROM Allergies_Foods 
                JOIN Allergies_Users ON Allergies_Foods.allergy_id = Allergies_Users.allergy_id 
                WHERE Allergies_Users.user_id = ?)
            AND Foods_MealPeriods.meal_id = ?;
        `;
  } else {
    // User has neither diet preferences nor allergies
    sql = `
            SELECT Foods.name,Foods.id
            FROM Foods 
            JOIN Foods_MealPeriods ON Foods.id = Foods_MealPeriods.food_id
            WHERE Foods_MealPeriods.meal_id = ?;
        `;
  }

  try {
    const [foods] = await db.execute(
      sql,
      hasDietPreferences || hasAllergies
        ? [userID, mealPeriodID]
        : [mealPeriodID]
    );
    res.json(foods); // Send the retrieved data back to the client
  } catch (error) {
    console.error("Error retrieving recommended dishes:", error);
    res.status(500).json({ message: "Error retrieving recommended dishes" });
  }
});

app.post("/api/favdishes", async (req, res) => {
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

  var updateLikes = `UPDATE Foods RIGHT JOIN (
      SELECT food_id, COUNT(user_id) AS cnt FROM Foods_Users GROUP BY food_id) AS t
      ON Foods.id = t.food_id
      SET likes=cnt;`; // to update like count for foods

  var sql = `SELECT name, likes
    FROM Foods
    ORDER BY likes DESC;`;

  var response = "";
  try {
    await db.execute(updateLikes);
    const [rFoods, fFoods] = await db.execute(sql);
    response = rFoods;
  } catch (err) {
    // console.error(err);
    res.json(err.code); //for example, ER_DUP_ENTRY
  }
  // console.log(JSON.stringify(response));
  res.json(response);
});

app.get("/api/severeAllergies", async (req, res) => {
  let result = await ReturnAllergySeverityJSONFormat();
  res.json(result)
});

app.post("/api/profile", async (req, res) => {
  //send back:
  //[meal, urlToNutritionPage, whether or not the user liked it]
  const meal = req.body.meal;
  //const data = { message: meal.length}
  const data = [
    { name: "Item 1     ", likes: 69 },
    { name: "Item 2     ", likes: 420 },
    { name: "Item 3     ", likes: 1738 },
    { name: "Item 4     ", likes: 25 },
    { name: "Item 5     ", likes: meal.length },
  ];
  res.json(data);
});

app.post("/api/user/myFavDishes", async (req, res) => {
  //const formerly_userID = req.body.id;
  var userID = req.cookies["curUserId"];
  if (!userID) {
    return res.status(400).json({ message: "Missing userID parameter" });
  }

  var sql = `SELECT Foods.name, Users.username, Foods.id
  FROM Foods
  JOIN Foods_Users ON Foods_Users.food_id = Foods.id
  JOIN Users ON Foods_Users.user_id = Users.id
  WHERE Users.id = ${userID};`;

  //console.log("userID when requesting favdishes: %s", userID);
  //console.log("cookie in post is storing %s", req.cookies);

  var response = "";
  try {
    const [rFoods, fFoods] = await db.execute(sql);
    response = rFoods;
  } catch (err) {
    // console.error(err);
    res.json(err.code); //for example, ER_DUP_ENTRY
  }
  res.json(response);
});

app.post("/api/user/addAllergy", async (req, res) => {
  var allergyID = req.body.allergyID;
  var userID = req.cookies["curUserId"];

  if (!userID) {
    return res.status(400).json({ message: "Missing userID parameter" });
  }

  var sql = `INSERT INTO Allergies_Users (allergy_id, user_id) VALUES
   (${allergyID}, ${userID}) ON DUPLICATE KEY UPDATE user_id = user_id;`;

  // console.log("userID when adding allergy: %s", userID);
  // console.log("cookie in post is storing %s", req.cookies);

  var response = "";
  try {
    await db.execute(sql);
    res.json({ message: "Allergy added successfully." });
  } catch (err) {
    console.error("Error adding allergy:", err);
    res.status(500).json({ message: "Error adding allergy" });
  }
});

app.post("/api/user/addDiet", async (req, res) => {
  var dietID = req.body.dietID;
  var userID = req.cookies["curUserId"];
  if (!userID) {
    return res.status(400).json({ message: "Missing userID parameter" });
  }

  var sql = `INSERT INTO Diets_Users (diet_id, user_id) VALUES
   (${dietID}, ${userID}) ON DUPLICATE KEY UPDATE user_id = user_id;`;

  // console.log("userID when adding diet: %s", userID);
  // console.log("cookie in post is storing %s", req.cookies);

  var response = "";
  try {
    await db.execute(sql);
    res.json({ message: "Diet added successfully." });
  } catch (err) {
    console.error("Error adding diet:", err);
    res.status(500).json({ message: "Error adding diet" });
  }
});

app.post("/api/user/myDiets", async (req, res) => {
  var userID = req.cookies["curUserId"];
  if (!userID) {
    return res.status(400).json({ message: "Missing userID parameter" });
  }

  var sql = `SELECT Diets.name, Diets.id
  FROM Diets
  JOIN Diets_Users ON Diets_Users.diet_id = Diets.id
  WHERE Diets_Users.user_id = ${userID}
  ORDER BY Diets.id ASC;`;

  // console.log("userID when requesting my diets: %s", userID);
  //console.log("cookie in post is storing %s", req.cookies);

  var response = "";
  try {
    const [rFoods, fFoods] = await db.execute(sql);
    response = rFoods;
  } catch (err) {
    // console.error(err);
    res.json(err.code); //for example, ER_DUP_ENTRY
  }
  res.json(response);
});

app.post("/api/user/leftDiets", async (req, res) => {
  var userID = req.cookies["curUserId"];
  if (!userID) {
    return res.status(400).json({ message: "Missing userID parameter" });
  }

  var sql = `SELECT Diets.name, Diets.id
  FROM Diets
  WHERE Diets.id NOT IN (
    SELECT Diets.id
    FROM Diets
    JOIN Diets_Users ON Diets_Users.diet_id = Diets.id
    WHERE Diets_Users.user_id = ${userID}
  )`;

  // LEFT JOIN Diets_Users ON  Diets_Users.diet_id = Diets.id
  // WHERE Diets_Users.user_id IS NULL OR Diets_Users.user_id != ${userID}
  // GROUP BY Diets.id
  // ORDER BY Diets.id ASC;`;

  // console.log("userID when requesting left diets: %s", userID);
  // console.log("cookie in post is storing %s", req.cookies);

  var response = "";
  try {
    const [rFoods, fFoods] = await db.execute(sql);
    response = rFoods;
  } catch (err) {
    // console.error(err);
    res.json(err.code); //for example, ER_DUP_ENTRY
  }
  res.json(response);
});

app.post("/api/user/myAllergies", async (req, res) => {
  var userID = req.cookies["curUserId"];
  if (!userID) {
    return res.status(400).json({ message: "Missing userID parameter" });
  }

  var sql = `SELECT Allergies.name, Allergies.id
  FROM Allergies
  JOIN Allergies_Users ON Allergies_Users.allergy_id = Allergies.id
  WHERE Allergies_Users.user_id = ${userID};`;

  console.log("userID when requesting my allergies: %s", userID);
  console.log("cookie in post is storing %s", req.cookies);

  var response = "";
  try {
    const [rFoods, fFoods] = await db.execute(sql);
    response = rFoods;
  } catch (err) {
    // console.error(err);
    res.json(err.code); //for example, ER_DUP_ENTRY
  }
  res.json(response);
});

app.post("/api/user/leftAllergies", async (req, res) => {
  var userID = req.cookies["curUserId"];
  if (!userID) {
    return res.status(400).json({ message: "Missing userID parameter" });
  }

  var sql = `SELECT Allergies.name, Allergies.id
    FROM Allergies
    WHERE Allergies.id NOT IN (
      SELECT Allergies.id
      FROM Allergies
      JOIN Allergies_Users ON Allergies_Users.allergy_id = Allergies.id
      WHERE Allergies_Users.user_id = ${userID}
    )`;

  console.log("userID when requesting left allergies: %s", userID);
  console.log("cookie in post is storing %s", req.cookies);

  var response = "";
  try {
    const [rFoods, fFoods] = await db.execute(sql);
    response = rFoods;
  } catch (err) {
    // console.error(err);
    res.json(err.code); //for example, ER_DUP_ENTRY
  }
  res.json(response);
});

app.delete("/api/user/myFavDishes", async (req, res) => {
  const foodID = req.body.Fid;
  const formerly_userID = req.body.Uid;

  console.log("cookie in delete is storing %s", req.cookies);
  var userID = req.cookies["curUserId"];
  if (!userID) {
    return res.status(400).json({ message: "Missing userID parameter" });
  }

  var sql1 = `DELETE FROM Foods_Users
    WHERE user_id = ${userID} AND food_id = ${foodID};`;
  var sql2 = `UPDATE Foods SET likes = likes - 1
    WHERE id = ${foodID};`; //also update like count

  console.log(sql1);
  var response = "";
  try {
    await db.execute(sql1);
    await db.execute(sql2);
  } catch (err) {
    // console.error(err);
    res.json(err.code); //for example, ER_DUP_ENTRY
    return;
  }
  return;
});

app.delete("/api/user/myDiets", async (req, res) => {
  const dietID = req.body.Did;

  console.log("cookie in delete is storing %s", req.cookies);
  var userID = req.cookies["curUserId"];
  if (!userID) {
    return res.status(400).json({ message: "Missing userID parameter" });
  }

  var sql = `DELETE FROM Diets_Users
    WHERE user_id = ${userID} AND diet_id = ${dietID};`;

  console.log(sql);
  try {
    await db.execute(sql);
  } catch (err) {
    // console.error(err);
    res.json(err.code); //for example, ER_DUP_ENTRY
    return;
  }
  return;
});

app.delete("/api/user/myAllergies", async (req, res) => {
  const allergyID = req.body.Aid;

  console.log("cookie in delete is storing %s", req.cookies);
  var userID = req.cookies["curUserId"];
  if (!userID) {
    return res.status(400).json({ message: "Missing userID parameter" });
  }

  var sql = `DELETE FROM Allergies_Users
    WHERE user_id = ${userID} AND allergy_id = ${allergyID};`;
  console.log(sql);

  try {
    await db.execute(sql);
  } catch (err) {
    // console.error(err);
    res.json(err.code); //for example, ER_DUP_ENTRY
    return;
  }
  return;
});

app.post("/api/user", async (req, res) => {
  const { data } = req.body;

  if (!data) {
    return res.status(400).json({ error: "No data passed" });
  }
  console.log("name received by api/signup: %s", data.name);
  console.log("email received by api/signup %s", data.email);
  // data.name, data.email, data.picture for Google user profile data

  //BEATRICE. Why not just make searchQuery a global variable and use it as the user id when servicing other requests such as loading favorite dishes?
  //ISAAC, then we still need to pass the email around for each user, might as well just use their ID directly
  const searchQuery = `SELECT id 
    FROM Users
    WHERE email = '${data.email}';`;
  // search if user email is in database

  const updateQuery = `INSERT INTO Users (username, email) VALUES
    ('${data.name}', '${data.email}');`;
  // updates database with user data

  try {
    const [user, fields] = await db.execute(searchQuery);

    if (user.length == 0) {
      //email DNE
      await db.execute(updateQuery);
    }
    const [u, f] = await db.execute(searchQuery);
    // console.log(typeof(u))
    // console.log(u)
    var cuid = Number(u[0]["id"]);
    res.cookie("curUserId", cuid);
    console.log("curUserID dredged from database in api/signup %s", cuid);
  } catch (error) {
    console.log(error.code);
    res.status(400).json(error);
  }

  res.send("success");
});


  app.post('/api/user', async (req, res) => {
    const {data} = req.body

    if (!data) {
      return res.status(400).json({ error: 'No data passed' })
    }
    console.log("name received by api/signup: %s", data.name);
    console.log("email received by api/signup %s", data.email);
    // data.name, data.email, data.picture for Google user profile data


    //BEATRICE. Why not just make searchQuery a global variable and use it as the user id when servicing other requests such as loading favorite dishes?
    //ISAAC, then we still need to pass the email around for each user, might as well just use their ID directly
    const searchQuery = `SELECT id 
    FROM Users
    WHERE email = '${data.email}';`
    // search if user email is in database

    const updateQuery = `INSERT INTO Users (username, email) VALUES
    ('${data.name}', '${data.email}');`
    // updates database with user data

    try {
      const [user,fields] = await db.execute(searchQuery)

      if (user.length==0) { //email DNE
        await db.execute(updateQuery)
      }
      const [u,f] = await db.execute(searchQuery)
      // console.log(typeof(u))
      // console.log(u)
      var cuid = Number(u[0]['id'])
      res.cookie("curUserId", cuid);
      console.log("curUserID dredged from database in api/signup %s", cuid);
      
    }
    catch (error) {
      console.log(error.code)
      res.status(400).json(error)
    }

    res.send("success")
  })  
///////

async function InsertAllergySeverityIntoAllergies_UsersTable(userIndices, userID) //this function takes data about allergy severity from the client and inserts it into the DB
{
  for (const [allergy_id, severity] of Object.entries(userIndices))
  {
    await db.execute(`
    UPDATE Allergies_Users 
    SET allergy_severity = (?) 
    WHERE allergy_id = (?) AND user_id = (?);`, [severity, allergy_id, userID]);
  }
  // for(Indicy of userIndices)
  // {
  //   [resultat] = await db.execute(`
  //   INSERT INTO Allergies_Users (allergy_severity) VALUES (?)
  //    WHERE Allergy_is = (?)`, Indicy.allergy_severity, Indicy.Allergie_id);
  // }
}

async function GetAllergySeverityInfoAboutAUser(UserID)
{
  const [allergy_data] = await db.execute(`
  SELECT allergy_id, allergy_severity 
  FROM Allergies_Users 
  WHERE user_id = (?);`, [UserID]);

  let allergyDataDictFormat = {};
  for (let row of allergy_data) 
  {
    allergyDataDictFormat[row.allergy_id] = row.allergy_severity;
  }

  return allergyDataDictFormat;
}
app.get('/api/user/userIndices', async (req, res) => {
  //const userIndices = req.body.userIndices;
  //console.log("userIndices where index = corresponding Allergy ID", userIndices);
  console.log("cookie in delete is storing %s", req.cookies);

  var userID = req.cookies["curUserId"];
  if (!userID) {
    return res.status(400).json({ message: "Missing userID parameter" });
  }


  //вот сюда видимо надо поместить вызов функции?

  //await InsertAllergySeverityIntoAllergies_UsersTable(userIndices, userID);
  const result = await GetAllergySeverityInfoAboutAUser(userID);

  const newArray = Array.from({ length: 20 }, (_, index) => (result ? result[index] : 0) || 0);
  //I think here is where the function should get called from

  //to do1: мне дают данные клиента, нужно положить в базу данных
  //to do2: мне нужно взять данные клиента из баззы данных и вернуть их в правильном формате
  //Done//to do 3: скинуть Айзаку где находится функция, которая возвращает данные по аллергиям всех клиентов
  
  res.json(newArray);
  return;
});

  app.post("/api/user/addFact", async (req, res) => {
    var userID = req.cookies["curUserId"];
    const fact = req.body.fact;

    var sql = `UPDATE Users
    SET fun_fact = ${fact}
    WHERE id = ${userID}`;

    console.log("userID when adding fun fact %s", userID);
    console.log("cookie in post is storing %s", req.cookies);

    try {
      await db.execute(sql);
      res.json({ message: "Fact added successfully." });
     } catch (err) {
       console.error("Error adding fact:", err);
       res.status(500).json({ message: "Error adding fact" });
 }});

  app.post('/api/user/userIndices', async (req, res) => {
    const userIndices = req.body.userIndices;
    console.log("userIndices where index = corresponding Allergy ID", userIndices);
    //console.log("cookie in delete is storing %s", req.cookies);

    var userID = req.cookies["curUserId"];
    if (!userID) {
      return res.status(400).json({ message: "Missing userID parameter" });
    }

  
    //вот сюда видимо надо поместить вызов функции?

    await InsertAllergySeverityIntoAllergies_UsersTable(userIndices, userID);
    //const result = await GetAllergySeverityInfoAboutAUser(userID);

    //const newArray = Array.from({ length: 20 }, (_, index) => result[index] || 0);
    //I think here is where the function should get called from

    //to do1: мне дают данные клиента, нужно положить в базу данных
    //to do2: мне нужно взять данные клиента из баззы данных и вернуть их в правильном формате
    //Done//to do 3: скинуть Айзаку где находится функция, которая возвращает данные по аллергиям всех клиентов
    

    //res.json(newArray);
    res.send("success")

    return;
  });

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });

// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });

//////helper functions:


async function initialize() {
  //change your parameters as needed
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "12345678",
    database: "default_db", //usr/local/mysql/bin/mysql -u root -e "CREATE DATABASE IF NOT EXISTS default_db" -p
    multipleStatements: false, //protected against sql injections
  });
  console.log("connected as id " + connection.threadId);

  //I labeled the helper tables in alphabetical order, btw
  await connection.execute("DROP TABLE IF EXISTS Foods_Users;");
  await connection.execute("DROP TABLE IF EXISTS Allergies_Users;");
  //await connection.execute("DROP TABLE IF EXISTS Allergies_Severity;");
  await connection.execute("DROP TABLE IF EXISTS Diets_Users;");
  await connection.execute("DROP TABLE IF EXISTS Allergies_Foods;");
  await connection.execute("DROP TABLE IF EXISTS Diets_Foods;");
  await connection.execute("DROP TABLE IF EXISTS Foods_MealPeriods;");

  await connection.execute("DROP TABLE IF EXISTS Foods;"); //delete it if it already exists, for now
  await connection.execute("DROP TABLE IF EXISTS Users;");
  await connection.execute("DROP TABLE IF EXISTS Allergies;");
  await connection.execute("DROP TABLE IF EXISTS Diets;");
  await connection.execute("DROP TABLE IF EXISTS MealPeriods;"); //MealPeriod

  var createFoodsTable = `
  CREATE TABLE Foods (
    id BIGINT PRIMARY KEY AUTO_INCREMENT, 
    name VARCHAR(255) NOT NULL UNIQUE,
    available BOOL DEFAULT 1,
    likes BIGINT DEFAULT 0
    );`; //creating Foods table

  var createUsersTable = `
  CREATE TABLE IF NOT EXISTS Users ( 
   id BIGINT AUTO_INCREMENT PRIMARY KEY,
   username VARCHAR(255) NOT NULL UNIQUE,
   email VARCHAR(255) NOT NULL,
   fun_fact VARCHAR(255) DEFAULT ''
  );`; //creating a Users table
  //email should also be UNIQUE, but removed to test email notifs

  var createAllergiesTable = `
  CREATE TABLE IF NOT EXISTS Allergies ( 
   id BIGINT AUTO_INCREMENT PRIMARY KEY,
   name VARCHAR(255) NOT NULL UNIQUE
  );`; //creating an Allergies table (btw status I think was a good idea to add but wer can delete it. o it basically just indicates how dangerous the allergy is. We can probably make it so that the user inputs how dangerous it is for them)

  var createDietsTable = `
  CREATE TABLE IF NOT EXISTS Diets ( 
   id BIGINT AUTO_INCREMENT PRIMARY KEY,
   name VARCHAR(255) NOT NULL UNIQUE
  );`; //creating a Diets table

  var createMealPeriodsTable = `
  CREATE TABLE MealPeriods (
    id BIGINT PRIMARY KEY AUTO_INCREMENT, 
    name VARCHAR(50) NOT NULL UNIQUE
    );`; //creating Meal Period table

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
     allergy_severity INT DEFAULT 0,
     FOREIGN KEY (allergy_id) REFERENCES Allergies(id),
     FOREIGN KEY (user_id) REFERENCES Users(id),
     UNIQUE(allergy_id, user_id)
  );`; //helper table
  // status VARCHAR(255) NOT NULL UNIQUE

  // var createAllergySeverityTable = `
  // CREATE TABLE IF NOT EXISTS Allergies_Severity (
  //    allergy_name BIGINT,
  //    allergy_severity_index INT
  // );`;

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

  var createFoodsMealPeriodsTable = `
  CREATE TABLE IF NOT EXISTS Foods_MealPeriods (
     food_id BIGINT,
     meal_id BIGINT,
     FOREIGN KEY (food_id) REFERENCES Foods(id),
     FOREIGN KEY (meal_id) REFERENCES MealPeriods(id),
     UNIQUE(food_id, meal_id)
  );`; //helper table

  try {
    const [rFoods, fFoods] = await connection.execute(createFoodsTable);
    const [rUsers, fUsers] = await connection.execute(createUsersTable);
    const [rAllergies, fAllergies] = await connection.execute(
      createAllergiesTable
    );
    const [rDiets, fDiets] = await connection.execute(createDietsTable);
    const [rMealPeriods, fMealPeriods] = await connection.execute(
      createMealPeriodsTable
    );
    await connection.execute(createFoodsUsersTable);
    await connection.execute(createAllergiesUsersTable);
    //await connection.execute(createAllergySeverityTable);
    await connection.execute(createDietsUsersTable);
    await connection.execute(createAllergiesFoodsTable);
    await connection.execute(createDietsFoodsTable);
    await connection.execute(createFoodsMealPeriodsTable);

    console.log("Tables created successfully");
  } catch (err) {
    console.log(err);
    console.error("Error creating tables:", err);
    await connection.end();
  }

  return connection;
}

async function getAllergiesIndex() {
  console.log("went into filling allergy data");
  const [allergies] = await db.execute(
    "SELECT allergy_id, SUM(allergy_severity) AS severity FROM Allergies_Users GROUP BY allergy_id"
  );
}

async function ReturnAllergySeverityJSONFormat()
{
    //console.log("went into filling allergy data");
    const [allergies] = await db.execute(`
    SELECT Allergies.name AS allergy_name, 
    SUM(Allergies_Users.allergy_severity) AS severity 
    FROM Allergies  
    JOIN Allergies_Users ON Allergies.id = Allergies_Users.allergy_id 
    GROUP BY Allergies.id 
    ORDER BY severity DESC`);

    let allergiesArray = allergies.map(row => ({
      name: row.allergy_name, 
      severity: row.severity
  }));

  return allergiesArray;
    
    // let allergySeverityDataDictFormat = {};
    // for (let row of allergies) 
    // {
    //   allergySeverityDataDictFormat[row.allergy_name] = row.severity;
    // }
  
    // return allergySeverityDataDictFormat;
}

//here we have some helper functions for filling tables
async function InsertNameIntoFoods(food_name) {
  const [result] = await db.execute(
    "INSERT INTO Foods (name) VALUES (?) ON DUPLICATE KEY UPDATE id=id",
    [food_name]
  ); //тут надо походу возвращать айдишник, чтобы потом добавлять в хелпер таблицу

  const [r] = await db.execute("SELECT id FROM Foods WHERE name = (?)", [
    food_name,
  ]);
  return r[0].id;
}

/*async function InsertNameIntoMealPeriods(mealPeriod_name) {
  const [result] = await db.execute('INSERT INTO MealPeriods (name) VALUES (?)', [mealPeriod_name]) 
  return result.insertId; //возможно сюда надо будет вставить обрпботку ошибок типа что если не вставилось в таблицу
}*/

async function InsertIdsIntoFoods_MealPeriodsTable(
  inserted_food_id,
  inserted_meal_id
) {
  const [result] = await db.execute(
    "INSERT INTO Foods_MealPeriods (food_id, meal_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE food_id=food_id",
    [inserted_food_id, inserted_meal_id]
  );
}

async function InsertIdsIntoAllergies_FoodsTable(
  inserted_food_id,
  inserted_allergie_id
) {
  const [result] = await db.execute(
    "INSERT INTO Allergies_Foods (allergy_id, food_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE food_id=food_id",
    [inserted_allergie_id, inserted_food_id]
  );
}

async function InsertIdsIntoDiets_FoodsTable(
  inserted_food_id,
  inserted_diet_id
) {
  const [result] = await db.execute(
    "INSERT INTO Diets_Foods (diet_id, food_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE food_id=food_id",
    [inserted_diet_id, inserted_food_id]
  );
}

//findAMealPeriod
async function findAMealPeriod(mealPeriods_name) {
  //returns an ID of the meal period it found or null
  const [meals] = await db.execute(
    "SELECT id FROM MealPeriods WHERE name = (?)",
    [mealPeriods_name]
  );
  if (meals.length > 0) {
    const FoundMealPeriodID = meals[0].id;
    return FoundMealPeriodID;
  } else {
    return null;
  }
}

async function findAnAllergie(allergie_name) {
  //returns an ID of the Allergie it found or null
  const [allergies] = await db.execute(
    "SELECT id FROM Allergies WHERE name = (?)",
    [allergie_name]
  );
  if (allergies.length > 0) {
    const FoundAllergieID = allergies[0].id;
    return FoundAllergieID;
  } else {
    return null;
  }
}
//может их совместить?
async function findADiet(diet_name) {
  if (diet_name === "Vegetarianegan") {
    //console.log("Detected a vegan diet: ", diet_name);
    diet_name = "Vegan";
  }
  const [diets] = await db.execute("SELECT id FROM Diets WHERE name = (?)", [
    diet_name,
  ]);
  if (diets.length > 0) {
    const FoundDietID = diets[0].id;
    //console.log("Dish name: ", diets[0]);
    return FoundDietID;
  } else {
    return null;
  }
}

async function readData() {
  //probably where the web-scraping stuff goes
  //add some dummy data for now

  //var foodIn = "INSERT INTO Foods (name) VALUES ('pizza'), ('cake'), ('salad'), ('ice cream'), ('water');";
  var allergyIn = `INSERT INTO Allergies (name) VALUES 
  ('Contains alcohol'), 
  ('Contains Gluten'), 
  ('Contains Peanut'),
  ('Contains sesame'),
  ('Contains soy'),
  ('Contains tree nuts'),
  ('Contains Wheat'),
  ('Contains dairy'),
  ('Contains egg'),
  ('Contains fish'),
  ('Contains shellfish')
  ;`;
  var dietIn = `INSERT INTO Diets (name) VALUES 
    ('Vegetarian'),
    ('Vegan'),
    ('Low Carbon Footprint'),
    ('High Carbon Footprint'),
    ('Halal menu option')
;`;
  var MealPeriodIn = `INSERT INTO MealPeriods (name) VALUES 
    ('Breakfast'),
    ('Lunch'),
    ('Dinner')
;`;

  //Now here will go the code for reading some data from the csv file and putting it into the Foods table:
  fs.readFile(
    "bitebrief_webscraping_v1.xlsx - Sheet1.csv",
    "utf8",
    async (err, data) => {
      if (err) {
        console.error("error while reading the file", err);
        return;
      }
      csv
        .parseString(data, { headers: true }) //starting to parse
        .on("data", async (row) => {
          //this is used to listen if anyone wants to know till we r done w parsin one line and can do stuff w it
          //важно понимать, что row - это аргумент вот этой далее представленной async функции и он
          //выглядит внутри как словарь, где ключи это названия заголовков а содержимое это данные
          //асссоциируемые с каждым заголовком в конкретной строчке которая только что обработалась
          const food_name = row.dish_name;
          if (food_name.startsWith("w/")) {
            return;
          }
          console.log("Food name", food_name);
          //const mealPeriod_name = row.meal_period;
          const inserted_food_id = await InsertNameIntoFoods(food_name);
          //const inserted_meal_id = InsertNameIntoMealPeriods(mealPeriod_name); //эту переменную потом используем для вставки в хелпер таблицу
          //сюда пойдет код с заполнением хелпер таблиц: парсим сквозь теги и тд Я устаааааала пхпх но мне клево
          //InsertIdsIntoFoods_MealPeriodsTable(inserted_food_id, inserted_meal_id); //it doesn't return anything just fills the helper table
          for (const header_csv of Object.keys(row)) {
            if (header_csv === "meal_period") {
              const mealPeriod = row[header_csv];
              const MealPeriod_id = await findAMealPeriod(mealPeriod);
              if (MealPeriod_id) {
                console.log(inserted_food_id, MealPeriod_id);
                await InsertIdsIntoFoods_MealPeriodsTable(
                  inserted_food_id,
                  MealPeriod_id
                );
              }
            }
            if (header_csv.startsWith("Tag")) {
              const tag = row[header_csv]; //по сути row - это словарь, поэтому тут мы просто извлекаем по ключу headerа значения в этой строчке
              //теперь тут нужно сделать проверку по соответсвию содержимого тега (tag) одной или другой таблице
              const Allergie_id = await findAnAllergie(tag);
              const Diet_id = await findADiet(tag);
              if (Allergie_id) {
                //тут надо функцию котора заполняла бы хелпер таблицу AllrgiesFoods
                await InsertIdsIntoAllergies_FoodsTable(
                  inserted_food_id,
                  Allergie_id
                );
              }
              if (Diet_id) {
                await InsertIdsIntoDiets_FoodsTable(inserted_food_id, Diet_id);
              }
            }

            if (header_csv.startsWith("Tag")) {
              const tag = row[header_csv]; //по сути row - это словарь, поэтому тут мы просто извлекаем по ключу headerа значения в этой строчке
              //теперь тут нужно сделать проверку по соответсвию содержимого тега (tag) одной или другой таблице
              const Allergie_id = await findAnAllergie(tag);
              const Diet_id = await findADiet(tag);
              if (Allergie_id) {
                //тут надо функцию котора заполняла бы хелпер таблицу AllrgiesFoods
                await InsertIdsIntoAllergies_FoodsTable(
                  inserted_food_id,
                  Allergie_id
                );
              }
              if (Diet_id) {
                await InsertIdsIntoDiets_FoodsTable(inserted_food_id, Diet_id);
              }
            }
          }
        })
        .on("end", () => {
          console.log("done parsing and filling tables");
        });

      //await fillAllergiesSeverityTable();

      /*
  var foodIn =
    "INSERT INTO Foods (name) VALUES ('pizza'), ('cake'), ('salad'), ('ice cream'), ('water');";
  var allergyIn =
    "INSERT INTO Allergies (name) VALUES ('dairy'), ('gluten'), ('eggs');";
  var dietIn = `INSERT INTO Diets (name, description) VALUES 
    ('healthy', 'what''s good for you'), 
    ('processed', 'what''s probably not good for you'), 
    ('vegan', 'no animal products')
      ;`;
*/

      var usersIn = `INSERT INTO Users (username, email, fun_fact) VALUES
    ('blen', 'bitebriefnoreply2@gmail.com', 'is very tired'),
    ('Mashamellow', 'bitebriefnoreply2@gmail.com' , 'is very happy'),
    ('Koopa', 'bitebriefnoreply2@gmail.com', 'likes emacs'),
    ('zeeehan', 'bitebriefnoreply2@gmail.com' , 'fast learner'),
    ('0xyw','bitebriefnoreply2@gmail.com' , 'good at styling'),
    ('Kyuki','bitebriefnoreply2@gmail.com', 'good at security')
  ;`;

      var foodsUsersIn = `INSERT INTO Foods_Users (food_id, user_id) VALUES 
    (1, 6),
    (2, 6),
    (3, 1), (3, 6),
    (4, 2), (4, 5), (4, 6),
    (5,1), (5,2), (5,3), (5,4), (5,5), (5,6)
  ;`;
      var allergiesUsersIn = `INSERT INTO Allergies_Users (allergy_id, user_id, allergy_severity) VALUES 
    (1, 4, 1), (1, 5, 1), (2, 1, 10)
  ;`;
      var dietsUsersIn = `INSERT INTO Diets_Users (diet_id, user_id) VALUES 
  (3, 4), (1, 3)
;`;
      // var allergiesFoodsIn = `INSERT INTO Allergies_Foods (allergy_id, food_id) VALUES
      // (1, 1), (1, 2), (1, 4),
      // (2, 1), (2,2),
      // (3, 2)
      //   var dietsFoodsIn = `INSERT INTO Diets_Foods (diet_id, food_id) VALUES
      //   (1, 3), (1,5),
      //   (2, 1), (2, 2), (2, 4),
      //   (3, 3), (3, 5)
      // ;`;

      var updateLikes = `UPDATE Foods RIGHT JOIN (
SELECT food_id, COUNT(user_id) AS cnt FROM Foods_Users GROUP BY food_id) AS t
ON Foods.id = t.food_id
SET likes=cnt;`;

      try {
        //const [rFoods, fFoods] = await db.execute(foodIn);
        await db.execute(allergyIn);
        await db.execute(dietIn);
        await db.execute(MealPeriodIn);
        await db.execute(usersIn);
        await db.execute(foodsUsersIn);
        await db.execute(allergiesUsersIn);
        await db.execute(dietsUsersIn);
        //await db.execute(allergiesFoodsIn);
        //await db.execute(dietsFoodsIn);

        await db.execute(updateLikes);
      } catch (err) {
        console.log(err);
      }
    }
  );
}

// https://www.w3schools.com/nodejs/nodejs_email.asp
// gmail password for this account is: "bitebriefCS35L"
async function email() {
  var transporter = await nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "bitebriefnoreply2@gmail.com",
      // pass: "xjpp oelj zrxb hwxx",
      pass: "ttpl kwjf oiug qtcq",
    },
  });
  var getUsers = `SELECT id, username, email FROM Users`;
  try {
    const [rUsers, fUsers] = await db.execute(getUsers);
    for (var i = 0; i < rUsers.length; i++) {
      //probably somehow join with food availability later
      var sql = `SELECT MealPeriods.name AS meal, Foods.name FROM Foods 
      JOIN Foods_Users ON Foods_Users.food_id = Foods.id
      JOIN Foods_MealPeriods ON Foods.id = Foods_MealPeriods.food_id
      JOIN MealPeriods ON MealPeriods.id = Foods_MealPeriods.meal_id
      WHERE Foods_Users.user_id = ${rUsers[i].id} ORDER BY Foods_MealPeriods.meal_id ASC
      ;`;
      // console.log(rUsers[i]);
      const [rFoods, fFoods] = await db.execute(sql);
      // var msg = JSON.stringify(rFoods);
      msg = `Hello ${rUsers[i].username},\nYour favorite foods available are:\n`;
      msg = msg + "Meal".padEnd(15, " ") + "Food\n";
      msg = msg + "".padEnd(40, "=") + "\n";
      for (var j = 0; j < rFoods.length; j++) {
        // console.log(rFoods[j])
        msg = msg + rFoods[j].meal.padEnd(15, " ") + rFoods[j].name + `\n`;
      }

      console.log(msg);

      var mailOptions = {
        from: "bitebriefnoreply2@gmail.com",
        to: `${rUsers[i].email}`,
        subject: `Sending your fav foods, ${rUsers[i].username}`,
        text: `${msg}`,
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log("Email sent: " + info.response);
        }
      });
    }
  } catch (err) {
    console.log(err);
  }
}

async function randQuerry(arg) {
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
    WHERE name LIKE '%${arg}%';`;

  var response = "";
  try {
    const [rFoods, fFoods] = await db.execute(sql);
    response = rFoods;
  } catch (err) {
    // console.error(err);
    return err.code; //for example, ER_DUP_ENTRY
  }
  return response;
}
