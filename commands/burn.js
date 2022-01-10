/*---------------------------------------LOADING IN THE PACKAGES---------------------------------------*/
// CANVAS: Provides all the necessary components of Canvas and its related packages. The fonts used
// on the displayed cards registered with the registerFont component of Canvas.
const Canvas = require('canvas');
const { registerFont } = require('canvas');
registerFont('./fonts/Prompt-Bold.ttf', { family: 'Prompt-Bold' })
registerFont('./fonts/Prompt-Medium.ttf', { family: 'Prompt-Medium' })
registerFont('./fonts/Prompt-Regular.ttf', { family: 'Prompt' })

// MODELS: Gets the necessary data models from the database to complete the burn process
const claimedCards = require('../models/claimedCards.js');
const user = require('../models/user.js');

// REACTION HANDLER: Allows the player to interact with the embeds
const ReactionHandler = require('eris-reactions');

/*-------------------------------------BURN COMMAND: BEGINNING OF BURN PROCESS---------------------------------------*/
module.exports = {
    name: 'burn',
    description: "Gives players the opportunity to burn one or multiple cards for a reward of opals and/or diamonds",
    aliases: ["b"],
    async execute(client, message, args, Eris) {

        const player = message.member.user; // Receives the information of the messaging player
        var messageID = ""; // Stores the ID of the message for later use

        if (args != undefined && args != null) {
            const burner = await user.findOne({ userID: player.id }) // Receives the players information

            // ARGS: Begins the Burn Process as long as the player inputs more than one argument
            if (args.length >= 1) {
                const cardCodes = args // Stores the arguments as a variable called "cardCodes"
                const label = args // Stores the arguments as a variable called "label"
                const matchedCards = [] // Array that will contain all the card codes a player chooses to burn

                // CARD CODES: Matches the card codes chosen by the player to cards in their inventory. If any of the cards
                // match, they will be added to the "matchedCards" array that will determine the cards to be burned.
                for (i = 0; i < burner.inventory.length; i++) {
                    for (j = 0; j < cardCodes.length; j++) {
                        if (cardCodes[j].includes(",")) {
                            cardCodes[j] = cardCodes[j].replace(",", "")
                        }
                        if (burner.inventory[i].toLowerCase() == cardCodes[j].toLowerCase()) {
                            matchedCards.push(burner.inventory[i]) // Saves the matched card codes
                        }
                    }
                }

                // LABELS: If instead of a player typing in card codes, they instead want to burn cards by label, this 
                // gets the label name typed and matches it to an actual label on cards.
                const burnerLabels = []

                for (i = 0; i < burner.labels.length; i++) {
                    if (burner.labels[i].substr(burner.labels[i].indexOf(' ') + 1) == label.slice(0, label.length)) {
                        burnerLabels.push(burner.labels[i])
                    }
                }

                var labelHeader = ""
                if (burnerLabels.length >= 1) {
                    if (burnerLabels.length == 1) {
                        labelHeader = burnerLabels.toString().replace(/,/g, "") + "\n\n"
                    } else {
                        labelHeader = burnerLabels.toString().replace(/,/g, "") + "\n\n"
                    }
                }

                // CHOSEN CARDS: Returns all the documents that are provided by the query. Cards with
                // both the player as the owner and chosen card codes / labels will be found and provided.
                const cards = await claimedCards.find({ $or: [{ $and: [{ owner: player.id }, { code: { $in: matchedCards } }] }, { $and: [{ owner: player.id }, { labels: { $in: burnerLabels } }] }] })

                /*-----------------------------PROVIDE PLAYER OPTION TO BURN CARDS------------------------------*/

                // CARDS LENGTH: Checks if there is at least one card inputted correctly by the player. If so,
                // the player will view an embed containing the cards to burn and the resulting amount that will be
                // received from burning.

                var opals = 0 // Stores the total amount of opals received throughout the burn process
                var diamonds = 0 // Stores the amount of diamonds won throughout the burn process
                var wonDiamonds = false // Checks whether diamonds were won during the process

                var pageCount = 0
                var page = 1
                const pages = []

                if (cards.length != 0) {

                    const burnedList = []

                    for (i = 0; i < cards.length; i++) {
                        if (cards.length == 1) {
                            if (cards[i].name == "Group") {
                                burnedList.push("<:cards:900131721855516743> `" + cards[i].code + "` **#" + cards[i].issue + " " + cards[i].group.toUpperCase() + "**\n" + cards[i].era + "\n" + cards[i].stars)
                            } else {
                                burnedList.push("<:cards:900131721855516743> `" + cards[i].code + "` **#" + cards[i].issue + " " + cards[i].group.toUpperCase() + " " + cards[i].name.toUpperCase() + "**\n" + cards[i].era + "\n" + cards[i].stars)
                            }
                        } else {
                            if (cards[i].name == "Group") {
                                burnedList.push("<:cards:900131721855516743> `" + cards[i].code + "` " + cards[i].stars + " **#" + cards[i].issue + " " + cards[i].group + "**\n")

                            } else {
                                burnedList.push("<:cards:900131721855516743> `" + cards[i].code + "` " + cards[i].stars + " **#" + cards[i].issue + " " + cards[i].group + "** " + cards[i].name + "\n")
                            }
                        }

                        if (i % 10 == 0) {
                            pageCount += 1; // Adds a page every 10 cards in the list
                            pages.push(pageCount)
                        }

                        opals += Math.round(cards[i].worth * .65) // Adds 65% of the total worth of each card in opals and rounds it to the nearest integer amount
                        var diamondChance; // Randomizes chance 1-3 for how many diamonds are won per card

                        // DIAMONDS: For each card, diamonds are able to be won. Depending on the condition of the card,
                        // there are different likelihoods of winning diamonds. Pristine (5 Star) has the best chance for winning 
                        // diamonds, while Poor (0 Stars) cannot win any diamonds. If diamonds have been won, it will randomize
                        // between 1-3 diamonds to give the player.
                        wonDiamonds = true
                        diamondChance = Math.floor(Math.random() * 100) + 1
                        if (diamondChance >= 1 && diamondChance <= 70) {
                            diamonds += 1
                        } else if (diamondChance >= 71 && diamondChance <= 90) {
                            diamonds += 2
                        } else if (diamondChance >= 91 && diamondChance <= 100) {
                            diamonds += 3
                        }
                    }

                    var cardAmount = ""
                    var cardAttachment;

                    var messageOutput;

                    // ONE CARD: If there is only one card given to burn, the card information and its physical
                    // form will be displayed. 
                    if (burnedList.length == 1) {

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

                            embedColor = cards.hues[0]

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
                        cardAttachment = { file: buffer, name: "burnCard.png" }; // Buffers the image and create an attachment

                        cardAmount = "Card" // Stores "Card" for further use for defining the amount of cards on the embed

                        const burningCard = new Eris.RichEmbed()
                            .setTitle("**Burn Card**")
                            .setDescription("" + labelHeader + "" + burnedList + "\n\n**Opals Offered**\n" + opals + " <:opal:899430579831988275>\n**Diamonds Offered**\n1-" + burnedList.length * 3 + " <:diamond:898641993511628800>")
                            .setColor("#33A7FF")
                            .setImage("attachment://burnCard.png")
                            .setFooter(`${player.username}#${player.discriminator} | Burning Card`, player.avatarURL, player.avatarURL)
                        messageOutput = await message.channel.createMessage({ embed: burningCard }, cardAttachment)
                        messageID = Object.values(messageOutput)[0]
                        message.channel.getMessage(messageID)
                            .then(message => {
                                message.addReaction("🔥")
                                message.addReaction("❌")
                            })

                        // MULTIPLE CARDS: If multiple cards are being burned, it will switch to providing embed formatting for multiple cards
                    } else {
                        cardAmount = "Cards" // Stores "Cards" for further use for defining the amount of cards on the embed
                        const burningCard = new Eris.RichEmbed()
                            .setTitle("**Burn Cards**")
                            .setDescription("" + labelHeader + "" + burnedList.slice((page) * 10 - 10, (page) * 10).toString().replace(/,/g, "") + "\n**Opals Offered**\n" + opals + " <:opal:899430579831988275>\n**Diamonds Offered**\n1-" + burnedList.length * 3 + " <:diamond:898641993511628800>")
                            .setColor("#33A7FF")
                            .setFooter(`${player.username}#${player.discriminator} | Burning ` + burnedList.length + ` Cards`, player.avatarURL, player.avatarURL)
                        messageOutput = await message.channel.createMessage({ embed: burningCard }) // Awaits the creation of the burn embed
                        messageID = Object.values(messageOutput)[0] // Gets the ID of the message that was created
                        if (burnedList.length < 11) {
                            message.channel.getMessage(messageID)
                                .then(message => {
                                    message.addReaction("🔥")
                                    message.addReaction("❌")
                                })

                        } else if (burnedList.length >= 11) {
                            message.channel.getMessage(messageID)
                                .then(message => {
                                    message.addReaction("🔥")
                                    message.addReaction("❌")
                                    message.addReaction('◀️')
                                    message.addReaction('▶️')

                                    const reactionListener = new ReactionHandler.continuousReactionStream(
                                        message,
                                        (userID) => userID != message.author.id,
                                        false,
                                        { max: 100, time: 60000 }
                                    );

                                    reactionListener.on('reacted', (event) => {
                                        if (event.emoji.name === "◀️") {
                                            if (page == 1) return;
                                            page--;
                                            burningCard.setDescription("" + burnedList.slice((page) * 10 - 10, (page) * 10).toString().replace(/,/g, "") + "\n" + labelHeader + "**\n**Opals Offered**\n" + opals + " <:opal:899430579831988275>\n**Diamonds Offered**\n1-" + burnedList.length * 3 + " <:diamond:898641993511628800>")
                                            message.edit({ embed: burningCard })
                                        }
                                        if (event.emoji.name === "▶️") {
                                            if (page == pages.length) return;
                                            page++;
                                            burningCard.setDescription("" + burnedList.slice((page) * 10 - 10, (page) * 10).toString().replace(/,/g, "") + "\n" + labelHeader + "\n**Opals Offered**\n" + opals + " <:opal:899430579831988275>\n**Diamonds Offered**\n1-" + burnedList.length * 3 + " <:diamond:898641993511628800>")
                                            message.edit({ embed: burningCard })
                                        }

                                    })
                                })
                        }
                    }

                    message.channel.getMessage(messageID) // Gets the correct message by its ID
                        .then(message => {
                            const reactionListener = new ReactionHandler.continuousReactionStream(
                                message,
                                (userID) => userID !== message.author.id,
                                false,
                                // In case other players try to react, it will allot four reactions
                                { maxMatches: 4, time: 60000 }
                            );
                            reactionListener.on('reacted', async (event) => {
                                const burnerReaction = []
                                if (event.emoji.name === "❌") {
                                    burnerReaction.push(event.userID); // Adds the reactors of the "x" emoji to the array
                                    // BURNER REACTION: If the player who initiated the burn process reacted to the "x" emoji reaction,
                                    // the burn process is canceled.
                                    if (burnerReaction.includes(burner.userID)) {
                                        const burnedCard = new Eris.RichEmbed()
                                            .setTitle("**Burn Canceled**")
                                            .setDescription(burnedList.slice((page) * 10 - 10, (page) * 10).toString().replace(/,/g, ""))
                                            .setColor("#ff4d6d")
                                            .setImage("attachment://burnCard.png")
                                            .setFooter(`${player.username}#${player.discriminator} | Canceled Burn`, player.avatarURL, player.avatarURL)
                                        if (burnedList.length == 1) {
                                            message.edit({ embed: burnedCard }, cardAttachment)
                                        } else {
                                            message.edit({ embed: burnedCard }, { attachments: [] })
                                        }
                                        message.removeReactions("🔥")
                                        message.removeReactions("❌")
                                        message.removeReactions('◀️')
                                        message.removeReactions('▶️')
                                    }
                                } if (event.emoji.name === "🔥") {
                                    burnerReaction.push(event.userID); // Adds the reactors to the array
                                    // BURNER REACTION: If the player who initiated the burn process reacted to the burn emoji reaction,
                                    // the burn process completes and all relevant components of the player's information and the card's
                                    // information are updated.
                                    if (burnerReaction.includes(burner.userID)) {

                                        burner.diamonds += diamonds
                                        burner.opals += opals

                                        // HICON: Receives the database profile of hicon. When a card less than 100 issue is burned
                                        // it will directly go into the profile of hicon.
                                        const hicon = await user.findOne({ userID: "881301440071618600" })

                                        for (i = 0; i < cards.length; i++) {
                                            cards[i].stickers = [] // Removes all the stickers from a card
                                            cards[i].cosmetics = [{ name: "Barcode", image: './img/cosmetics/misc/Barcode.png', x: 477, y: 20, w: 90, h: 40 }] // Defaults the cosmetics back to their original state
                                            cards[i].frame = { name: "Default", image: './img/cosmetics/frames/Default_Frame.png', x: 0, y: 0, w: 600, h: 900 } // Defaults the frame back to its original state
                                            cards[i].labels = [] // Removes the labels from the card
                                            cards[i].hues = [] // Removes all the hues from a card
                                            cards[i].hueApplied = false // Sets the hueApplied value to false
                                            cards[i].timesBurned += 1 // Counts the number a card has been burned throughout its circulation in game
                                            cards[i].burned = true // Sets the burned value to true
                                            // < 100 ISSUE: If a card that is being burned is less than 100 issue, it will be sent
                                            // to icon for giveaways
                                            if (cards[i].issue < 100) {
                                                cards[i].owner.push("881301440071618600")
                                                hicon.inventory.push(cards[i].code) // Pushes the card code to hicon
                                            }
                                            cards[i].save()

                                            var cardIndex = burner.inventory.indexOf(cards[i].code) // Finds the index of the card in the inventory
                                            burner.inventory.splice(cardIndex, 1) // Removes the card code from its index in the inventory
                                            burner.numCards -= 1; // Subtracts the total amount of cards burned from the player
                                            burner.numBurned += 1; // Adds to the number a player has burned

                                        }
                                        hicon.save()
                                        burner.save()

                                        const burnedCard = new Eris.RichEmbed()
                                            .setTitle("**Successfully Burned " + cardAmount + "**")
                                            .setColor("#9370DB")
                                            .setImage("attachment://burnCard.png")
                                            .setFooter(`${player.username}#${player.discriminator} | Burning ` + burnedList.length + " " + cardAmount, player.avatarURL, player.avatarURL)
                                        if (burnedList.length == 1) {
                                            burnedCard.setDescription(labelHeader + " " + burnedList.slice((page) * 10 - 10, (page) * 10).toString().replace(/,/g, "") + "\n\n**Opals Received**\n" + opals + " <:opal:899430579831988275>\n**Diamonds Received**\n" + diamonds + " <:diamond:898641993511628800>")
                                            message.edit({ embed: burnedCard }, cardAttachment)
                                        } else {
                                            burnedCard.setDescription(labelHeader + " " + burnedList.slice((page) * 10 - 10, (page) * 10).toString().replace(/,/g, "") + "\n**Opals Received**\n" + opals + " <:opal:899430579831988275>\n**Diamonds Received**\n" + diamonds + " <:diamond:898641993511628800>")
                                            message.edit({ embed: burnedCard }, { attachments: [] })
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
                    var codeAmount = ""
                    var labelAmount = ""
                    if (args.length == 1) {
                        codeAmount = "code"
                        labelAmount = "label"
                    } else {
                        codeAmount = "codes"
                        labelAmount = "labels"
                    }
                    const burnedCard = new Eris.RichEmbed()
                        .setTitle("")
                        .setDescription("<:exclaim:906289233814241290> The card " + codeAmount + " or " + labelAmount + " provided cannot be found within your inventory")
                        .setColor("#9370DB")
                        .setFooter(`${player.username}#${player.discriminator} | Card Not Found`, player.avatarURL, player.avatarURL)
                    message.channel.createMessage({ embed: burnedCard })
                }
            } else {
                const noSearch = new Eris.RichEmbed()
                    .setTitle("")
                    .setDescription("<:exclaim:906289233814241290> Input card codes or labels in order to proceed with the burn process")
                    .setColor("#9370DB")
                    .setFooter(`${player.username}#${player.discriminator} | Invalid format`, player.avatarURL, player.avatarURL)
                message.channel.createMessage({ embed: noSearch })
            }
        }
    }
}