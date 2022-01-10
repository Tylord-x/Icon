const mongoose = require ("mongoose");

//create schema
const userSchema = mongoose.Schema({
    name: String,
    userID: String,
    discriminator: String,
    avatar: String,
    diamonds: Number,
    opals: Number,
    daily: Number,
    inventory: [String],
    hues: [String],
    labels: [String],
    subscribedMags: [String],
    stickers: [Object],
    frames: [Object],
    cosmetics: [Object],
    dropCooldown: Number,
    claimCooldown: Number,
    tradeCooldown: Number,
    dateCreated: Date,
    dateJoined: Date,
    startedPlaying: Date,
    numCards: Number,
    numClaimed: Number,
    traded: Number,
    tradeReceived: Number,
    numBurned: Number,
    gifted: Number,
    giftsReceived: Number,
    banned: false,
    blacklisted: false,
    private: false
})

module.exports = mongoose.model("userSchema", userSchema);