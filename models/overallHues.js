const mongoose = require ("mongoose");

const overallHues = mongoose.Schema({
    identifier: String,
    code: Number,
    generated: Number,
    owned: Number
})

module.exports = mongoose.model("overallHues", overallHues);