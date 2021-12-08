const express = require("express");
const app = express();
const bcrypt = require('bcrypt');
const randtoken = require('rand-token');
const bodyParser = require('body-parser');
const promise = require("promise");

const cors = require("cors")({
    origin: true
});

const mysql = require('mysql');
const sendEmail = require("./utils/sendEmail");
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

app.post("/adduser", (req, res) => {
    cors(req, res, async () => {
        //PREFLIGHT CHECK
        if (req.method === "OPTIONS") {
            res.status(200).send();
        } else {
            
            let id = create_UUID();     //creation of unique uuid in format of 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
            let firstName = req.query.firstname;
            let lastName = req.query.lastname;
            let email = req.query.email;
            let password = req.query.password;

            const saltRounds = 10;
            let hashedPassword = await bcrypt.hash(password, saltRounds);

            const sqlInsert = `INSERT INTO users (id, firstname, lastname, email, password) VALUES (?,?,?,?,?)`;
            const valuesToAdd = [id, firstName, lastName, email, hashedPassword];

            connection.query(sqlInsert, valuesToAdd, (err) => {
                if(err) {
                    if (err.errno == 1062) {            //check for 1062 'ER_DUP_ENTRY' error if duplicate table entry
                        res.status(409).send({id: "Email already in use."});
                    }
                    else throw err;
                } else {
                    res.status(201).send({id: "User was added."});
                }
            })     
        }
    });
});

app.get("/login", (req, res) => {
    cors(req, res, async () => {
        //PREFLIGHT CHECK
        if (req.method === "OPTIONS") {
            res.status(200).send();
        } else {

            const email = req.query.email;
            const password = req.query.password;

            const sqlCheck = `SELECT email, password, id, firstname, lastname FROM users WHERE email = ?`;

            connection.query(sqlCheck, email, async (err, result) => {
                if (result.length == 0) {
                    res.status(401).send({id: "Email does not exist."});
                } else {
                    if (await bcrypt.compare(password, result[0].password)) {
                        res.status(200).send(result[0]);
                    } else {
                        res.status(401).send({id: "Password is incorrect."});
                    }
                    
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

app.post("/forgotpassword", (req, res) => {
    cors(req, res, () => {
        if (req.method === "OPTIONS") {
            res.status(200).send();
        } else {
            const email = req.query.email;
            const sqlCheck = `SELECT email FROM users WHERE email = ?`;

            connection.query(sqlCheck, email, async (err, result) => {
                if (result.length == 0) {
                    res.status(401).send({id: "Email does not exist."});
                } else {
                    let token = randtoken.generate(20);
                    sendEmail(email, "Reset Password Link - GameNode.Online", token);
                    let update = `UPDATE users SET token = ? WHERE email = ?`;
                    let data = [token, email];

                    connection.query(update, data, async (err, result) => {
                        if(err) throw err
                    });
                    res.status(200).send();
                }
            })
        }
    })
})

app.post("/resetpassword", (req,res) => {
    cors(req, res, async () => {
        if (req.method === "OPTIONS") {
            res.status(200).send();
        } else {
            const token = req.query.token;
            const password = req.query.password;
            const saltRounds = 10;
            let hashedPassword = await bcrypt.hash(password, saltRounds);
    
            let sqlCheck = `SELECT * from users WHERE token = ?`;
            connection.query(sqlCheck, token, async (err, result) => {
                if (result.length == 0) {
                    res.status(401).send("token does not exist.");
                } else {
                    let update = `UPDATE users SET token = ?, password = ? WHERE token = ?`;
                    let data = ["", hashedPassword, token];
                    connection.query(update, data, async(err, result) => {
                        if(err) {
                            console.log(err);
                            res.status(401).send("Unfortunate error.");
                        } else {
                            res.status(200).send("password updated successfully.")
                        }
                    })
                }
            })
    
        }
    }) 
})