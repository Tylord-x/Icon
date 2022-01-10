const mongoose = require ("mongoose");

const hueBundle = mongoose.Schema({
    bundleName: String,
    names: [String],
    hexCodes: [String],
    rgb: [String]
})

module.exports = mongoose.model("hueBundle", hueBundle);