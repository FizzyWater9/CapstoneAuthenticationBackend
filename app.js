const express = require("express");
const app = express();
//const promise = require("promise");

const cors = require("cors")({
    origin: true
});

const mysql = require('mysql');
const connection = mysql.createConnection({
    // properties....
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'users'
});

connection.connect( (error) => {
    if(!!error) {
        console.log('Error');
        console.log(error);
    } else {
        console.log('Connected');
    }
});


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
            
            let firstName = req.query.firstname;
            let lastName = req.query.lastname;

            const sqlInsert = `INSERT INTO users (firstname, lastname) VALUES (?,?)`;
            const valuesToAdd = [firstName, lastName];

            connection.query(sqlInsert, valuesToAdd, (err) => {
                if(err) {
                    throw err;
                } else {
                    res.status(200).send("User was added.");
                }
            })
            
        }
    });
});

app.get("/getuser", (req, res) => {
    cors(req, res, () => {
        if (req.method === "OPTIONS") {
            res.status(200).send();
        } else {
            connection.query("SELECT * FROM users", (err, result) => {
                if (err) {
                    throw err;
                } else {
                    res.status(200).send(result);
                }
            })
        }
    })
})