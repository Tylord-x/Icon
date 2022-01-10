const mongoose = require ("mongoose");

const profile = mongoose.Schema({
    userID: String,
    companyName: String,
    description: String,
    color: String,
    badges: [Object],
    specialBadges: [Object],
    brandAmbassador: Object,
    collects: String,
    numBadges: Number
})

module.exports = mongoose.model("profile", profile);