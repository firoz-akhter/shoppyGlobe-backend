const mongoose = require("mongoose")



let userSchema = new mongoose.Schema({
    username: String,
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
})


module.exports = mongoose.model("User", userSchema);