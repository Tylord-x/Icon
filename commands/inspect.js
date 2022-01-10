require('pluris');

const mongoose = require("mongoose");
const Eris = require("eris");

//Models
const Data = require('../models/user.js');

const { stripIndents } = require("common-tags")


module.exports = {
    name: 'inspect',
    description: "displays the players's information",
    async execute(client, message, args, Eris) {

        if (message.member.id == "641811094918397963" || message.member.id == "729810040395137125" || message.member.id == "665806267020738562" || message.member.roles.includes("873296833672273971") || message.member.roles.includes("873304692002795530") && message.member.roles.includes("873296580281774092")
            || message.member.roles.includes("873458618597539880") || message.member.roles.includes("873302321826758707")) {
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
                                    .setDescription(`${user.username} has not been found in the Icon player base. Think they should play? Ask them to join!`)
                                    .setThumbnail(user.avatarURL)
                                message.channel.createMessage({ embed: userInfo });

                            } else {


                                if (data.userID == user.id) {
                                    let tag = `${user.username}#${user.discriminator}`;
                                    let id = user.id;
                                    //let status = member.status;
                                    let createdDate = new Date(user.createdAt).toUTCString();
                                    let joinedDate = new Date(user.joinedAt).toUTCString();
                                    let avatar = user.avatarURL;

                                    const Inspect = new Eris.RichEmbed()
                                        .setColor(0x33A7FF)
                                        .setAuthor(`Inspect | ${id}`, avatar, avatar)
                                        .setThumbnail(avatar)
                                        .addField("Information", stripIndents`
                                    ${tag}
                                    **Created At:** ${createdDate}
                                    **Started playing:** ${data.startedPlaying}
                                    **Joined At:** ${joinedDate}

                                    **Cards:** ${data.numCards}
                                    **Claimed Cards:** ${data.numClaimed}

                                    **Opals:** ${data.opals}
                                    **Diamonds:** ${data.diamonds}
                                    **Burned:** ${data.numBurned}

                                    **Sent:**
                                    **Gifted:** ${data.gifted}
                                    **Traded:** ${data.traded}

                                    **Received:**
                                    **Gifted:** ${data.giftsReceived}
                                    **Traded:** ${data.tradeReceived}
                                    `)
                                    message.channel.createMessage({ embed: Inspect });

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
                            .setDescription(`${user.username} has not been found in the Icon player base. Think they should join? Ask them to collect cards!`)
                            .setThumbnail(user.avatarURL)
                        message.channel.createMessage({ embed: userInfo });


                    } else {

                        if (user.id == data.userID) {
                            let tag = `${user.username}#${user.discriminator}`;
                            let id = user.id;
                            //let status = member.status;
                            let createdDate = new Date(user.createdAt).toUTCString();
                            let joinedDate = new Date(user.joinedAt).toUTCString();
                            let avatar = user.avatarURL;

                            const Inspect = new Eris.RichEmbed()
                                .setColor(0x33A7FF)
                                .setAuthor(`Inspect | ${id}`, avatar, avatar)
                                .setThumbnail(avatar)
                                .addField("Information", stripIndents`
                            ${tag}
                            **Created At:** ${createdDate}
                            **Started playing:** ${data.startedPlaying}
                            **Joined At:** ${data.dateJoined}

                            **Cards:** ${data.numCards}
                            **Claimed Cards:** ${data.numClaimed}

                            **Opals:** ${data.opals}
                            **Diamonds:** ${data.diamonds}
                            **Burned:** ${data.numBurned}

                            **Sent:**
                            **Gifted:** ${data.gifted}
                            **Traded:** ${data.traded}

                            **Received:**
                            **Gifted:** ${data.giftsReceived}
                            **Traded:** ${data.tradeReceived}
                            `)
                            message.channel.createMessage({ embed: Inspect });

                        }
                    }

                })

            }
        }

    }
}