/*---------------------------------------LOADING IN THE PACKAGES-----------------------------------*/
// CANVAS: Provides all the necessary components of Canvas and its related packages. The fonts used
// on the displayed cards registered with the registerFont component of Canvas.
const Canvas = require('canvas');
const { registerFont } = require('canvas');
registerFont('./fonts/Prompt-Bold.ttf', { family: 'Prompt-Bold' })
registerFont('./fonts/Prompt-Medium.ttf', { family: 'Prompt-Medium' })
registerFont('./fonts/Prompt-Regular.ttf', { family: 'Prompt' })

// MODELS: Gets the necessary data models from the database to complete the gift process
const claimedCards = require('../models/claimedCards.js');
const user = require('../models/user.js');

// REACTION HANDLER: Allows the player to interact with the embeds
const ReactionHandler = require('eris-reactions');

/*-----------------------------------------GIFT COMMAND: BEGIN GIFT PROCESS-----------------------------*/
module.exports = {
    name: 'gift',
    description: "Gives players the opportunity to gift one or multiple cards",
    aliases: ["g"],
    async execute(client, message, args, Eris) {
        const initiator = message.member.user;
        const gifter = await user.findOne({ userID: initiator.id })
        const content = args
        var receiver = ""; // Stores the ID of the player who is receiving the gift if found
        var receiverInfo; // Stores the overall profile information found of the giftee
        var receiverName = "" // Depending on the chosen player (mentioning, id, or viewer), will provide their name
        var receiverDiscriminator = "" // Depending on the chosen player (mentioning, id, or viewer), will provide their discriminator
        var receiverAvatar = "" // Depending on the chosen player (mentioning, id, or viewer), will provide their avatar url

        if (content != null && content != undefined) {

            if ((content.length >= 1 && message.mentions.length < 1) || message.mentions.length >= 1) {
                // MENTIONED PLAYER: If the method of identifying the giftee is mentioning, the resulting information 
                // provided by the guild will be saved. This includes the giftee's name, discriminator, and avatar.
                // This information will be used later on within the gift embeds.
                if (message.mentions.length >= 1) {
                    receiver = message.channel.guild.members.get(message.mentions[0].id).user.id
                    receiverInfo = message.channel.guild.members.get(message.mentions[0].id).user
                    receiverName = message.channel.guild.members.get(message.mentions[0].id).user.username
                    receiverDiscriminator = message.channel.guild.members.get(message.mentions[0].id).user.discriminator
                    receiverAvatar = message.channel.guild.members.get(message.mentions[0].id).user.avatarURL
                } else {
                    // FINDING PLAYER BY ID: If there is no player mentioned and if the arguments length is at least 1, it will
                    // check whether the first argument matches up to a player ID. If the player can be found within the 
                    // playerbase, the player's information will be stored.
                    const checkPlayer = await user.findOne({ userID: content[0] })
                    if (checkPlayer != null && checkPlayer != undefined) {
                        receiver = checkPlayer.userID
                        receiverInfo = checkPlayer
                        receiverName = checkPlayer.name
                        receiverDiscriminator = checkPlayer.discriminator
                        receiverAvatar = checkPlayer.avatar
                    }
                    // MEMBER GUILD INFORMATION: If the player can be found within the guild, the gift process will 
                    // instead opt to use the information provided directly by Discord. This avoids any unupdated information
                    // that may have been missed. However, all necessary information should be provided by the profile
                    // found within the database.
                    const members = await message.guild.fetchMembers()
                    for (i = 0; i < members.length; i++) {
                        if (members[i].id == content[0]) {
                            receiverInfo = members[i]
                            receiverName = members[i].username
                            receiverDiscriminator = members[i].discriminator
                            receiverAvatar = members[i].avatarURL
                        }
                    }
                }

                if (receiver != "") {
                    if (content[0] == receiver || content[0] == "<@!" + message.channel.guild.members.get(message.mentions[0].id).user.id + ">" || content[0] == "<@" + message.channel.guild.members.get(message.mentions[0].id).user.id + ">") {
                        content.shift()
                    }
                }
                const giftee = await user.findOne({ userID: receiver }) // Stores the information of the gifted player

                if (giftee != null && giftee != undefined) {

                    // CARD CODES: Cycles through the gifting player's inventory and matches the typed card codes to the codes
                    // within the inventory. Once they are matched, they are added to an array called "matchedCards". 
                    const matchedCards = []
                    for (i = 0; i < gifter.inventory.length; i++) {
                        for (j = 0; j < content.length; j++) {
                            if (content[j].includes(",")) {
                                content[j] = content[j].replace(",", "")
                            }
                            if (gifter.inventory[i].toLowerCase() == content[j].toLowerCase()) {
                                matchedCards.push(gifter.inventory[i])
                            }
                        }
                    }

                    // MATCHED CARDS: Ensures that the card codes provided match to card codes within the 
                    // inventory of the gifter. If the codes are matched, the gifting process can continue.
                    // Otherwise, the gifter will be prompted to provide valid cards.
                    if (matchedCards.length != 0) {

                        const cards = await claimedCards.find({ $and: [{ owner: gifter.userID }, { code: { $in: matchedCards } }] })

                        const gift = []
                        var pageCount = 0
                        var page = 1
                        const pages = []
                        if (cards.length != 0) {
                            for (i = 0; i < cards.length; i++) {
                                if (cards.length == 1) {
                                    if (cards[i].name == "Group") {
                                        gift.push("<:cards:900131721855516743> `" + cards[i].code + "` **#" + cards[i].issue + " " + cards[i].group.toUpperCase() + "**\n" + cards[i].era + "\n" + cards[i].stars)
                                    } else {
                                        gift.push("<:cards:900131721855516743> `" + cards[i].code + "` **#" + cards[i].issue + " " + cards[i].group.toUpperCase() + " " + cards[i].name.toUpperCase() + "**\n" + cards[i].era + "\n" + cards[i].stars)
                                    }
                                } else {
                                    if (cards[i].name == "Group") {
                                        gift.push("<:cards:900131721855516743> `" + cards[i].code + "` " + cards[i].stars + " **#" + cards[i].issue + " " + cards[i].group + "**\n")

                                    } else {
                                        gift.push("<:cards:900131721855516743> `" + cards[i].code + "` " + cards[i].stars + " **#" + cards[i].issue + " " + cards[i].group + "** " + cards[i].name + "\n")
                                    }
                                }
                                if (i % 10 == 0) {
                                    pageCount += 1;
                                    pages.push(pageCount)
                                }
                            }

                            var cardAmount = ""
                            var cardAttachment;
                            var messageOutput;
                            var cardAmount = ""
                            if (gift.length == 1) {

                                // CARD: If there is only one card, the first and only card document found will be stored
                                // as a card variable
                                const card = cards[0]

                                //CANVAS: Creates a canvas to hold all of the card components to be displayed in the embed
                                const canvas = Canvas.createCanvas(600, 900);
                                const context = canvas.getContext('2d');
                                const background = await Canvas.loadImage('transparent.png');
                                context.drawImage(background, 0, 0, canvas.width, canvas.height);

                                // MAIN IMAGE: Gets the overall main image of the card, which is either an idol or a group
                                const idolMainImage = await Canvas.loadImage(card.mainImage);
                                context.drawImage(idolMainImage, 30, 75, 540, 657);

                                // EMBED COLOR: The embed is colored based on whether a card is dyed. The default is the basic
                                // Icon blue color, "#33A7FF", which is found as the default for most of the embeds in the game.
                                // If a card is dyed, the embed takes on the color of the left most point of the hue.

                                var embedColor = ""
                                if (card.hueApplied) {

                                    context.fillStyle = card.hues[0].hexCode;
                                    context.fillRect(0, 0, 34, 900);
                                    context.fillStyle = card.hues[card.hues.length - 1].hexCode;
                                    context.fillRect(565, 0, 35, 900);

                                    var lowerGradient = context.createLinearGradient(((1 / card.hues.length) * 100), 729, (600 - ((1 / card.hues.length) * 100)), 729);

                                    for (i = 0; i < card.hues.length; i++) {
                                        if (card.hues.length == 1) {
                                            lowerGradient.addColorStop(i * (1 / (card.hues.length)), card.hues[i].hexCode);
                                        } if (card.hues.length == 2) {
                                            lowerGradient.addColorStop(i * (1 / (card.hues.length - 1)), card.hues[i].hexCode);
                                        } if (card.hues.length == 3) {
                                            lowerGradient.addColorStop(i * (1 / (card.hues.length - 0.8)), card.hues[i].hexCode);
                                        }
                                    }

                                    var higherGradient = context.createLinearGradient(((1 / card.hues.length) * 100), 76, (600 - ((1 / card.hues.length) * 100)), 76);

                                    for (i = 0; i < card.hues.length; i++) {
                                        if (card.hues.length == 1) {
                                            higherGradient.addColorStop(i * (1 / (card.hues.length)), card.hues[i].hexCode);
                                        } if (card.hues.length == 2) {
                                            higherGradient.addColorStop(i * (1 / (card.hues.length - 1)), card.hues[i].hexCode);
                                        } if (card.hues.length == 3) {
                                            higherGradient.addColorStop(i * (1 / (card.hues.length - 0.8)), card.hues[i].hexCode);
                                        }
                                    }
                                    context.fillStyle = lowerGradient;
                                    context.fillRect(0, 729, 600, 171);
                                    context.fillStyle = higherGradient;
                                    context.fillRect(0, 0, 600, 76);

                                    embedColor = card.hues[0]

                                } else {
                                    context.fillStyle = "#313131";
                                    context.fillRect(0, 0, 34, 900);
                                    context.fillStyle = "#313131";
                                    context.fillRect(565, 0, 35, 900);
                                    context.fillStyle = "#313131";
                                    context.fillRect(0, 729, 600, 171);
                                    context.fillStyle = "#313131";
                                    context.fillRect(0, 0, 600, 76);
                                    embedColor = "#33A7FF"
                                }

                                // FRAME: Receives the frame currently applied to the card and adds it to the canvas

                                var frameImage = ""

                                if (card.frame.image.includes("Default_Frame")) {
                                    if (card.hueApplied) {
                                        frameImage = "./img/cosmetics/frames/Default_Hue_Frame.png"
                                    } else {
                                        frameImage = "./img/cosmetics/frames/Default_Frame.png"
                                    }
                                } else {
                                    frameImage = card.frame.image
                                }

                                const frame = await Canvas.loadImage(frameImage)
                                context.drawImage(frame, 0, 0, 600, 900);

                                // STICKERS: Cycles through all of the stickers contained on the card and places them in their correct
                                // positions on the cards. If no stickers exist on the card, no stickers will be showcased.
                                if (card.stickers != null && card.stickers != undefined && card.stickers.length != 0) {
                                    for (i = 0; i < card.stickers.length; i++) {
                                        const stickers = await Canvas.loadImage(card.stickers[i].image)
                                        context.drawImage(stickers, card.stickers[i].x, card.stickers[i].y, card.stickers[i].w, card.stickers[i].h);
                                    }
                                }

                                // COSMETICS: Cycles through all of the cosmetics contained on the card and places them in their correct
                                // positions on the cards. If no cosmetics exist on the card, no cosmetics will be showcased.
                                if (card.cosmetics != null && card.cosmetics != undefined && card.cosmetics.length != 0) {
                                    for (i = 0; i < card.cosmetics.length; i++) {
                                        const cosmetics = await Canvas.loadImage(card.cosmetics[i].image)
                                        context.drawImage(cosmetics, card.cosmetics[i].x, card.cosmetics[i].y, card.cosmetics[i].w, card.cosmetics[i].h);
                                    }
                                }

                                // ICON: Gets the icon that matches the idol or group depicted in the main image by era
                                const idolIcon = await Canvas.loadImage(card.icon);
                                context.drawImage(idolIcon, 34, 747.5, 138, 121);

                                /*---------------------------------------FONTS & TEXT---------------------------------------*/

                                // ISSUE NUMBER: Placed on top left of the chosen card. It provides the issue number associated
                                // with the card.
                                context.font = '37px "Prompt"';
                                context.textAlign = "left";
                                context.fillStyle = "#FFFFFF";
                                var issue = "#" + card.issue
                                context.fillText(issue, 33, 50);

                                // IDOL AND GROUP NAMES: Determines whether a card is a group card or a regular idol card and displays
                                // the text accordingly. Both output two lines of text that provides accurate information about the card.
                                // If it is a regular idol card, the idol's name followed by the group the idol belongs to is given. If it
                                // is a group card or soloist card, the group's name followed by "group" or "soloist" is given.

                                if (card.name == "Group") {
                                    if (card.group.length >= 14) {
                                        context.font = '42px "Prompt-Bold"';
                                    } else {
                                        context.font = '45px "Prompt-Bold"';
                                    }
                                    context.textAlign = "right";
                                    context.fillStyle = "#FFFFFF"
                                    var groupName = card.group.toUpperCase();
                                    context.fillText(groupName, 566, 810);

                                    context.font = '26px "Prompt"';
                                    context.textAlign = "right";
                                    context.fillStyle = "#FFFFFF";
                                    var groupLabel = card.name.toUpperCase();
                                    context.fillText(groupLabel, 566, 838);

                                } else {
                                    context.font = '45px "Prompt-Bold"';
                                    context.textAlign = "right";
                                    context.fillStyle = "#FFFFFF"
                                    var idolName = card.name.toUpperCase();
                                    context.fillText(idolName, 566, 810);

                                    context.font = '26px "Prompt"';
                                    context.textAlign = "right";
                                    context.fillStyle = "#FFFFFF";
                                    var groupName = card.group.toUpperCase();
                                    context.fillText(groupName, 566, 838);
                                }

                                const buffer = canvas.toBuffer();
                                cardAttachment = { file: buffer, name: "giftCard.png" }; // Buffers the image and create an attachment

                                cardAmount = "Card" // Stores "Card" for further use for defining the amount of cards on the embed

                                const giftingCard = new Eris.RichEmbed()
                                    .setTitle("**Gift Card**")
                                    .setDescription(gift.slice((page) * 10 - 10, (page) * 10).toString().replace(/,/g, ""))
                                    .setColor("#33A7FF")
                                    .setImage("attachment://giftCard.png")
                                    .setFooter(`${initiator.username}#${initiator.discriminator} | Gifting Card to ${receiverName}#${receiverDiscriminator}`, initiator.avatarURL, initiator.avatarURL)
                                message.channel.createMessage({ embed: giftingCard }, cardAttachment)
                                    .then(message => {
                                        message.addReaction("🎁")
                                        message.addReaction("❌")

                                        const reactionListener = new ReactionHandler.continuousReactionStream(
                                            message,
                                            (userID) => userID != message.author.id,
                                            false,
                                            { max: 100, time: 60000 }
                                        );

                                        reactionListener.on('reacted', async (event) => {
                                            const gifterReaction = []
                                            if (event.emoji.name === "❌") {
                                                gifterReaction.push(event.userID); // Adds the reactors of the "x" emoji to the array
                                                // GIFTER REACTION: If the player who initiated the gift process reacted to the "x" emoji reaction,
                                                // the gift process is canceled.
                                                if (gifterReaction.includes(gifter.userID)) {
                                                    const giftCard = new Eris.RichEmbed()
                                                        .setTitle("**Gift Canceled**")
                                                        .setDescription(gift.slice((page) * 10 - 10, (page) * 10).toString().replace(/,/g, ""))
                                                        .setColor("#ff4d6d")
                                                        .setImage("attachment://giftCard.png")
                                                        .setFooter(`${initiator.username}#${initiator.discriminator} | Canceled Gift to ${receiverName}#${receiverDiscriminator}`, initiator.avatarURL, initiator.avatarURL)
                                                    if (gift.length == 1) {
                                                        message.edit({ embed: giftCard }, cardAttachment)
                                                    } else {
                                                        message.edit({ embed: giftCard }, { attachments: [] })
                                                    }
                                                    message.removeReactions("🎁")
                                                    message.removeReactions("❌")
                                                    message.removeReactions('◀️')
                                                    message.removeReactions('▶️')
                                                }
                                            } if (event.emoji.name === "🎁") {
                                                const giftPlayer = await user.findOne({ userID: gifter.userID })
                                                gifterReaction.push(event.userID); // Adds the reactors to the array
                                                // GIFTER REACTION: If the player who initiated the gift process reacted to the gift emoji reaction,
                                                // the gift process completes and all relevant components of the player's information and the card's
                                                // information are updated.
                                                if (gifterReaction.includes(gifter.userID)) {
                                                    for (i = 0; i < cards.length; i++) {

                                                        // UPDATE CARDS: Cycles through all of the cards that are being gifted and updates each individual
                                                        // card's information. The quantitative count data is updated.
                                                        cards[i].labels = []
                                                        cards[i].timesGifted += 1
                                                        cards[i].gifted = true
                                                        cards[i].owner.push(giftee.userID)
                                                        cards[i].save()

                                                        // UPDATE GIFTER: Removes all the gifted cards from the gifter's inventory and changes the gifter's
                                                        // quantitative data pertaining to card amount and the gifting process.
                                                        var cardIndex = giftPlayer.inventory.indexOf(cards[i].code)
                                                        giftPlayer.inventory.splice(cardIndex, 1)
                                                        giftPlayer.numCards -= 1;
                                                        giftPlayer.gifted += 1;

                                                        // UPDATE GIFTEE: All the gifted cards are inputed into the designated giftee's inventory and changes
                                                        // the giftee's quantiative data pertaining to card amount and the gifting process.
                                                        giftee.inventory.push(cards[i].code)
                                                        giftee.numCards += 1
                                                        giftee.giftsReceived += 1
                                                    }

                                                    giftPlayer.save() // Saves the gifter's information to the database
                                                    giftee.save() // Saves the giftee's information to the database

                                                    const giftCard = new Eris.RichEmbed()
                                                        .setTitle("**Successfully Gifted " + cardAmount + "**")
                                                        .setDescription(gift.slice((page) * 10 - 10, (page) * 10).toString().replace(/,/g, ""))
                                                        .setColor("#9370DB")
                                                        .setImage("attachment://giftCard.png")
                                                        .setFooter(`${initiator.username}#${initiator.discriminator} | Gifted to ${receiverName}#${receiverDiscriminator}`, initiator.avatarURL, initiator.avatarURL)
                                                    if (gift.length == 1) {
                                                        message.edit({ embed: giftCard }, cardAttachment)
                                                    } else {
                                                        message.edit({ embed: giftCard }, { attachments: [] })
                                                    }
                                                    message.removeReactions("🔥")
                                                    message.removeReactions("❌")
                                                    message.removeReactions('◀️')
                                                    message.removeReactions('▶️')
                                                }

                                            }
                                        })
                                    })

                            } else {
                                const giftingCard = new Eris.RichEmbed()
                                    .setTitle("**Gift Cards**")
                                    .setDescription(gift.slice((page) * 10 - 10, (page) * 10).toString().replace(/,/g, ""))
                                    .setColor("#33A7FF")
                                    .setImage("attachment://giftCard.png")
                                    .setFooter(`${initiator.username}#${initiator.discriminator} | Gifting Cards to ${receiverName}#${receiverDiscriminator}`, initiator.avatarURL, initiator.avatarURL)
                                if (gift.length <= 11) {
                                    message.channel.createMessage({ embed: giftingCard })
                                        .then(message => {
                                            message.addReaction("🎁")
                                            message.addReaction("❌")

                                            const reactionListener = new ReactionHandler.continuousReactionStream(
                                                message,
                                                (userID) => userID != message.author.id,
                                                false,
                                                { max: 100, time: 60000 }
                                            );

                                            reactionListener.on('reacted', async (event) => {
                                                const giftPlayer = await user.findOne({ userID: gifter.userID })
                                                const gifterReaction = []
                                                if (event.emoji.name === "❌") {
                                                    gifterReaction.push(event.userID); // Adds the reactors of the "x" emoji to the array
                                                    // GIFTER REACTION: If the player who initiated the gift process reacted to the "x" emoji reaction,
                                                    // the gift process is canceled.
                                                    if (gifterReaction.includes(gifter.userID)) {
                                                        const giftCard = new Eris.RichEmbed()
                                                            .setTitle("**Gift Canceled**")
                                                            .setDescription(gift.slice((page) * 10 - 10, (page) * 10).toString().replace(/,/g, ""))
                                                            .setColor("#ff4d6d")
                                                            .setImage("attachment://giftCard.png")
                                                            .setFooter(`${initiator.username}#${initiator.discriminator} | Canceled Gift to ${receiverName}#${receiverDiscriminator}`, initiator.avatarURL, initiator.avatarURL)
                                                        message.edit({ embed: giftCard }, { attachments: [] })

                                                        message.removeReactions("🎁")
                                                        message.removeReactions("❌")
                                                        message.removeReactions('◀️')
                                                        message.removeReactions('▶️')
                                                    }
                                                } if (event.emoji.name === "🎁") {
                                                    gifterReaction.push(event.userID); // Adds the reactors to the array
                                                    // GIFTER REACTION: If the player who initiated the gift process reacted to the gift emoji reaction,
                                                    // the gift process completes and all relevant components of the player's information and the card's
                                                    // information are updated.
                                                    if (gifterReaction.includes(gifter.userID)) {

                                                        for (i = 0; i < cards.length; i++) {

                                                            // UPDATE CARDS: Cycles through all of the cards that are being gifted and updates each individual
                                                            // card's information. The quantitative count data is updated.
                                                            cards[i].labels = []
                                                            cards[i].timesGifted += 1
                                                            cards[i].gifted = true
                                                            cards[i].owner.push(giftee.userID)
                                                            cards[i].save()

                                                            // UPDATE GIFTER: Removes all the gifted cards from the gifter's inventory and changes the gifter's
                                                            // quantitative data pertaining to card amount and the gifting process.
                                                            giftPlayer.inventory.splice(giftPlayer.inventory.indexOf(cards[i].code), 1)
                                                            giftPlayer.numCards -= 1;
                                                            giftPlayer.gifted += 1;

                                                            // UPDATE GIFTEE: All the gifted cards are inputed into the designated giftee's inventory and changes
                                                            // the giftee's quantiative data pertaining to card amount and the gifting process.
                                                            giftee.inventory.push(cards[i].code)
                                                            giftee.numCards += 1
                                                            giftee.giftsReceived += 1
                                                        }

                                                        giftPlayer.save() // Saves the gifter's information to the database
                                                        giftee.save() // Saves the giftee's information to the database

                                                        const giftCard = new Eris.RichEmbed()
                                                            .setTitle("**Successfully Gifted " + cardAmount + "**")
                                                            .setDescription(gift.slice((page) * 10 - 10, (page) * 10).toString().replace(/,/g, ""))
                                                            .setColor("#9370DB")
                                                            .setImage("attachment://giftCard.png")
                                                            .setFooter(`${initiator.username}#${initiator.discriminator} | Gifted to ${receiverName}#${receiverDiscriminator}`, initiator.avatarURL, initiator.avatarURL)

                                                        message.edit({ embed: giftCard }, { attachments: [] })

                                                        message.removeReactions("🔥")
                                                        message.removeReactions("❌")
                                                        message.removeReactions('◀️')
                                                        message.removeReactions('▶️')
                                                    }

                                                }
                                            })
                                        })
                                } else if (gift.length > 11) {
                                    message.channel.createMessage({ embed: giftingCard })
                                        .then(message => {
                                            message.addReaction("🎁")
                                            message.addReaction("❌")
                                            message.addReaction('◀️')
                                            message.addReaction('▶️')

                                            const reactionListener = new ReactionHandler.continuousReactionStream(
                                                message,
                                                (userID) => userID != message.author.id,
                                                false,
                                                { max: 100, time: 60000 }
                                            );

                                            reactionListener.on('reacted', async (event) => {
                                                const giftPlayer = await user.findOne({ userID: gifter.userID })
                                                if (event.emoji.name === "◀️") {
                                                    if (page == 1) return;
                                                    page--;
                                                    giftingCard.setDescription(gift.slice((page) * 10 - 10, (page) * 10).toString().replace(/,/g, ""))
                                                    message.edit({ embed: giftingCard })
                                                }
                                                if (event.emoji.name === "▶️") {
                                                    if (page == pages.length) return;
                                                    page++;
                                                    giftingCard.setDescription(gift.slice((page) * 10 - 10, (page) * 10).toString().replace(/,/g, ""))
                                                    message.edit({ embed: giftingCard })
                                                }
                                                const gifterReaction = []
                                                if (event.emoji.name === "❌") {
                                                    gifterReaction.push(event.userID); // Adds the reactors of the "x" emoji to the array
                                                    // GIFTER REACTION: If the player who initiated the gift process reacted to the "x" emoji reaction,
                                                    // the gift process is canceled.
                                                    if (gifterReaction.includes(gifter.userID)) {
                                                        const giftCard = new Eris.RichEmbed()
                                                            .setTitle("**Gift Canceled**")
                                                            .setDescription(gift.slice((page) * 10 - 10, (page) * 10).toString().replace(/,/g, ""))
                                                            .setColor("#ff4d6d")
                                                            .setImage("attachment://giftCard.png")
                                                            .setFooter(`${initiator.username}#${initiator.discriminator} | Canceled Gift to ${receiverName}#${receiverDiscriminator}`, initiator.avatarURL, initiator.avatarURL)
                                                        message.edit({ embed: giftCard }, { attachments: [] })

                                                        message.removeReactions("🎁")
                                                        message.removeReactions("❌")
                                                        message.removeReactions('◀️')
                                                        message.removeReactions('▶️')
                                                    }
                                                } if (event.emoji.name === "🎁") {
                                                    gifterReaction.push(event.userID); // Adds the reactors to the array
                                                    // GIFTER REACTION: If the player who initiated the gift process reacted to the gift emoji reaction,
                                                    // the gift process completes and all relevant components of the player's information and the card's
                                                    // information are updated.
                                                    if (gifterReaction.includes(gifter.userID)) {

                                                        for (i = 0; i < cards.length; i++) {

                                                            // UPDATE CARDS: Cycles through all of the cards that are being gifted and updates each individual
                                                            // card's information. The quantitative count data is updated.
                                                            cards[i].labels = []
                                                            cards[i].timesGifted += 1
                                                            cards[i].gifted = true
                                                            cards[i].owner.push(giftee.userID)
                                                            cards[i].save()

                                                            // UPDATE GIFTER: Removes all the gifted cards from the gifter's inventory and changes the gifter's
                                                            // quantitative data pertaining to card amount and the gifting process.
                                                            var cardIndex = gifter.inventory.indexOf(cards[i].code)
                                                            giftPlayer.inventory.splice(cardIndex, 1)
                                                            gifPlayer.numCards -= 1;
                                                            giftPlayer.gifted += 1;

                                                            // UPDATE GIFTEE: All the gifted cards are inputed into the designated giftee's inventory and changes
                                                            // the giftee's quantiative data pertaining to card amount and the gifting process.
                                                            giftee.inventory.push(cards[i].code)
                                                            giftee.numCards += 1
                                                            giftee.giftsReceived += 1
                                                        }

                                                        giftPlayer.save() // Saves the gifter's information to the database
                                                        giftee.save() // Saves the giftee's information to the database

                                                        const giftCard = new Eris.RichEmbed()
                                                            .setTitle("**Successfully Gifted " + cardAmount + "**")
                                                            .setDescription(gift.slice((page) * 10 - 10, (page) * 10).toString().replace(/,/g, ""))
                                                            .setColor("#9370DB")
                                                            .setImage("attachment://giftCard.png")
                                                            .setFooter(`${initiator.username}#${initiator.discriminator} | Gifted to ${receiverName}#${receiverDiscriminator}`, initiator.avatarURL, initiator.avatarURL)

                                                        message.edit({ embed: giftCard }, { attachments: [] })

                                                        message.removeReactions("🔥")
                                                        message.removeReactions("❌")
                                                        message.removeReactions('◀️')
                                                        message.removeReactions('▶️')
                                                    }

                                                }

                                            })
                                        })
                                }
                            }

                        } else {
                            const noCard = new Eris.RichEmbed()
                                .setTitle("")
                                .setDescription("<:exclaim:906289233814241290> A valid card code must be provided. Cards with the given information cannot be found within your inventory.")
                                .setColor("#9370DB")
                                .setFooter(`${initiator.username}#${initiator.discriminator} | Cards Not Found`, initiator.avatarURL, initiator.avatarURL)
                            message.channel.createMessage({ embed: noCard })
                        }

                    } else {
                        const noCard = new Eris.RichEmbed()
                            .setTitle("")
                            .setDescription("<:exclaim:906289233814241290> A valid card code must be provided. Cards with the given information cannot be found within your inventory.")
                            .setColor("#9370DB")
                            .setFooter(`${initiator.username}#${initiator.discriminator} | Cards Not Found`, initiator.avatarURL, initiator.avatarURL)
                        message.channel.createMessage({ embed: noCard })
                    }

                } else {
                    const noPlayer = new Eris.RichEmbed()
                        .setTitle("")
                        .setDescription("<:exclaim:906289233814241290> No player with the given information can be gifted or found within the Icon playerbase")
                        .setColor("#9370DB")
                        .setFooter(`${initiator.username}#${initiator.discriminator} | Gift Failed`, initiator.avatarURL, initiator.avatarURL)
                    message.channel.createMessage({ embed: noPlayer })
                }

            }
        }
    }
}

