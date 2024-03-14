BiteBrief.js







































TO RUN THIS APP:
Install mySQL
Install node.js so that you can run "node server.js" later on
Go into the bite_brief2 directory you pulled from github.
Make a mySQL database:
    Install mySQL
    If you're on Linux or WSL, run: usr/local/mysql/bin/mysql -u root -e "CREATE DATABASE IF NOT EXISTS default_db" -p
    If you're on Windows, I used mySQL Workbench to make my database.
    It seems like you have a lot of flexibility with where the database is located.
Update the initialize function server.js to your username (it's probably still root), password, and database name.

RUNNING THIS APP:
Run "npm install" to install the dependencies for the app such as axios and express.
Run "node server.js" to start the backend server. If this works without throwing an error then it means you did the database part right.
Run "npm start" IN A SEPARATE TERMINAL to start the react app. The website should now be visible in port 3000 and should be loading in data from the server on the rankings page.
The navbar may not be fully visible if your window is not maximized.



Attribution info:
    This project was bootstrapped with Create React App(https://github.com/facebook/create-react-app).
    The database backend was modeled after the examples on the mySQL2 API documentation https://sidorares.github.io/node-mysql2/docs/examples/queries/simple-queries
    The frontend was made with help from: ??????




