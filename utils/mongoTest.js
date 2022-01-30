const {MongoClient} = require('mongodb');
const uri = "mongodb://173.230.152.26:27017"
const client = new MongoClient(uri);

async function runTest() {
    try {
        await client.connect();
        const database = client.db("user-data");
        const users = database.collection("userLogin")

        //const user = await users.findOne(query);

        //console.log(user);
        console.log('Connected');

    } finally {
        client.close();
    }
}

module.exports = runTest;