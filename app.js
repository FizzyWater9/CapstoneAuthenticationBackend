const express = require("express");
const app = express();
const bcrypt = require('bcrypt');
const randtoken = require('rand-token');
const bodyParser = require('body-parser');
const promise = require("promise");
var https = require('https');
var http = require('http');
var fs = require('fs');
var path = require('path');

console.log('Path of file in parent dir:', require('path').resolve(__dirname, '../app.js'))

var options = {
    key: fs.readFileSync(path.resolve(__dirname, 'gamenode.key')),
    ca: fs.readFileSync(path.resolve(__dirname, 'gamenode_online.ca-bundle')),
    cert: fs.readFileSync(path.resolve(__dirname, 'gamenode_online.crt'))
  };

const cors = require("cors")({
    origin: true
});


const sendEmail = require("./utils/sendEmail");
const runTest = require("./utils/mongoTest");
const query = require("./utils/mongoQuery");
const addUser = require("./utils/mongoAddUser");
const updatePassword = require("./utils/mongoResetPassword.js");
const e = require("express");


runTest();


/*app.listen(8800, () => {
    console.log(`App listening on port 8800`);
    console.log("Press Ctrl+C to quit.");
});*/

https.createServer(options, app).listen(8801);
http.createServer(app).listen(8800)

app.get("/getuser", (req, res) => {
    cors(req, res, async() => {
        if (req.method === "OPTIONS") {
            res.status(200).send();
        } else {
            let email = req.query.email;
            const queryInfo = {"email": email};

            if (email != undefined) {
                let data = await query(queryInfo);
                res.status(200).send(data);
            } else {
                let data = await query();
                res.status(200).send(data);
            }
            
            
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

            const queryInfo = {"email": email};

            let data = await query(queryInfo);

            if (data[0] == undefined) {
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
    cors(req, res, async () => {
        if (req.method === "OPTIONS") {
            res.status(200).send();f
        } else {
            const email = req.query.email;
            const queryInfo = {"email": email};
            let data = await query(queryInfo);

            if (data[0] == undefined) {
                res.status(401).send({id: "Email does not exist."});
            } else {
                sendEmail(email, "Reset Password Link - GameNode.Online");
                res.status(200).send({id: "Email was found.  Password link sent."})
            }
        }
    })
})

app.post("/resetpassword", (req,res) => {
    cors(req, res, async () => {
        if (req.method === "OPTIONS") {
            res.status(200).send();
        } else {
            const email = req.query.email;
            const password = req.query.password;
            const saltRounds = 10;
            let hashedPassword = await bcrypt.hash(password, saltRounds);
    
            let data = await updatePassword(email, hashedPassword);
            if (data.acknowledged == true) {
                res.status(200).send("Updated password succesfully!")
            }
    
        }
    }) 
})