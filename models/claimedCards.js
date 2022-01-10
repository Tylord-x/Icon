const mongoose = require ("mongoose");

const claimedCards = mongoose.Schema({
    code: String,
    issue: Number,
    name: String,
    group: String,
    era: String,
    mainImage: String,
    icon: String,
    generated: Date,
    claimed: Date,
    condition: Number,
    nameCondition: String, 
    stars: String,
    worth: Number,
    timesTraded: Number,
    timesGifted: Number,
    timesBurned: Number,
    timesUpgraded: Number,
    owner: [String],
    labels: [String],
    stickers: [Object],
    frame: Object,
    cosmetics: [Object],
    hues: [Object],
    bottomHueBar: [String],
    topHueBar: [String],
    traded: false,
    gifted: false,
    burned: false,
    upgraded: false,
    hueApplied: false
})

module.exports = mongoose.model("claimedCards", claimedCards, "claimedcards");