/*---------------------------------------LOADING IN THE PACKAGES---------------------------------------*/
// MODELS: Gets the necessary data models from the database to complete the label process
const claimedCards = require('../models/claimedCards.js');
const user = require('../models/user.js');

/*----------------------------------------ADD LABEL COMMAND: BEGINNING LABEL PROCESS----------------------------------------------*/
module.exports = {
    name: 'addLabel',
    description: "Adds labels to cards",
    aliases: ["label", "al", "addlabel"],
    async execute(client, message, args, Eris) {

        const member = message.member.user; // Stores the information of the messaging member
        const labeler = await user.findOne({ userID: member.id }) // Finds the player within the database
        const content = args // Stores arguments as a variable 'content'

        const singleName = content.slice(0, 1) // Collects the first argument of the message content
        const doubleName = content.slice(0, 2) // Collects the first two arguments of the message content
        const tripleName = content.slice(0, 3) // Collects the first three arguments of the message content

        // SINGLE LABEL: Receives the first argument of the message content and turns it into a string
        // called 'single label'. Further in the process, this string will be checked to see if it exactly
        // matches a label within the player's label collection.
        var singleLabel = ""
        for (i = 0; i < singleName.length; i++) {
            singleLabel += singleName[i]
            if (i < singleName.length - 1) {
                singleLabel += " "
            }
        }

        // DOUBLE LABEL: Receives the first two arguments of the message content and turns it into a string
        // called 'double label'. Further in the process, this string will be checked to see if it exactly
        // matches a label within the player's label collection.
        var doubleLabel = ""
        for (i = 0; i < doubleName.length; i++) {
            doubleLabel += doubleName[i]
            if (i < doubleName.length - 1) {
                doubleLabel += " "
            }
        }

        // TRIPLE LABEL: Receives the first three arguments of the message content and turns it into a string
        // called 'triple label'. Further in the process, this string will be checked to see if it exactly
        // matches a label within the player's label collection.
        var tripleLabel = ""
        for (i = 0; i < tripleName.length; i++) {
            tripleLabel += tripleName[i]
            if (i < tripleName.length - 1) {
                tripleLabel += " "
            }
        }

        // EMOJI: Finds whether the first argument contains a valid emoji. If this emoji corresponds to the emoji
        // of an existing label within the player's label collection, this can be used instead to match.
        var emoji;
        if ((/\p{Extended_Pictographic}/u.test(content[0]) == true)) {
            emoji = content[0]
        }

        // LABELER CHECK: Ensures that the labeler exists within the Icon Playerbase. If not, they will be given
        // a prompt stating that they must create a label first before adding a label to cards. This is to prevent
        // errors.
        if (labeler != null && labeler != undefined) {
            // CONTENT LENGTH: Checks if the message content is more than 2 arguments, which would be the label name or
            // emoji plus the card codes. If the content is less, the player will be prompted with the correct format.
            if (content.length >= 2) {
                // LABEL LENGTH: Tracks whether a labeler has more than one label in their label collection. If not,
                // then the labeler will be prompted to create a label.
                if (labeler.labels.length != 0) {

                    var label = "" // Stores the selected label
                    var labelLength = 0 // Saves the length of the label name
                    for (i = 0; i < labeler.labels.length; i++) {
                        // SINGLE LABEL: If a label name within the labeler's collection matches the single label name provided
                        // through arguments, the existing label will be saved and used within the process.
                        if (labeler.labels[i].substring(labeler.labels[i].indexOf(" ") + 1).toLowerCase() == singleLabel.toLowerCase()) {
                            label = labeler.labels[i]
                            labelLength = 1
                        }
                        // DOUBLE LABEL: If a label name within the labeler's collection matches the double label name provided
                        // through arguments, the existing label will be saved and used within the process.
                        if (labeler.labels[i].substring(labeler.labels[i].indexOf(" ") + 1).toLowerCase() == doubleLabel.toLowerCase()) {
                            label = labeler.labels[i]
                            labelLength = 2
                        }
                        // TRIPLE LABEL: If a label name within the labeler's collection matches the triple label name provided
                        // through arguments, the existing label will be saved and used within the process.
                        if (labeler.labels[i].substring(labeler.labels[i].indexOf(" ") + 1).toLowerCase() == tripleLabel.toLowerCase()) {
                            label = labeler.labels[i]
                            labelLength = 3
                        }
                        // EMOJI: If the emoji of an existing label matches the emoji provided through the message arguments, 
                        // the existing label will be saved and used within the process.
                        if (labeler.labels[i].substring(0, labeler.labels[i].indexOf(" ")) == emoji) {
                            label = labeler.labels[i]
                            labelLength = 1
                        }
                    }

                    // LABEL MATCH: If a label could be found from the information provided by the player, the label process will
                    // continue. If a label could not be found, the player will be prompted that no label matched.
                    if (label != "" && labelLength >= 1) {

                        // CARD CODES: After getting the length of the label name, the rest of the arguments will be marked 
                        // as either card codes or filters. If the arguments match card codes within the player's inventory,
                        // the arguments will be identified as card codes. The matched card codes will be stored.
                        const cardContent = content.slice(labelLength, content.length)
                        const matchedCodes = [] // Stores the matched card codes
                        var cardCodes = false // Stores whether the arguments are identified as card codes
                        for (i = 0; i < cardContent.length; i++) {
                            console.log(cardContent[i])
                            if (cardContent[i].includes(",")) {
                                cardContent[i] = cardContent[i].replace(",", "")
                            }
                            for (j = 0; j < labeler.inventory.length; j++) {
                                console.log(labeler.inventory[j])
                                if (cardContent[i].toLowerCase() == labeler.inventory[j].toLowerCase()) {
                                    console.log("went in here")
                                    matchedCodes.push(labeler.inventory[j])
                                    cardCodes = true
                                }
                            }
                        }


                        console.log(matchedCodes)
                        console.log(cardCodes)

                        // FILTER: After getting the length of the label name, the rest of the arguments will be marked 
                        // as either card codes or filters. If the arguments contain variations of g= or group=, n= or name=,
                        // or e= or era=, the arguments will be identified as a filter and will be handled accordingly.
                        const filterContent = content.slice(labelLength, content.length)
                        var filter = false // Stores whether the arguments are identified as filter content
                        var filterName = ""
                        var filterCount = 0 // Counts the number of filters

                        // FILTER: Finds whether the filter is a group filter, name filter, or era filter. It then stores
                        // the information for the filter, including the filter name and the filter count. If a filter that
                        // contains variations of g=, n=, or e= are found, the arguments are identified as a filter.
                        for (i = 0; i < filterContent.length; i++) {
                            if (filterContent[i].startsWith("g") || filterContent[i].startsWith("G") || filterContent[i].startsWith("group") || filterContent[i].startsWith("Group")) {
                                filter = true
                                filterName = "group"
                                filterCount += 1
                            } else if (filterContent[i].startsWith("n") || filterContent[i].startsWith("N") || filterContent[i].startsWith("name") || filterContent[i].startsWith("Name")) {
                                filter = true
                                filterName = "name"
                                filterCount += 1
                            } else if (filterContent[i].startsWith("e") || filterContent[i].startsWith("E") || filterContent[i].startsWith("era") || filterContent[i].startsWith("Era")) {
                                filter = true
                                filterName = "era"
                                filterCount += 1
                            }

                            filterContent[i] = filterContent[i].replace(/(.*)=/, "")
                        }

                        var cards; // Stores the cards found after card codes or a filter is provided

                        if (matchedCodes.length != 0) {
                            cards = await claimedCards.find({ $and: [{ owner: labeler.userID }, { code: { $in: matchedCodes } }] })
                        } else if (filterName != "") {
                            var selectedFilter = ""; // Stores the content of the selected filter
                            // SELECTED FILTER: Cycles through the designated filter content and saves it
                            // as a string. It will contain regex to make sure that special characters can
                            // match within the filter to the name of groups, idols, or eras.
                            for (i = 0; i < filterContent.length; i++) {
                                for (char in filterContent[i]) {
                                    if (filterContent[i].charAt(char) == "(" || filterContent[i].charAt(char) == ")" || filterContent[i].charAt(char) == "*" || filterContent[i].charAt(char) == "&" || filterContent[i].charAt(char) == "%"
                                        || filterContent[i].charAt(char) == "." || filterContent[i].charAt(char) == "!" || filterContent[i].charAt(char) == "@" || filterContent[i].charAt(char) == "#" || filterContent[i].charAt(char) == "]"
                                        || filterContent[i].charAt(char) == "[" || filterContent[i].charAt(char) == ":" || filterContent[i].charAt(char) == ";" || filterContent[i].charAt(char) == "?" || filterContent[i].charAt(char) == "<"
                                        || filterContent[i].charAt(char) == ">" || filterContent[i].charAt(char) == "'") {
                                        selectedFilter += "\\" + filterContent[i].charAt(char)

                                    } else {
                                        selectedFilter += "" + filterContent[i].charAt(char)
                                    }
                                }
                                if (i < filterContent[i].length - 1) {
                                    selectedFilter += " "
                                }
                            }

                            const matchFilter = { $regex: selectedFilter.trim(), $options: "i" } // Sets up regex to match with cards in the database

                            cards = await claimedCards.find({ $and: [{ owner: labeler.userID }, { [filterName]: matchFilter }] }) // Queries for claimed cards with the created regex
                        }

                        // CARDS LENGTH: Makes sure is at least one card that has been found after card codes or a filter was
                        // provided. Otherwise, the player will be prompted that cards could not be found.
                        if (cards != null && cards != undefined) {
                            if (cards.length != 0) {

                                // LABELS: If the selected cards do not contain labels, the provided label will be 
                                // assigned to each card.
                                var labeledCount = 0
                                var selectedCard;
                                for (i = 0; i < cards.length; i++) {
                                    if (cards[i].labels.length < 1) {
                                        cards[i].labels.push(label)
                                        labeledCount = labeledCount + 1
                                        cards[i].save()
                                        selectedCard = cards[i]
                                    }
                                }

                                if (labeledCount == 1) {
                                    const successfulLabel = new Eris.RichEmbed()
                                        .setTitle("")
                                        .setDescription('The label titled **' + label + '** has been added to `' + selectedCard.code + '` **#' + selectedCard.issue + " " + selectedCard.group + "** " + selectedCard.name + " (" + selectedCard.era + ")")
                                        .setColor("#9370DB")
                                        .setFooter(`${member.username}#${member.discriminator} | Added Label`, member.avatarURL, member.avatarURL)
                                    message.channel.createMessage({ embed: successfulLabel })
                                } else if (labeledCount > 1) {
                                    const successfulLabel = new Eris.RichEmbed()
                                        .setTitle("")
                                        .setDescription('The label titled **' + label + '** has been added to **' + labeledCount + "** cards")
                                        .setColor("#9370DB")
                                        .setFooter(`${member.username}#${member.discriminator} | Added Label`, member.avatarURL, member.avatarURL)
                                    message.channel.createMessage({ embed: successfulLabel })
                                } else {
                                    const unsuccessfulLabel = new Eris.RichEmbed()
                                        .setTitle("")
                                        .setDescription('<:exclaim:906289233814241290> The label titled **' + label + '** could not be added to any cards')
                                        .setColor("#9370DB")
                                        .setFooter(`${member.username}#${member.discriminator} | Label Already Exists`, member.avatarURL, member.avatarURL)
                                    message.channel.createMessage({ embed: unsuccessfulLabel })
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
                                .setDescription('<:exclaim:906289233814241290> No cards with the given information exist in your inventory')
                                .setColor("#9370DB")
                                .setFooter(`${member.username}#${member.discriminator} | Cards Not Found`, member.avatarURL, member.avatarURL)
                            message.channel.createMessage({ embed: unsuccessfulLabel })
                        }

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
                        .setDescription('<:exclaim:906289233814241290> You must create a label first before adding labels to cards')
                        .setColor("#9370DB")
                        .setFooter(`${member.username}#${member.discriminator} | No Labels Exist`, member.avatarURL, member.avatarURL)
                    message.channel.createMessage({ embed: unsuccessfulLabel })
                }
            } else {
                const unsuccessfulLabel = new Eris.RichEmbed()
                    .setTitle("")
                    .setDescription('<:exclaim:906289233814241290> The label name or label emoji must be given before either card codes or a group, name, or era filter to continue the label process')
                    .setColor("#9370DB")
                    .setFooter(`${member.username}#${member.discriminator} | Invalid Format`, member.avatarURL, member.avatarURL)
                message.channel.createMessage({ embed: unsuccessfulLabel })
            }
        } else {
            const unsuccessfulLabel = new Eris.RichEmbed()
                .setTitle("")
                .setDescription('<:exclaim:906289233814241290> You must create a label first before adding labels to cards')
                .setColor("#9370DB")
                .setFooter(`${member.username}#${member.discriminator} | No Labels Exist`, member.avatarURL, member.avatarURL)
            message.channel.createMessage({ embed: unsuccessfulLabel })
        }

    }
}