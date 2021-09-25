const express = require("express");
const app = express();
//const promise = require("promise");

const cors = require("cors")({
    origin: true
});

/*
const mysql = require('mysql');
const connection = mysql.createConnection({
    // properties....
    host: 'localhost',
    user: 'sqlservice',
    password: 'LoveTheService',
    database: 'Users'
});

connection.connect( (error) => {
    if(!!error) {
        console.log('Error');
    } else {
        console.log('Connected');
    }
});
*/

app.listen(8800, () => {
    console.log(`App listening on port 8800`);
    console.log("Press Ctrl+C to quit.");
});

app.get("/hello", (req, res) => {
    cors(req, res, () => {
        //PREFLIGHT CHECK
        if (req.method === "OPTIONS") {
            res.status(200).send();
        } else {
            res.status(200).send("Hello world.");
        }
    });
});

app.get("/adduser", (req, res) => {
    cors(req, res, () => {
        //PREFLIGHT CHECK
        if (req.method === "OPTIONS") {
            res.status(200).send();
        } else {
            res.status(200).send("This is how you would add a user.");
        }
    });
});