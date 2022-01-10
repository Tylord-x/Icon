const mongoose = require ("mongoose");

const magazine = mongoose.Schema({
    name: String,
    description: String,
    color: String,
    creator: String,
    creatorName: String,
    creatorDiscrim: String,
    cards: [String],
    subscribers: [String],
    subbed: Number
})

module.exports = mongoose.model("magazine", magazine);