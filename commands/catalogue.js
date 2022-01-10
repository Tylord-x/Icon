const ReactionHandler = require('eris-reactions');

const ownedHues = require('../models/ownedHues.js');


module.exports = {
    name: 'catalogue',
    description: "displays all of the dyes within the game",
    aliases: ["cat", "ch"],
    async execute(client, message, args, Eris) {

        ownedHues.find()
            .then(async hues => {

                if (hues != undefined && hues != null && hues.length != 0) {

                    const hueList = []

                    var pages = [];
                    let pageCount = 0;


                    for (i = 0; i < hues.length; i++) {
                        hueList.push('`' + hues[i].hueCode + '` **' + hues[i].name + '** | ' + hues[i].hexCode + '\n')

                        if (i % 10 === 0) {
                            pageCount += 1;
                            pages.push(pageCount)
                        }
                    }

                    let page = 1;

                    var randHue = Math.floor(Math.random() * hues.length)


                    const hueCatalogue = new Eris.RichEmbed()
                        .setTitle("** HUES CATALOGUE **")
                        .setDescription("**Hue Spotlighted**\n" + hues[randHue].name + " | " + hues[randHue].hexCode + "\n\n" + hueList.slice((page) * 10 - 10, (page) * 10).toString().replace(/,/g, ""))
                        .setColor("" + hues[randHue].hexCode)
                        .setFooter("" + hues.length + " hues obtained.")

                    if (pages.length > 1) {
                       
                        message.channel.createMessage({ embed: hueCatalogue })
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

                                var randHue = Math.floor(Math.random() * hues.length)

                                if (event.emoji.name === "⏪") {
                                    if (page === 1) return;
                                    page = 1;
                                    hueCatalogue.setTitle("** HUES CATALOGUE **")
                                    hueCatalogue.setDescription("**Hue Spotlighted**\n" + hues[randHue].name + " | " + hues[randHue].hexCode + "\n\n" + hueList.slice((page) * 10 - 10, (page) * 10).toString().replace(/,/g, ""))
                                    hueCatalogue.setColor("" + hues[randHue].hexCode)
                                    hueCatalogue.setFooter("" + hues.length + " hues obtained.")
                                    message.edit({ embed: hueCatalogue })

                                }

                                if (event.emoji.name === "◀️") {

                                    if (page === 1) return;
                                    page--;
                                    var randHue = Math.floor(Math.random() * hues.length)
                                    hueCatalogue.setTitle("** HUES CATALOGUE **")
                                    hueCatalogue.setDescription("**Hue Spotlighted**\n" + hues[randHue].name + " | " + hues[randHue].hexCode + "\n\n" + hueList.slice((page) * 10 - 10, (page) * 10).toString().replace(/,/g, ""))
                                    hueCatalogue.setColor("" + hues[randHue].hexCode)
                                    hueCatalogue.setFooter("" + hues.length + " hues obtained.")
                                    message.edit({ embed: hueCatalogue })
                                }

                                if (event.emoji.name === "▶️") {
                                    if (page === pages.length) return;
                                    page++;
                                    var randHue = Math.floor(Math.random() * hues.length)
                                    hueCatalogue.setTitle("** HUES CATALOGUE **")
                                    hueCatalogue.setDescription("**Hue Spotlighted**\n" + hues[randHue].name + " | " + hues[randHue].hexCode + "\n\n" + hueList.slice((page) * 10 - 10, (page) * 10).toString().replace(/,/g, ""))
                                    hueCatalogue.setColor("" + hues[randHue].hexCode)
                                    hueCatalogue.setFooter("" + hues.length + " hues obtained.")
                                    message.edit({ embed: hueCatalogue })

                                }

                                if (event.emoji.name === "⏩") {
                                    if (page === pages.length) return;
                                    page = pages.length;
                                    hueCatalogue.setTitle("** HUES CATALOGUE **")
                                    hueCatalogue.setDescription("**Hue Spotlighted**\n" + hues[randHue].name + " | " + hues[randHue].hexCode + "\n\n" + hueList.slice((page) * 10 - 10, (page) * 10).toString().replace(/,/g, ""))
                                    hueCatalogue.setColor("" + hues[randHue].hexCode)
                                    hueCatalogue.setFooter("" + hues.length + " hues obtained.")
                                    message.edit({ embed: hueCatalogue })

                                }

                            })
                        })
                    } else {
                        message.channel.createMessage({ embed: hueCatalogue })
                    }

                } else {

                    const embed = new Eris.RichEmbed()
                    embed.setDescription('No hues have been purchase yet.')
                    message.channel.createMessage({ embed: embed })

                }

            })
    }
}