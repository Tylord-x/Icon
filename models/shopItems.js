const mongoose = require ("mongoose");

//create schema
const shopItems = mongoose.Schema({
    itemName: String,
    itemPrice: Number,
    currency: String,
    dateCreated: Date
})

module.exports = mongoose.model("shopItems", shopItems, "shopitems");