const cardInfo = require('./models/cardInfo.js');
const mongoose = require ("mongoose");

var cardCode = 1;

function generatingCardCode() {
    return cardCode++;
}

module.exports.generatedCode = generatingCardCode;


