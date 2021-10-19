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
    password: '@dmin#911',
    database: 'nodejs'
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

app.post("/adduser", (req, res) => {
    cors(req, res, () => {
        //PREFLIGHT CHECK
        if (req.method === "OPTIONS") {
            res.status(200).send();
        } else {
            
            let id = create_UUID();     //creation of unique uuid in format of 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
            let firstName = req.query.firstname;
            let lastName = req.query.lastname;
            let email = req.query.email;
            let password = req.query.password;

            const sqlInsert = `INSERT INTO users (id, firstname, lastname, email, password) VALUES (?,?,?,?,?)`;
            const valuesToAdd = [id,firstName, lastName, email, password];

            connection.query(sqlInsert, valuesToAdd, (err) => {
                if(err) {
                    if (err.errno == 1062) {            //check for 1062 'ER_DUP_ENTRY' error if duplicate table entry
                        res.status(409).send("Email already in use.");
                    }
                    else throw err;
                } else {
                    res.status(200).send("User was added.");
                }
            })     
        }
    });
});

function create_UUID(){
    var dt = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (dt + Math.random()*16)%16 | 0;
        dt = Math.floor(dt/16);
        return (c=='x' ? r :(r&0x3|0x8)).toString(16);
    });
    return uuid;
}

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