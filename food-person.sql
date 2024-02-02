-- https://dev.mysql.com/doc/refman/8.3/en/insert-on-duplicate.html

-- https://www.ibm.com/docs/en/db2-for-zos/12?topic=integrity-defining-foreign-key

-- (master list of foods)
CREATE TABLE foods (
	name VARCHAR(10), 
	id BIGINT PRIMARY KEY AUTO_INCREMENT,
	serving BOOL DEFAULT 0,
	likes BIGINT DEFAULT 0,
	UNIQUE(name)
);

CREATE TABLE people(
  name VARCHAR(10),
  id BIGINT PRIMARY KEY AUTO_INCREMENT
);

-- (to join people and foods table)
CREATE TABLE helper(
  food_id BIGINT,
  person_id BIGINT,
  FOREIGN KEY (food_id) REFERENCES foods(id),
  FOREIGN KEY (person_id) REFERENCES people(id),
  UNIQUE(food_id, person_id)
);

-- (foods being offered today: may have new items that are not in foods table)
CREATE TABLE today_foods(
  n_name VARCHAR(10) PRIMARY KEY
);

INSERT INTO foods (name) VALUES ('pizza'),('cake'), ('salad'), ('ice cream');
INSERT INTO people (name) VALUES ('Bob'), ('Billy');
INSERT INTO today_foods(n_name) VALUES ('cake'), ('ice cream'), ('pie');

-- (add the food item if it's not already in foods)
-- (update food.serving to 1 if food is in today_foods)
INSERT INTO foods(name)
  SELECT n_name FROM today_foods
  ON DUPLICATE KEY UPDATE serving = 1; 
-- (doing it twice so that serving=1 if we just added a new food entry...inefficient workaround)
INSERT INTO foods(name)
SELECT n_name FROM today_foods
ON DUPLICATE KEY UPDATE serving = 1; 

-- (add some food preferences for the people)
INSERT INTO helper(food_id, person_id) VALUES (1, 1);
-- ('pizza', 'Bob')
INSERT INTO helper(food_id, person_id) VALUES (1, 2);
-- ('pizza', 'Billy')
INSERT INTO helper(food_id, person_id) VALUES (2, 2);
-- ('cake', 'Billy')
INSERT INTO helper(food_id, person_id) VALUES (3, 2);
-- ('salad', 'Billy')
INSERT INTO helper(food_id, person_id) VALUES (5, 1);
-- ('pie', 'Bob')


-- (count the number of people who liked this food in the helper table)
UPDATE foods RIGHT JOIN (
SELECT food_id, COUNT(person_id) AS cnt FROM helper GROUP BY food_id) AS t
ON foods.id = t.food_id
SET likes=cnt;

SELECT * FROM foods;
SELECT * FROM people;
SELECT * FROM today_foods;
SELECT * FROM helper;

-- (what foods liked by people with id <3 are currently being served? :) 
SELECT name
FROM foods
JOIN helper
ON helper.person_id <3 AND helper.food_id = foods.id AND foods.serving = 1;
