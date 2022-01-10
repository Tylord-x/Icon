const mongoose = require ("mongoose");

const ownedHues = mongoose.Schema({
    name: String,
    code: String,
    hexCode: String,
    rgb: String,
    owner: [String],
    quantity: Number
})

module.exports = mongoose.model("ownedHues", ownedHues, "ownedhues");