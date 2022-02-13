const {MongoClient} = require('mongodb');
const uri = "mongodb://gamenode.online:27017"
const client = new MongoClient(uri);

async function updatePassword(email, password) {
    try {
        await client.connect();
        const database = client.db("user-data");
        const users = database.collection("userLogin")

        const filter = {"email": email};
        const updateDoc = {
            $set: {
                "password": password
            }
        }

        let response = await users.updateOne(filter, updateDoc)
        return response;
    } finally {
        client.close();
    }
}

module.exports = updatePassword;