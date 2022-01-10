const ReactionHandler = require('eris-reactions');

const user = require('../models/user.js');


module.exports = {
    name: 'bannedUsers',
    description: "displays all of the banned users",
    aliases: ["bannedusers", "bannedlist", "balist", "banlist", "banned"],
    async execute(client, message, args, Eris) {

        if (message.member.id == "729810040395137125" || message.member.id == "665806267020738562"
            || (message.member.roles.includes("873296833672273971") || (message.member.roles.includes("873304692002795530")))) {

            const bannedUsers = await user.find({ banned: true })
            if (bannedUsers.length != 0) {

                const member = message.member.user;
                const bannedList = []
                var checkUserCount = "";
                var tenseSwitch = "";
                var pages = [];
                let pageCount = 0;

                for (i = 0; i < bannedUsers.length; i++) {
                    bannedList.push("" + i + ". " + bannedUsers[i].name + " | " + bannedUsers[i].userID)

                    if (i % 15 === 0) {
                        pageCount += 1;
                        pages.push(pageCount)
                    }
                }

                if (bannedList.length == 1) {
                    checkUserCount += "player"
                    tenseSwitch += "is"
                } else {
                    checkUserCount += "players"
                    tenseSwitch += "are"
                }

                let page = 1;
                const banned = new Eris.RichEmbed()
                    .setTitle("")
                    .setDescription("**Users Currently Banned**\n" + bannedList.slice((page) * 10 - 10, (page) * 10).toString().replace(/,/g, ""))
                    .setColor("#33A7FF")
                    .setFooter(`${member.username}#${member.discriminator} | ` + bannedList.length + " " + checkUserCount + " banned", member.avatarURL, member.avatarURL)
                if (pages.length > 1) {
                    message.channel.createMessage({ embed: banned })
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
                                banned.setTitle("")
                                banned.setDescription("**Users Currently Banned**\n" + bannedList.slice((page) * 10 - 10, (page) * 10).toString().replace(/,/g, ""))
                                banned.setColor("#33A7FF")
                                banned.setFooter(`${member.username}#${member.discriminator} | ` + bannedList.length + " " + checkUserCount + " banned", member.avatarURL, member.avatarURL)
                                message.edit({ embed: banned })

                            }

                            if (event.emoji.name === "◀️") {
                                if (page === 1) return;
                                page--;
                                banned.setTitle("")
                                banned.setDescription("**Users Currently Banned**\n" + bannedList.slice((page) * 10 - 10, (page) * 10).toString().replace(/,/g, ""))
                                banned.setColor("#33A7FF")
                                banned.setFooter(`${member.username}#${member.discriminator} | ` + bannedList.length + " " + checkUserCount + " banned", member.avatarURL, member.avatarURL)
                                message.edit({ embed: banned })
                            }

                            if (event.emoji.name === "▶️") {
                                if (page === pages.length) return;
                                page++;
                                var randHue = Math.floor(Math.random() * hues.length)
                                banned.setTitle("** BANNED USERS **")
                                banned.setDescription("**Users Currently Banned**\n" + bannedList.slice((page) * 10 - 10, (page) * 10).toString().replace(/,/g, ""))
                                banned.setColor("#33A7FF")
                                banned.setFooter(`${member.username}#${member.discriminator} | ` + bannedList.length + " " + checkUserCount + " banned", member.avatarURL, member.avatarURL)
                                message.edit({ embed: banned })

                            }

                            if (event.emoji.name === "⏩") {
                                if (page === pages.length) return;
                                page = pages.length;
                                banned.setTitle("")
                                banned.setDescription("**Users Currently Banned**\n" + bannedList.slice((page) * 10 - 10, (page) * 10).toString().replace(/,/g, ""))
                                banned.setColor("#33A7FF")
                                banned.setFooter(`${member.username}#${member.discriminator} | ` + bannedList.length + " " + checkUserCount + " banned", member.avatarURL, member.avatarURL)
                                message.edit({ embed: banned })

                            }

                        })
                    })
                } else {
                    message.channel.createMessage({ embed: banned })
                }
            } else {
                const banned = new Eris.RichEmbed()
                    .setTitle("")
                    .setDescription("<:exclaim:906289233814241290> There are currently no players banned from Icon")
                    .setColor("#9370DB")
                message.channel.createMessage({ embed: banned })
            }

        }
    }

}