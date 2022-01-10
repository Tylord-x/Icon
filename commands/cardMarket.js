/*---------------------------------------LOADING IN THE PACKAGES---------------------------------------*/

// MODELS: Gets the necessary data models from the database to complete the hue process

const user = require('../models/user.js');
const claimedCards = require('../models/claimedCards.js')


// EMBED REACTION HANDLER: Allows the player to interact with the embeds
const ReactionHandler = require('eris-reactions');

/*---------------------------------CARD MARKET COMMAND: BEGINNING THE CARD MARKET PROCESS----------------------*/

module.exports = {
    name: 'cardmarket',
    description: "Allows players to purchase cards greater than 100 issue",
    aliases: ["market", "cardmarket", "cm"],
    async execute(client, message, args, Eris) {

        const player = message.member.user
        const cards = await claimedCards.find({ burned: true })

        const chosenCards = []
        for (i = 0; i < cards.length; i++) {
            if (cards[i].issue >= 100) {
                chosenCards.push(cards[i])
            }
        }

        if (chosenCards.length != 0) {
            var pageCount = 0
            var page = 1
            const pages = []
            const cardsList = []
            for (i = 0; i < chosenCards.length; i++) {
                cardsList.push('`' + chosenCards[i].code + '` **#' + chosenCards[i].issue + ' ' + chosenCards[i].group + ' ' + chosenCards[i].name + '**\n∷  ' + chosenCards[i].era + '\n' + chosenCards[i].stars + "\n" + chosenCards[i].worth * .70 + " Opals\n`buy " + chosenCards[i].code + "`\n\n")

                if (i % 5 == 0) {
                    pageCount += 1;
                    pages.push(pageCount)
                }
            }

            if (cardsList.length < 5) {
                const embed = new Eris.RichEmbed()
                    .setTitle("**PRISMATIC CARDS**")
                    .setDescription("As the main, official marketplace for buyable cards, the **Prismatic Cards** shop offers the unique opportunity to build up or complete collections by purchasing cards. Use `buy` to obtain a card by paying its designated price in opals.\n\n" + cardsList.slice((page) * 4 - 4, (page) * 4).toString().replace(/,/g, ""))
                    .setColor("#9370DB")
                    .setImage("https://i.imgur.com/qByUv5x.png")
                    .setFooter(`${player.username}#${player.discriminator} | Viewing Card Market`, player.avatarURL, player.avatarURL)
                message.channel.createMessage({ embed: embed })
            } else if (cardsList.length >= 5) {
                const embed = new Eris.RichEmbed()
                    .setTitle("**PRISMATIC CARDS**")
                    .setDescription("As the main, official marketplace for buyable cards, the **Prismatic Cards** shop offers the unique opportunity to build up or complete collections by purchasing cards. Use `buy` to obtain a card by paying its designated price in opals.\n\n" + cardsList.slice((page) * 4 - 4, (page) * 4).toString().replace(/,/g, ""))
                    .setColor("#9370DB")
                    .setImage("https://i.imgur.com/qByUv5x.png")
                    .setFooter(`${player.username}#${player.discriminator} | Viewing Card Market`, player.avatarURL, player.avatarURL)
                message.channel.createMessage({ embed: embed })
                    .then(function (message) {
                        message.addReaction('⏪');
                        message.addReaction('◀️');
                        message.addReaction('▶️')
                        message.addReaction('⏩');


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
                                embed.setTitle("**PRISMATIC CARDS**")
                                embed.setDescription("*Marketplace for Buyable Cards*\n\n" + cardsList.slice((page) * 4 - 4, (page) * 4).toString().replace(/,/g, ""))
                                embed.setColor("#9370DB")
                                embed.setFooter(`${player.username}#${player.discriminator} | Viewing Card Market`, player.avatarURL, player.avatarURL)
                                message.edit({ embed: embed })

                            }

                            if (event.emoji.name === "◀️") {

                                if (page === 1) return;
                                page--;
                                embed.setTitle("**PRISMATIC CARDS**")
                                embed.setDescription("*Marketplace for Buyable Cards*\n\n" + cardsList.slice((page) * 4 - 4, (page) * 4).toString().replace(/,/g, ""))
                                embed.setColor("#9370DB")
                                embed.setFooter(`${player.username}#${player.discriminator} | Viewing Card Market`, player.avatarURL, player.avatarURL)
                                message.edit({ embed: embed })
                            }

                            if (event.emoji.name === "▶️") {
                                if (page === pages.length) return;
                                page++;
                                embed.setTitle("**PRISMATIC CARDS**")
                                embed.setDescription("*Marketplace for Buyable Cards*\n\n" + cardsList.slice((page) * 4 - 4, (page) * 4).toString().replace(/,/g, ""))
                                embed.setColor("#9370DB")
                                embed.setFooter(`${player.username}#${player.discriminator} | Viewing Card Market`, player.avatarURL, player.avatarURL)
                                message.edit({ embed: embed })

                            }

                            if (event.emoji.name === "⏩") {
                                if (page === pages.length) return;
                                page = pages.length;
                                embed.setTitle("**PRISMATIC CARDS**")
                                embed.setDescription("*Marketplace for Buyable Cards*\n\n" + cardsList.slice((page) * 4 - 4, (page) * 4).toString().replace(/,/g, ""))
                                embed.setColor("#9370DB")
                                embed.setFooter(`${player.username}#${player.discriminator} | Viewing Card Market`, player.avatarURL, player.avatarURL)
                                message.edit({ embed: embed })

                            }
                        })
                    })
            }

        } else {
            const embed = new Eris.RichEmbed()
            embed.setTitle("**PRISMATIC CARDS**")
            embed.setDescription("As the main, official marketplace for buyable cards, the **Prismatic Cards** shop offers the unique opportunity to build up or complete collections by purchasing cards. Use `buy` to obtain a card by paying its designated price in opals.\n\nThere are currently no cards available in the market at this time. Check back later.")
            embed.setColor("#9370DB")
            embed.setFooter(`${player.username}#${player.discriminator} | Viewing Card Market`, player.avatarURL, player.avatarURL)
            embed.setImage("https://i.imgur.com/qByUv5x.png")
            message.channel.createMessage({ embed: embed })

        }
    }

}
