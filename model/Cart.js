const mongoose = require("mongoose");




const cartSchema = new mongoose.Schema({
    productId: mongoose.Schema.Types.ObjectId,
    userId: mongoose.Schema.Types.ObjectId,
    quantity: Number,
});




module.exports = mongoose.model('Cart', cartSchema);
