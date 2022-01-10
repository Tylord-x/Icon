require('pluris');

const mongoose = require("mongoose");
const Eris = require("eris");

//Models
const Data = require('../models/user.js');


module.exports = {

    name: 'join',
    description: "allows the player to join the bot",
    async execute(client, message, args, Eris) {
       
        Data.findOne({
            userID: message.member.user.id
        }, (err, data) => {
            if(err) console.log(err);

            if(!data) {
                const newData = new Data({
                    name: message.member.username,
                    userID: message.member.user.id,
                    diamonds: 0,
                    opals: 0,
                    daily: 0,
                    inventory: [],
                    hues: [],
                    labels: [],
                    magazines: [],
                    subscribedMags: [],
                    dropCooldown: 0,
                    claimCooldown: 0,
                    tradeCooldown: 0,
                    dateCreated: message.member.createdAt,
                    dateJoined: message.member.joinedAt,
                    startedPlaying: Date.now(),
                    numCards: 0,
                    numClaimed: 0,
                    traded: 0,
                    tradeReceived: 0,
                    numBurned: 0,
                    gifted: 0,
                    giftsReceived: 0,
                    banned: false,
                    blacklisted: false             
                })
                newData.save().catch(err => console.log(err));
                let userName = message.member.username.toUpperCase()


                const userInfo = new Eris.RichEmbed()
                .setColor(0x33A7FF)
                .setTitle( `**WELCOME TO ICON** ` + userName)
                .setDescription(`We hope you enjoy collecting your favorite artists and starting your own magazine!`)
                .setThumbnail(message.member.user.avatarURL)
                message.channel.createMessage({embed: userInfo});

            } else {

                if(data.userID == message.member.user.id) {


                const userInfo = new Eris.RichEmbed()
                .setColor(0x33A7FF)
                .setTitle( `Oops! You already joined Icon.`)
                .setDescription(`You are currently in our player base.`)
                .setThumbnail(message.member.user.avatarURL)
                message.channel.createMessage({embed: userInfo});

                }     

            }

        })

    }
}