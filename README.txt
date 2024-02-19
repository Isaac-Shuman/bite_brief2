Every "install" command necessary when running the app:

npm install express //Install Express.js for Node.js server
npm install axios //axios is used by the React.js app to make API requests to the Node.js server

- but, y'know, just do npm install

"proxy": "http://localhost:3001" //This line suddenly stopped working for me, so I added 
                                    // src/setupProxy.js

MAKE A DATABASE prior to running the script. 
If you're on Windows, Isaac can help you with this.
If you're on Linux or WSL, run: usr/local/mysql/bin/mysql -u root -e "CREATE DATABASE IF NOT EXISTS default_db" -p

- Ignore the Sql_functions.js file: I was trying to make a class to encapsulate
all DB interaction, but my functions would return null before the query was
completed, so then I tried using promises (await keyword) to make the program 
stop until the query finished, and maybe I could've gotten it to work with 
another hour or two, but I'm too lazy to :/

- So I'm using promises (or whatever this 'ES7 Async Await' thing is)
in server.js functions to initialize and querry the database.

- I only changed package.json, src/setupProxy.js, server.js, and src/pages/rankings.js

- Make sure your SQL server is running and you put the correct configs in the server.js initialize() function.
- Run these commands in seperate terminals:
npm start
node server.js

- Your output on the rankings page should look like:

    React and Node.js Integration
    Full Message from server: [{"id":1,"name":"pizza"},{"id":2,"name":"cake"},{"id":3,"name":"salad"},{"id":4,"name":"ice cream"}]

    After for-loop processing: 1 pizza<br />2 cake<br />3 salad<br />4 ice cream<br />

    The linebreak (br) thing doesn't work as a string but let's fix that later


