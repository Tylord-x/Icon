const mongoose = require ("mongoose");

const hueInfo = mongoose.Schema({
    name: String,
    hexCode: String,
    rgb: String
})

module.exports = mongoose.model("hueInfo", hueInfo);