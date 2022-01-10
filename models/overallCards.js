const mongoose = require ("mongoose");

const overallCards = mongoose.Schema({
    identifier: String,
    code: Number,
    generated: Number,
    claimed: Number
})

module.exports = mongoose.model("overallCards", overallCards);