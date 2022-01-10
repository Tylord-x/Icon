const mongoose = require ("mongoose");

//create schema
const itemList = mongoose.Schema({
    itemName: String,
    itemPrice: Number,
    currency: String,
    dateCreated: Date
})

module.exports = mongoose.model("itemList", itemList);