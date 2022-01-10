const claimedCards = require('../models/claimedCards.js');
const user = require('../models/user.js');
const cardInfo = require('../models/cardInfo.js');
const genCards = require('../models/overallCards.js');
const genHues = require('../models/overallHues.js');
const hueInfo = require('../models/hueInfo.js');
const ownedHues = require('../models/ownedHues.js');
const hueBundle = require('../models/hueBundle.js');
const shopList = require('../models/shopItems.js');
const profile = require('../models/profile.js');
const magazines = require('../models/magazine.js');
const genMags = require('../models/overallMags.js');
const teamCards = require('../models/teamCards.js');
const frames = require('../models/frames.js');


const mongoose = require ("mongoose");


module.exports = {
    name: 'reset',
    description: "resets the database",
    aliases: [],
    async execute(client, message, args, Eris) {

        if(message.member.roles.includes("873295232668688406")) {
       
        await claimedCards.deleteMany({});
        await user.deleteMany({});
        await cardInfo.deleteMany({});
        await genCards.deleteMany({});
        await ownedHues.deleteMany({});
        await hueInfo.deleteMany({});
        await genHues.deleteMany({});
        await hueBundle.deleteMany({});
        await shopList.deleteMany({});
        await profile.deleteMany({});
        await genMags.deleteMany({});
        await magazines.deleteMany({});
        await teamCards.deleteMany({});
        await frames.deleteMany({});

        message.channel.createMessage("The database has been reset.")

        } else {
            message.channel.createMessage("You do not have permission to use this command.")
        }

    }
}