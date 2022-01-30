const express = require("express");
const app = express();
const bcrypt = require('bcrypt');
const randtoken = require('rand-token');
const bodyParser = require('body-parser');
const promise = require("promise");

const cors = require("cors")({
    origin: true
});


const sendEmail = require("./utils/sendEmail");
const runTest = require("./utils/mongoTest");
const query = require("./utils/mongoQuery");
const addUser = require("./utils/mongoAddUser");


runTest();


app.listen(8800, () => {
    console.log(`App listening on port 8800`);
    console.log("Press Ctrl+C to quit.");
});

app.get("/getuser", (req, res) => {
    cors(req, res, async() => {
        if (req.method === "OPTIONS") {
            res.status(200).send();
        } else {
            let data = await query();
            res.status(200).send(data);
        }
    })
})

app.post("/adduser", (req, res) => {
    cors(req, res, async () => {
        //PREFLIGHT CHECK
        if (req.method === "OPTIONS") {
            res.status(200).send();
        } else {
            
            let firstName = req.query.firstname;
            let lastName = req.query.lastname;
            let email = req.query.email;
            let password = req.query.password;

            const saltRounds = 10;
            let hashedPassword = await bcrypt.hash(password, saltRounds);

            let user = {firstName: firstName, lastName, lastName, email: email, password: hashedPassword};

            let response = await addUser(user);
            res.status(200).send(response);
     
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

            const queryInfo = {email: email}

            let data = await query(queryInfo);

            if (data[0] == {}) {
                res.status(401).send({id: "Email does not exist."})
            } else {
                if (await bcrypt.compare(password, data[0].password)) {
                    res.status(200).send(data[0]);
                } else {
                    res.status(401).send({id: "Password is incorrect."});
                }
            }
        }
    });
});

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