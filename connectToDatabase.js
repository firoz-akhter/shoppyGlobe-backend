const mongoose = require('mongoose');

const connectDB = async () => {
    let url = "mongodb+srv://firoz:2P4sqdnf9TGasISz@cluster0.argfh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
    try {
        await mongoose.connect(url);
        console.log('Connection successful...');
    } catch (error) {
        console.error("Failed to connect to db...", error.message);
        // process.exit(1);
    }
};



module.exports = connectDB;
