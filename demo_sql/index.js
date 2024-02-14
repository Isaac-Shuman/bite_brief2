// import React, { StrictMode } from "react";
// import { createRoot } from "react-dom/client";

// import db from "./sqltest.js";

const db     = require('./sqltest.js');

db.query('SHOW TABLES;', function (error, results, fields){
        console.log(results);
    });
db.end();



//react-scripts -> config -> webpack.config.js

// const root = createRoot(document.getElementById("root"));

// root.render(
//   <StrictMode>
//     <App />
//   </StrictMode>
// );
