/*---------------------------------------LOADING IN THE PACKAGES---------------------------------------*/
// MODELS: Gets the necessary data models from the database to complete the label process
const claimedCards = require('../models/claimedCards.js');
const user = require('../models/user.js');

/*----------------------------------------REMOVE LABEL COMMAND: BEGINNING LABEL PROCESS----------------------------------------------*/
module.exports = {
    name: 'removeLabel',
    description: "Removes labels from cards",
    aliases: ["removelabel", "rmlabel", "rl"],
    async execute(client, message, args, Eris) {

        const member = message.member.user; // Stores the information of the messaging player
        const labeler = await user.findOne({ userID: member.id }) // Stores the player's information from the database
        const content = args // Stores message arguments as a variable 'content'

        // LABELER: If the labeler can be found within the database, the remove label process will continue.
        // Otherwise, the labeler will be prompted to create a label first that they will inevitably be able
        // to remove once added to cards.
        if (labeler != null && labeler != undefined) {

            // CONTENT LENGTH: Checks if the length of the arguments is at least 1. If so, the remove label 
            // process can continue. Otherwise, the player is prompted with the correct format.
            if (content.length >= 1) {
                const matchedCodes = [] // Stores the codes that were matched from the message arguments

                // MATCHED CODES: Cycles through both the inventory of the label and the message arguments
                // to find whether what the player wrote matches their inventory.
                for (i = 0; i < labeler.inventory.length; i++) {
                    for (j = 0; j < content.length; j++) {
                        if (content[j].includes(",")) {
                            content[j] = content[j].replace(",", "")
                        }
                        if (content[j].toLowerCase() == labeler.inventory[i].toLowerCase()) {
                            matchedCodes.push(labeler.inventory[i])
                        }
                    }
                }

                // MATCHED CARDS: Checks to see if there is one or more matched code. If so, the removal of labels process
                // can continue. The player will be prompted that no cards match their search if no matched codes 
                // can be found.
                if (matchedCodes.length != 0) {
                    const cards = await claimedCards.find({ $and: [{ owner: labeler.userID }, { code: { $in: matchedCodes } }] }) // Stores the matching cards from the database

                    var selectedCard;
                    var label;
                    if (cards.length != 0) {

                        // CARDS AND LABELS: Goes through each of the selected cards and removes their labels. Each card
                        // after this process, if had labels, will no longer have labels.
                        var cardCount = 0
                        for (i = 0; i < cards.length; i++) {
                            if (cards[i].labels.length >= 1) {
                                selectedCard = cards[i]
                                label = cards[i].labels[0]
                                cards[i].labels = []
                                cardCount = cardCount + 1
                                cards[i].save()
                            }
                        }

                        if (cardCount == 1) {
                            const successfulRemoval = new Eris.RichEmbed()
                                .setTitle("")
                                .setDescription('The label titled **' + label + '** has been removed from `' + selectedCard.code + '` **#' + selectedCard.issue + " " + selectedCard.group + "** " + selectedCard.name + " (" + selectedCard.era + ")")
                                .setColor("#9370DB")
                                .setFooter(`${member.username}#${member.discriminator} | Removed Label`, member.avatarURL, member.avatarURL)
                            message.channel.createMessage({ embed: successfulRemoval })
                        } else if (cardCount > 1) {
                            const successfulRemoval = new Eris.RichEmbed()
                                .setTitle("")
                                .setDescription("Labels have been successfully removed from **" + cardCount + "** Cards")
                                .setColor("#9370DB")
                                .setFooter(`${member.username}#${member.discriminator} | Removed Labels`, member.avatarURL, member.avatarURL)
                            message.channel.createMessage({ embed: successfulRemoval })
                        } else {
                            const unsuccessfulRemoval = new Eris.RichEmbed()
                                .setTitle("")
                                .setDescription("<:exclaim:906289233814241290> No labels could be removed from cards")
                                .setColor("#9370DB")
                                .setFooter(`${member.username}#${member.discriminator} | No Card Label Exists`, member.avatarURL, member.avatarURL)
                            message.channel.createMessage({ embed: unsuccessfulRemoval })
                        }


                    }
                } else {
                    const unsuccessfulLabel = new Eris.RichEmbed()
                        .setTitle("")
                        .setDescription('<:exclaim:906289233814241290> No cards with the given information exist in your inventory')
                        .setColor("#9370DB")
                        .setFooter(`${member.username}#${member.discriminator} | Cards Not Found`, member.avatarURL, member.avatarURL)
                    message.channel.createMessage({ embed: unsuccessfulLabel })
                }

            } else {
                const unsuccessfulLabel = new Eris.RichEmbed()
                    .setTitle("")
                    .setDescription('<:exclaim:906289233814241290> Card codes must be provided in order to remove labels')
                    .setColor("#9370DB")
                    .setFooter(`${member.username}#${member.discriminator} | Invalid Format`, member.avatarURL, member.avatarURL)
                message.channel.createMessage({ embed: unsuccessfulLabel })

            }

        } else {
            const unsuccessfulLabel = new Eris.RichEmbed()
                .setTitle("")
                .setDescription('<:exclaim:906289233814241290> You must create labels and add labels to cards first before removing labels from cards')
                .setColor("#9370DB")
                .setFooter(`${member.username}#${member.discriminator} | No Labels Exist`, member.avatarURL, member.avatarURL)
            message.channel.createMessage({ embed: unsuccessfulLabel })
        }
    }
}