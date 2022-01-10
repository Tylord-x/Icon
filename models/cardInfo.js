const mongoose = require ("mongoose");

const cardInfo = mongoose.Schema({
    issue: Number,
    name: String,
    group: String,
    era: String,
    mainImage: String,
    icon: String,
    generated: Date,
    numGenerated: Number,
    numClaimed: Number,
    archived: false
})

module.exports = mongoose.model("cardInfo", cardInfo);