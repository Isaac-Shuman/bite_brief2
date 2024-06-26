<div align="center">
    <img src="https://github.com/Isaac-Shuman/bite_brief2/blob/main/bite_brief_logo.webp" width="400" height="auto">
</div>

# Welcome to BiteBrief!

**Hello, Dear User!** 🎉

Welcome to the underbelly of our wondeful project BiteBrief. I am very happy to intorduce you to our work and guide you through getting started.
First, let me tell you a bit about our project.

## Project description

BiteBrief is a web service that helps users like yourself get notified about their favourite meals on the UCLA campus and maybe more when the time comes. Not only that, but our werservice can help you expand a user's dining experience by customizing a daily meal plan for them. A user can choose their diet and allergies, after that on the Recommend Dishes page they can choose a meal period and get personalised recommendations base on their preferences. Users can also choose favorite dishes and get an email with a notification for when their favorite dish is available. On top of that we also collect data about allergies and their severities for each user and then are providing it to dining halls to make them aware of how they can modify the menu in the future to avoid triggering certain allergies. That said, we also have something fun: we choose a random user to display on the Home page and 1 fun fact that they wrote about themselves; this feature creates a sense of community among users and encourages users to often visit the home page in hopes of seeing their name!

## How to run this app

### Preparation

Now let's jump back to the serious stuff: how to make this app run on your local machine.
1. Install mySQL
2. Install node.js so that you can run "node server.js" later on
3. Make a mySQL database:
    If you're on Linux or WSL, run: usr/local/mysql/bin/mysql -u root -e "CREATE DATABASE IF 
    NOT EXISTS default_db" -p
    where -u represents the user and "default_db" the name of the database; you may name this as you please.
    If you're on Windows, you can use mySQL Workbench or a VSCode extention.
    Yyou have a lot of flexibility with where the database is located.
4. Update the initialize function server.js to your username, password, and database name.
   This is the little snippet of the code from the server.js file where you need to enter your credentials:

   const connection = await mysql.createConnection({
   
    host: "localhost",
   
    user: "---",
   
    password: "---",
   
    database: "---",
   
    ...
  });
6. Create a new email to send email notifications by:
    1. Create a new (personal) gmail account
    2. Go to your account settings by clicking on your profile icon (manage your account)
    3. Go to Security and set up 2-factor authentification
    4. Search for "app passwords" in the search bar
    5. Create a new app password and copy the generated app password
  In the email() function in server.js (~line 1210), change the user and password fields to the new email and app password respectively. Also change the sender in
        var mailOptions = {
        from: "youremail@gmail.com"
        ...
        }
  (API keys are not allowed, but please just use
      user: "bitebriefnoreply2@gmail.com",
      pass: "ttpl kwjf oiug qtcq",
  if it doesn't work)


### Running this App

1. Run "npm install" to install the dependencies for the app such as axios and express.
2. Run "node server.js" to start the backend server. If this works without throwing an error then it means you did the database part right.
3. Run "npm start" IN A SEPARATE TERMINAL to start the react app. The website should now be visible in port 3000 and should be loading in data from the server on the rankings page.
4. Google login is configured to only work on localhost and localhost:3000.

The navbar may not be fully visible if your window is not maximized.
Once you have logged in, you can navigate through the app using the navbar.

#### Worked on the Project:
Isaac Shuman, Maria Koldubaeva, Kelvin Jiang, Zihan Xia, Yue Wu, Beatrice Leung

The database backend was modeled after the examples on the mySQL2 API documentation https://sidorares.github.io/node-mysql2/docs/examples/queries/simple-queries

Google login was modeled after https://blog.logrocket.com/guide-adding-google-login-react-app/

Initial app was based on https://www.linkedin.com/pulse/connecting-reactjs-nodejs-bit-by-bit-guide-ataur-rahman/

Emails referenced https://www.w3schools.com/nodejs/nodejs_email.asp
