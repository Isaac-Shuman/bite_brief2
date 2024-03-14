![BiteBrief.js](https://github.com/Isaac-Shuman/bite_brief2/blob/main/bite_brief_logo.webp)








TO RUN THIS APP:
Install mySQL
Install node.js so that you can run "node server.js" later on
Go into the bite_brief2 directory you pulled from github.
Make a mySQL database:
    Install mySQL
    If you're on Linux or WSL, run: usr/local/mysql/bin/mysql -u root -e "CREATE DATABASE IF NOT EXISTS default_db" -p
    If you're on Windows, I used mySQL Workbench to make my database.
    It seems like you have a lot of flexibility with where the database is located.
Update the initialize function server.js to your username (it's probably still root) password and database name.

RUNNING THIS APP:
Run "npm install" to install the dependencies for the app such as axios and express.
Run "node server.js" to start the backend server. If this works without throwing an error then it means you did the database part right.
Run "npm start" IN A SEPARATE TERMINAL to start the react app. The website should now be visible in port 3000 and should be loading in data from the server on the rankings page.
The navbar may not be fully visible if your window is not maximized.



Attribution info:
    This project was bootstrapped with Create React App(https://github.com/facebook/create-react-app).
    The frontend was made with help from: ??????

From Beatrice:

"proxy": "http://localhost:3001" //This line suddenly stopped working for me, so I added 
                                    // src/setupProxy.js

- Ignore the Sql_functions.js file: I was trying to make a class to encapsulate
all DB interaction, but my functions would return null before the query was
completed, so then I tried using promises (await keyword) to make the program 
stop until the query finished, and maybe I could've gotten it to work with 
another hour or two, but I'm too lazy to :/

- So I'm using promises (or whatever this 'ES7 Async Await' thing is)
in server.js functions to initialize and query the database.

- I only changed package.json, src/setupProxy.js, server.js, and src/pages/rankings.js

- Your output on the rankings page should look like:

    React and Node.js Integration
    Full Message from server: [{"id":1,"name":"pizza"},{"id":2,"name":"cake"},{"id":3,"name":"salad"},{"id":4,"name":"ice cream"}]

    After for-loop processing: 1 pizza<br />2 cake<br />3 salad<br />4 ice cream<br />

    The linebreak (br) thing doesn't work as a string but let's fix that later


