const mongoose = require("mongoose");

// we will use this schema only once 
// to push product data to mongodb database

const productSchema = new mongoose.Schema({
  id: Number,
  title: String,
  description: String,
  price: Number,
  discountPercentage: Number,
  rating: Number,
  stock: Number,
  brand: String,
  category: String,
  thumbnail: String,
  images: [String],
  returnPolicy: { 
    type: String, 
    default: "30 days return policy" 
  },
  warrantyInformation: { 
    type: String, 
    default: "1-month manufacturer warranty" 
  },
});

module.exports = mongoose.model("Product", productSchema);
