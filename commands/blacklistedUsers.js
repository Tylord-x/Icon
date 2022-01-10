const ReactionHandler = require('eris-reactions');

const user = require('../models/user.js');

module.exports = {
    name: 'blacklistedUsers',
    description: "displays all of the blacklisted users",
    aliases: ["blacklisted"],
    async execute(client, message, args, Eris) {

        if (message.member.id == "729810040395137125" || message.member.id == "665806267020738562"
            || (message.member.roles.includes("873296833672273971") || (message.member.roles.includes("873304692002795530")))) {

            const blacklistedUsers = await user.find({ blacklisted: true })
            if (blacklistedUsers.length != 0) {

                const member = message.member.user;
                const blacklistedList = []
                var checkUserCount = "";
                var tenseSwitch = "";
                var pages = [];
                let pageCount = 0;

                for (i = 0; i < blacklistedUsers.length; i++) {
                    blacklistedUsers.push("" + i + ". " + blacklistedUsers[i].name + " | " + blacklistedUsers[i].userID)

                    if (i % 15 === 0) {
                        pageCount += 1;
                        pages.push(pageCount)
                    }
                }

                if (blacklistedList.length == 1) {
                    checkUserCount += "player"
                    tenseSwitch += "is"
                } else {
                    checkUserCount += "players"
                    tenseSwitch += "are"
                }

                let page = 1;
                const blacklisted = new Eris.RichEmbed()
                    .setTitle("")
                    .setDescription("**Users Currently Blacklisted**\n" + blacklistedList.slice((page) * 10 - 10, (page) * 10).toString().replace(/,/g, ""))
                    .setColor("#33A7FF")
                    .setFooter(`${member.username}#${member.discriminator} | ` + blacklistedList.length + " " + checkUserCount + " blacklisted", member.avatarURL, member.avatarURL)
                if (pages.length > 1) {
                    message.channel.createMessage({ embed: blacklisted })
                        .then(function (message) {
                            message.addReaction('⏪');
                            message.addReaction('◀️');
                            message.addReaction('▶️')
                            message.addReaction('⏩');
                        })

                    client.once('messageCreate', async (message) => {

                        // This will continuously listen for 100 incoming reactions over the course of 15 minutes
                        const reactionListener = new ReactionHandler.continuousReactionStream(
                            message,
                            (userID) => userID != message.author.id,
                            false,
                            { max: 100, time: 60000 }
                        );

                        reactionListener.on('reacted', (event) => {

                            if (event.emoji.name === "⏪") {
                                if (page === 1) return;
                                page = 1;
                                blacklisted.setTitle("")
                                blacklisted.setDescription("**Users Currently Blacklisted**\n" + blacklistedList.slice((page) * 10 - 10, (page) * 10).toString().replace(/,/g, ""))
                                blacklisted.setColor("#33A7FF")
                                blacklisted.setFooter(`${member.username}#${member.discriminator} | ` + blacklistedList.length + " " + checkUserCount + " blacklisted", member.avatarURL, member.avatarURL)
                                message.edit({ embed: blacklisted })

                            }

                            if (event.emoji.name === "◀️") {
                                if (page === 1) return;
                                page--;
                                blacklisted.setTitle("")
                                blacklisted.setDescription("**Users Currently Blacklisted**\n" + blacklistedList.slice((page) * 10 - 10, (page) * 10).toString().replace(/,/g, ""))
                                blacklisted.setColor("#33A7FF")
                                blacklisted.setFooter(`${member.username}#${member.discriminator} | ` + blacklistedList.length + " " + checkUserCount + " blacklisted", member.avatarURL, member.avatarURL)
                                message.edit({ embed: blacklisted })
                            }

                            if (event.emoji.name === "▶️") {
                                if (page === pages.length) return;
                                page++;
                                blacklisted.setTitle("")
                                blacklisted.setDescription("**Users Currently Blacklisted**\n" + blacklistedList.slice((page) * 10 - 10, (page) * 10).toString().replace(/,/g, ""))
                                blacklisted.setColor("#33A7FF")
                                blacklisted.setFooter(`${member.username}#${member.discriminator} | ` + blacklistedList.length + " " + checkUserCount + " blacklisted", member.avatarURL, member.avatarURL)
                                message.edit({ embed: blacklisted })

                            }

                            if (event.emoji.name === "⏩") {
                                if (page === pages.length) return;
                                page = pages.length;
                                blacklisted.setTitle("")
                                blacklisted.setDescription("**Users Currently Blacklisted**\n" + blacklistedList.slice((page) * 10 - 10, (page) * 10).toString().replace(/,/g, ""))
                                blacklisted.setColor("#33A7FF")
                                blacklisted.setFooter(`${member.username}#${member.discriminator} | ` + blacklistedList.length + " " + checkUserCount + " blacklisted", member.avatarURL, member.avatarURL)
                                message.edit({ embed: blacklisted })

                            }

                        })
                    })
                } else {
                    message.channel.createMessage({ embed: blacklisted })
                }
            } else {
                const blacklisted = new Eris.RichEmbed()
                    .setTitle("")
                    .setDescription("<:exclaim:906289233814241290> There are currently no players blacklisted from Icon")
                    .setColor("#9370DB")
                message.channel.createMessage({ embed: blacklisted })
            }

        }
    }

}