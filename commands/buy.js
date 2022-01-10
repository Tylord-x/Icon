/*---------------------------------------LOADING IN THE PACKAGES-----------------------------------*/

const user = require('../models/user.js');
const claimedCards = require('../models/claimedCards.js');

const ReactionHandler = require('eris-reactions');

/*-------------------------------------BUY COMMAND: BEGINNING BUY PROCESS------------------------*/
module.exports = {
    name: 'buy',
    description: "Allows users to purchase cards",
    aliases: ["buy"],
    async execute(client, message, args, Eris) {

        const buyer = message.member.user
        const buyerReaction = []
        const player = await user.findOne({ userID: buyer.id })
        const content = args

        if (content.length >= 1) {
            const cards = await claimedCards.findOne({ code: content[0] })
            if (cards != undefined && cards != null) {
                const cardWorth = cards.worth * .70

                if (cards.burned && cards.issue >= 100) {
                    const purchasingCard = new Eris.RichEmbed()
                        .setTitle("")
                        .setDescription("**Purchase Card?**\n`" + cards.code + "` " + cards.stars + "**#" + cards.issue + " " + cards.group + " " + cards.name + "**\nfor **" + cardWorth + "** <:opal:899430579831988275>")
                        .setColor("#9370DB")
                        .setFooter(`${buyer.username}#${buyer.discriminator} | Buying Card`, buyer.avatarURL, buyer.avatarURL)
                    message.channel.createMessage({ embed: purchasingCard })
                        .then(function (message) {
                            message.addReaction('💳');
                            message.addReaction('❌');

                            const reactionListener = new ReactionHandler.continuousReactionStream(
                                message,
                                (userID) => userID !== message.author.id,
                                false,
                                { maxMatches: 2, time: 60000 }
                            );
                            reactionListener.on('reacted', (event) => {

                                if (event.emoji.name === "❌") {
                                    buyerReaction.push(event.userID);
                                    if (buyerReaction.includes(buyer.id)) {

                                        purchasingCard.setTitle("")
                                        purchasingCard.setDescription("**Purchase Canceled**\n`" + cards.code + "` " + cards.stars + "**#" + cards.issue + " " + cards.group + " " + cards.name + "**\nfor **" + cardWorth + "** <:opal:899430579831988275>")
                                        purchasingCard.setColor("#9370DB")
                                        purchasingCard.setFooter(`${buyer.username}#${buyer.discriminator} | Canceled Purchase`, buyer.avatarURL, buyer.avatarURL)
                                        message.edit({ embed: purchasingCard })
                                    }
                                } else if (event.emoji.name === "💳") {
                                    buyerReaction.push(event.userID);
                                    if (buyerReaction.includes(buyer.id)) {

                                        if (player != null && player != undefined) {
                                            if (player.opals >= cardWorth) {

                                                cards.owner.push(buyer.id)
                                                cards.burned = false

                                                player.opals -= cardWorth
                                                player.inventory.push(cards.code)
                                                player.save()
                                                cards.save()

                                                purchasingCard.setTitle("")
                                                purchasingCard.setDescription("**Purchased Card**\n`" + cards.code + "` " + cards.stars + "**#" + cards.issue + " " + cards.group + " " + cards.name + "**\nfor **" + cardWorth + "** <:opal:899430579831988275>")
                                                purchasingCard.setColor("#9370DB")
                                                purchasingCard.setFooter(`${buyer.username}#${buyer.discriminator} | Bought Card`, buyer.avatarURL, buyer.avatarURL)
                                                message.edit({ embed: purchasingCard })
                                                message.removeReactions('💳');
                                                message.removeReactions('❌');
                                            } else {
                                                purchasingCard.setTitle("")
                                                purchasingCard.setDescription("<:exclaim:906289233814241290> Transaction is unable to go through due to insufficient opals")
                                                purchasingCard.setColor("#9370DB")
                                                purchasingCard.setFooter(`${buyer.username}#${buyer.discriminator} | Purchasing Card Failed`, buyer.avatarURL, buyer.avatarURL)
                                                message.edit({ embed: purchasingCard })
                                                message.removeReactions('💳');
                                                message.removeReactions('❌');

                                            }
                                        }
                                    }
                                }
                            })

                        })

                } else {
                    const invalidCard = new Eris.RichEmbed()
                        .setTitle("")
                        .setDescription("<:exclaim:906289233814241290> `" + cards.code + "` **" + cards.group + " " + cards.name + "** is unable to be purchased")
                        .setColor("#9370DB")
                        .setFooter(`${buyer.username}#${buyer.discriminator} | Invalid Card`, buyer.avatarURL, buyer.avatarURL)
                    message.channel.createMessage({ embed: invalidCard })
                }

            } else {
                const noCard = new Eris.RichEmbed()
                    .setTitle("")
                    .setDescription("<:exclaim:906289233814241290> The selected card does not exist yet within Icon")
                    .setFooter(`${buyer.username}#${buyer.discriminator} | Card Does Not Exist`, buyer.avatarURL, buyer.avatarURL)
                    .setColor("#9370DB")
                message.channel.createMessage({ embed: noCard })
            }
        }
    }
}