/*---------------------------------------LOADING IN THE PACKAGES---------------------------------------*/
// MODELS: Gets the necessary data models from the database to complete the label process
const claimedCards = require('../models/claimedCards.js');
const user = require('../models/user.js');

/*--------------------------------DELETE LABEL COMMAND: BEGINNING LABEL PROCESS----------------------------------------------*/
module.exports = {
    name: 'deletelabel',
    description: "Allows users to create labels for their label collection",
    aliases: ["delete", "dl", "deletelabel"],
    async execute(client, message, args, Eris) {

        const member = message.member.user; // Stores the information of the messaging player
        const labeler = await user.findOne({ userID: member.id }) // Stores the information of the player from the database
        const content = args // Saves the message arguments as the variable 'content'

        // CONTENT LENGTH: Checks whether the message content is at least 1 argument. If so, the deleting of labels
        // is continued. Otherwise, the player is prompted with the correct format.
        if (content.length >= 1) {

            // LABEL: Loops through the message content and stores it as a variable called 'label'
            var label = ""
            for (i = 0; i < content.length; i++) {
                label += content[i]
                if (i < content.length - 1) {
                    label += " "
                }
            }

            // LABELER: Makes sure that the player can be found within the database. Otherwise, the player
            // will receive a prompt telling players to create a label first.
            if (labeler != undefined && labeler != null) {

                // LABELS LENGTH: Checks if the number of labels within the labeler's collection is more than 1.
                // If so, the labels will be looped through. If not, the player will be prompted that a label must 
                // be created first before it can be deleted.
                if (labeler.labels.length != 0) {

                    var selectedLabel; // Stores the selected label after matching the label search to the collection of existing labels

                    for (i = 0; i < labeler.labels.length; i++) {
                        // LABEL NAME: Matches a label name within a label collection to the label name arguments. If it matches,
                        // it will be stored as 'selectedLabel.'
                        if (labeler.labels[i].substring(labeler.labels[i].indexOf(" ") + 1).toLowerCase() == label.toLowerCase()) {
                            selectedLabel = labeler.labels[i]
                        }
                        // LABEL EMOJI: Matches an emoji within a label collection to the emoji arguments. If it matches,
                        // it will be stored as 'selectedLabel.'
                        if (labeler.labels[i].substring(0, labeler.labels[i].indexOf(" ")) == label.toLowerCase()) {
                            selectedLabel = labeler.labels[i]
                        }
                    }

                    // SELECTED LABEL: If a label has been found, the deletion process will continue. If a label cannot be found,
                    // the player will be prompted that no matching label could be found.
                    if (selectedLabel != null && selectedLabel != undefined) {
                        // CARDS: Finds all the claimed cards within the database that both have the player as a listed owner
                        // and the provided label. It is not necessary that cards are found.
                        const cards = await claimedCards.find({ $and: [{ owner: labeler.userID }, { labels: selectedLabel }] })
                        const selectedCards = []
                        // CARD CHECK: Ensures that the cards found have the messaging player as the current owner
                        if (cards.length != 0) {
                            for (i = 0; i < cards.length; i++) {
                                if (cards[i].owner[cards[i].owner.length - 1] == labeler.userID) {
                                    selectedCards.push(cards[i])
                                }
                            }
                        }

                        // LABEL DELETION FROM PLAYER: Finds the index of the selected label within the labeler's collection
                        // and deletes it from their collection.
                        var labelIndex = labeler.labels.indexOf(selectedLabel)
                        labeler.labels.splice(labelIndex, 1)

                        // LABEL DELETION FROM CARDS: Proceeds to also delete the labels from the owned cards that have 
                        // the given label.
                        for (i = 0; i < selectedCards.length; i++) {
                            selectedCards[i].labels = []
                            selectedCards[i].save()
                        }

                        labeler.save()

                        const successfulDelete = new Eris.RichEmbed()
                            .setTitle("")
                            .setDescription(`The label titled **${selectedLabel}** has been deleted from your label collection`)
                            .setColor("#9370DB")
                            .setFooter(`${member.username}#${member.discriminator} | Deleted Label`, member.avatarURL, member.avatarURL)
                        message.channel.createMessage({ embed: successfulDelete })

                    } else {
                        const unsuccessfulLabel = new Eris.RichEmbed()
                            .setTitle("")
                            .setDescription('<:exclaim:906289233814241290> A label with the given information could not be found in your collection')
                            .setColor("#9370DB")
                            .setFooter(`${member.username}#${member.discriminator} | Label Not Found`, member.avatarURL, member.avatarURL)
                        message.channel.createMessage({ embed: unsuccessfulLabel })
                    }
                } else {
                    const unsuccessfulLabel = new Eris.RichEmbed()
                        .setTitle("")
                        .setDescription('<:exclaim:906289233814241290> You must create a label first before deleting a label')
                        .setColor("#9370DB")
                        .setFooter(`${member.username}#${member.discriminator} | No Labels Exist`, member.avatarURL, member.avatarURL)
                    message.channel.createMessage({ embed: unsuccessfulLabel })
                }
            } else {
                const unsuccessfulLabel = new Eris.RichEmbed()
                    .setTitle("")
                    .setDescription('<:exclaim:906289233814241290> You must create a label first before deleting a label')
                    .setColor("#9370DB")
                    .setFooter(`${member.username}#${member.discriminator} | No Labels Exist`, member.avatarURL, member.avatarURL)
                message.channel.createMessage({ embed: unsuccessfulLabel })
            }

        } else {
            const invalidFormat = new Eris.RichEmbed()
                .setTitle("")
                .setDescription(`<:exclaim:906289233814241290> A label name or its corresponding emoji must be given in order to delete a label`)
                .setColor("#9370DB")
                .setFooter(`${member.username}#${member.discriminator} | Invalid Format`, member.avatarURL, member.avatarURL)
            message.channel.createMessage({ embed: invalidFormat })
        }

    }
}