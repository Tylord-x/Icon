const mongoose = require ("mongoose");

const stickers = mongoose.Schema({
    name: String,
    image: Object,
    purchased: Number
})

module.exports = mongoose.model("stickers", stickers, "stickers");