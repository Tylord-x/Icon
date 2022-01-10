/*---------------------------------------LOADING IN THE PACKAGES---------------------------------------*/
// MODELS: Gets the necessary data models from the database to complete the label process
const claimedCards = require('../models/claimedCards.js');
const user = require('../models/user.js');

/*--------------------------------LABEL COMMAND: LABEL PROCESS----------------------------------------------*/
module.exports = {
    name: 'labels',
    description: "Allows users to view labels within their collection",
    aliases: ["l", "labels"],
    async execute(client, message, args, Eris) {

        var player = ""; // Receives the ID of the player whose labels will be showcased
        var playerInfo; // Stores the information of the player
        var playerName = "" // Depending on the chosen player (mentioning, id, or viewer), will provide their name
        var playerDiscriminator = "" // Depending on the chosen player (mentioning, id, or viewer), will provide their discriminator
        var playerAvatar = "" // Depending on the chosen player (mentioning, id, or viewer), will provide their avatar url
        const viewer = message.member.user; // Stores the information of the messaging player
        var messager = false // Checks whether the player provided is the messaging player

        // MENTION OR USER ID: Checks whether another player is mentioned or if a player id is mentioned. If so,
        // both their id and their user information will be stored. If not, it will store the messaging player's
        // information and display their own labels.
        if (message.mentions.length >= 1 || message.mentions.length < 1 && args.length >= 1) {

            const search = args // Stores arguments as a variable

            // MENTION: If there is a player that has been mentioned, it will receive their guild information
            // including their id, discriminatory, and username. This will be stored for further use.
            if (message.mentions.length >= 1) {
                player = message.channel.guild.members.get(message.mentions[0].id).user.id
                playerInfo = message.channel.guild.members.get(message.mentions[0].id).user
                playerName = message.channel.guild.members.get(message.mentions[0].id).user.username
                playerDiscriminator = message.channel.guild.members.get(message.mentions[0].id).user.discriminator
                playerAvatar = message.channel.guild.members.get(message.mentions[0].id).user.avatarURL
            } else {
                // USING ID: If there is no player mentioned and if the arguments length is at least 1, it will
                // check whether the first argument matches up to a player ID. If the player can be found within the 
                // playerbase, the player's information will be stored.
                const checkPlayer = await user.findOne({ userID: search[0] })
                if (checkPlayer != null && checkPlayer != undefined) {
                    player = checkPlayer.userID
                    playerInfo = checkPlayer
                    playerName = checkPlayer.name
                    playerDiscriminator = checkPlayer.discriminator
                    playerAvatar = checkPlayer.avatar
                }

                // MEMBER GUILD INFORMATION: If the player can be found within the guild, the labels process will 
                // instead opt to use the information provided directly by Discord. This avoids any unupdated information
                // that may have been missed. However, all necessary information should be provided by the profile
                // found within the 
                const members = await message.guild.fetchMembers()
                for (i = 0; i < members.length; i++) {
                    if (members[i].id == search[0]) {
                        playerInfo = members[i]
                        playerName = members[i].username
                        playerDiscriminator = members[i].discriminator
                        playerAvatar = members[i].avatarURL
                    
                    }
                }

            }

            // PLAYER FOUND / SHIFTING ARGUMENTS: If the player can be found, the first argument which contains the mentioned player 
            // or player ID will be removed from the arguments.
            if (player != "") {
                if (search[0] == player || search[0] == "<@!" + message.channel.guild.members.get(message.mentions[0].id).user.id + ">" || search[0] == "<@" + message.channel.guild.members.get(message.mentions[0].id).user.id + ">") {
                    search.shift()
                }
            }
        }

        // MESSAGING PLAYER: If a player cannot be found from mentioning or from using their ID, the process
        // will use the viewer's information. This will also happen if there are no arguments given, therefore
        // the messaging player is choosing to view their own labels.
        if (player == "") {
            player = viewer.id
            playerInfo = viewer
            playerName = viewer.username
            playerDiscriminator = viewer.discriminator
            playerAvatar = viewer.avatarURL
            messager = true
        }
        const labeler = await user.findOne({ userID: player }) // Stores the label collection owner through the database

        // LABELER AND MESSAGER CHECK: If the labeler is found, the label collection viewing process will continue.
        // If the labeler does not exist, it will give a prompt to let the messaging player know that the provided 
        // user does not exist within the playerbase. If the message is viewing their labels as the first interaction
        // with the bot, it will give the embed where no labels are present.
        if ((labeler != null && labeler != undefined) || messager) {

            // LABELER: If the labeler can be found, the label viewing process continues. 
            if (labeler != null && labeler != undefined) {
                if (labeler.labels.length != 0) {

                    const labels = [] // Stores the existing labels within a the collection of a player
                    var cardAmount = "" // Saves a string determined by number of cards

                    for (i = 0; i < labeler.labels.length; i++) {
                        // CARDS: Finds all the cards that have both the player listed as an owner and the labels contained
                        // within the player's collection. It tracks each set of cards with each label and counts them to show how
                        // many cards in total are assigned each label.
                        const cards = await claimedCards.find({ $and: [{ owner: labeler.userID }, { labels: labeler.labels[i] }] })
                        const chosenCards = []
                        for (j = 0; j < cards.length; j++) {
                            // CHOSEN CARDS: Ensures the found cards have the player as the current owner. It checks
                            // that a card is also not burned, solidifying that it is currently in the player's inventory.
                            if ((cards[j].owner[cards[j].owner.length - 1] == labeler.userID) && !cards[j].burned) {
                                chosenCards.push(cards[j])
                            }
                        }
                        if (chosenCards.length == 1) {
                            cardAmount = "Card"
                        } else {
                            cardAmount = "Cards"
                        }
                        // LABELS: Creates a string list of all the labels and the corresponding card amount
                        labels.push("**0" + (i + 1) + "** | " + labeler.labels[i] + " | " + chosenCards.length + "\n")
                    }

                    const viewLabels = new Eris.RichEmbed()
                        .setTitle("")
                        .setDescription("**" + playerName.toUpperCase() + "'S LABELS**\n" + labels.toString().replace(/,/g, ""))
                        .setColor("#33A7FF")
                        .setAuthor(`${playerName}#${playerDiscriminator}`, playerAvatar, playerAvatar)
                        .setFooter(`${viewer.username}#${viewer.discriminator} | Viewing Labels`, viewer.avatarURL, viewer.avatarURL)
                    message.channel.createMessage({ embed: viewLabels })
                } else {
                    const viewLabels = new Eris.RichEmbed()
                        .setTitle("")
                        .setDescription("**" + playerName.toUpperCase() + "'S LABELS**\n No labels can be found within this collection")
                        .setColor("#33A7FF")
                        .setAuthor(`${playerName}#${playerDiscriminator}`, playerAvatar, playerAvatar)
                        .setFooter(`${viewer.username}#${viewer.discriminator} | Viewing Labels`, viewer.avatarURL, viewer.avatarURL)
                    message.channel.createMessage({ embed: viewLabels })
                }
            } else if (labeler == null || labeler == undefined && messager) {
                // MESSAGING PLAYER (FIRST INTERACTION): There may be cases where the first interaction a player has with the bot
                // is viewing their labels. As the database may not update fast enough to register that the player exists after
                // performing the command, this default no-label embed will appear.
                const viewLabels = new Eris.RichEmbed()
                    .setTitle("")
                    .setDescription("**" + playerName.toUpperCase() + "'S LABELS**\n No labels can be found within this collection")
                    .setColor("#33A7FF")
                    .setAuthor(`${playerName}#${playerDiscriminator}`, playerAvatar, playerAvatar)
                    .setFooter(`${viewer.username}#${viewer.discriminator} | Viewing Labels`, viewer.avatarURL, viewer.avatarURL)
                message.channel.createMessage({ embed: viewLabels })

            }
        }
    }
}