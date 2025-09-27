const mongoose = require("mongoose");

const URI = process.env.MONGODB_URI; // Connection String

const connectDB = async ()=>{
    try{
        await mongoose.connect(URI);
        console.log("Connections Successful to DB");
    }
    catch(errors){
        console.log("Database Connection Failed");
        process.exit(0);
    }
}

module.exports = connectDB;

