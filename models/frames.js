const mongoose = require ("mongoose");

const frames = mongoose.Schema({
    name: String,
    image: Object,
    purchased: Number
})

module.exports = mongoose.model("frames", frames, "frames");