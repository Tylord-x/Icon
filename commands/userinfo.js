require('pluris');

const mongoose = require("mongoose");
const Eris = require("eris");

//Models
const Data = require('../models/user.js');

module.exports = {
    name: 'userinfo',
    description: "displays the players's information",
    aliases: ['ui'],
    async execute(client, message, args, Eris) {


        let { guild } = message;

        let user;

        if (args[0] && message.mentions.length < 1) {
            guild.fetchMembers()
                .then(member => {
                    let user;
                    for (i = 0; i < member.length; i++) {
                        if (member[i].id == args[0]) {
                            user = member[i]
                        }

                    }

                    Data.findOne({
                        userID: user.id
                    }, (err, data) => {
                        if (err) console.log(err);

                        if (!data) {
                            const userInfo = new Eris.RichEmbed()
                                .setColor(0x33A7FF)
                                .setTitle(`SPOTLIGHT: ${user.username}`)
                                .setDescription(`${user.username} has not been found in the icon player base. Think they should play? Ask them to join!`)
                                .setThumbnail(user.avatarURL)
                            message.channel.createMessage({ embed: userInfo });

                        } else {


                            if (data.userID == user.id) {
                                const userInfo = new Eris.RichEmbed()
                                    .setColor(0x33A7FF)
                                    .setTitle(`SPOTLIGHT ↷ ${data.name}`)
                                    .setDescription(`A brief look into ${data.name}'s time using icon.`)
                                    .addField(`Name`, "" + data.name)
                                    .addField(`Started playing`, "" + data.startedPlaying)
                                    .addField(`Number of cards`, "" + data.numCards)
                                    .addField(`Opals:`, "" + data.opals)
                                    .addField(`Diamonds:`, "" + data.diamonds)
                                    .setThumbnail(user.avatarURL)
                                message.channel.createMessage({ embed: userInfo });

                            }
                        }

                    })


                })

        } else {

            if (message.mentions.length >= 1) {
                user = message.channel.guild.members.get(message.mentions[0].id).user;
            } else if (args < 1) {
                user = message.member.user;
            }

            Data.findOne({
                userID: user.id
            }, (err, data) => {
                if (err) console.log(err);

                if (!data) {
  
                    const userInfo = new Eris.RichEmbed()
                        .setColor(0x33A7FF)
                        .setTitle(`SPOTLIGHT: ${user.username}`)
                        .setDescription(`${user.username} has not been found in the icon player base. Think they should join? Ask them to collect cards!`)
                        .setThumbnail(user.avatarURL)
                    message.channel.createMessage({ embed: userInfo });


                } else {

                    if (user.id == data.userID) {
                        const userInfo = new Eris.RichEmbed()
                            .setColor(0x33A7FF)
                            .setTitle(`SPOTLIGHT ∷ ${data.name}`)
                            .setDescription(`A brief look into ${data.name}#${message.member.discriminator}'s time using icon.`)
                            .addField(`Name`, "" + data.name)
                            .addField(`Started playing`, "" + data.startedPlaying)
                            .addField(`Number of cards`, "" + data.numCards)
                            .addField(`Opals:`, "" + data.opals)
                            .addField(`Diamonds:`, "" + data.diamonds)
                            .setThumbnail(user.avatarURL)
                        message.channel.createMessage({ embed: userInfo });
                    }
                }

            })

        }
    }

}