const mongoose = require ("mongoose");

const overallMags = mongoose.Schema({
    identification: String,
    generated: Number
})

module.exports = mongoose.model("overallMags", overallMags, "overallmags");