const mongoose = require ("mongoose");

const teamCards = mongoose.Schema({
    code: String,
    issue: Number,
    name: String,
    role: String,
    mainImage: String,
    icon: String,
    generated: Date,
    claimed: Date,
    condition: Number,
    numCondition: Number, 
    nameCondition: String, 
    stars: String,
    worth: Number,
    timesTraded: Number,
    timesGifted: Number,
    timesBurned: Number,
    owner: [String],
    labels: [String],
    stickers: [Object],
    frames: [Object],
    cosmetics: [Object],
    bottomHueBar: [String],
    topHueBar: [String],
    traded: false,
    gifted: false,
    burned: false,
    upgraded: false,
    hueApplied: false
})

module.exports = mongoose.model("teamCards", teamCards, "teamcards");