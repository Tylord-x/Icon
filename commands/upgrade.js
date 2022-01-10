/*---------------------------------------LOADING IN THE PACKAGES---------------------------------------*/
// CANVAS: Provides all the necessary components of Canvas and its related packages. The fonts used
// on the displayed cards registered with the registerFont component of Canvas.
const Canvas = require('canvas');
const { registerFont } = require('canvas');
registerFont('./fonts/Prompt-Bold.ttf', { family: 'Prompt-Bold' })
registerFont('./fonts/Prompt-Medium.ttf', { family: 'Prompt-Medium' })
registerFont('./fonts/Prompt-Regular.ttf', { family: 'Prompt' })

// MODELS: Gets the necessary data models from the database to complete the upgrade process
const claimedCards = require('../models/claimedCards.js');
const user = require('../models/user.js');

// REACTION HANDLER: Allows the player to interact with the embeds
const ReactionHandler = require('eris-reactions');

/*-------------------------------------UPGRADE COMMAND: BEGINNING OF UPGRADING PROCESS---------------------------------------*/
module.exports = {
    name: 'upgrade',
    description: "Gives players the opportunity to upgrade cards for the price of opals",
    aliases: ["u", "upg"],
    async execute(client, message, args, Eris) {
        const player = message.member.user; // Stores the player who is upgrading cards
        const upgrader = await user.findOne({ userID: player.id }) // Stores the database profile for upgrading player
        const cardCodes = args // Stores the card code of the card being upgraded
        var messageID = ""

        // MATCH CODE: Compares the typed code against the player's inventory to confirm if the card is currently 
        // owned by the player
        const matchCodes = [];
        for (i = 0; i < upgrader.inventory.length; i++) {
            for (j = 0; j < cardCodes.length; j++) {
                if (cardCodes[j].includes(",")) {
                    cardCodes[j] = cardCodes[j].replace(",", "")
                }
                if (upgrader.inventory[i].toLowerCase() == cardCodes[j].toLowerCase()) {
                    matchCodes.push(upgrader.inventory[i])
                }
            }
        }

        if (matchCodes != null && matchCodes != undefined) {
            const cards = await claimedCards.find({ $and: [{ owner: upgrader.userID }, { code: { $in: matchCodes } }] })

            if (cards.length != 0) {

                var pageCount = 0
                var page = 1
                const pages = []

                var totalCost = 0

                const upgrade = []
                const upgradeInfo = []
                for (i = 0; i < cards.length; i++) {
                    if (cards[i].condition != 5) {
                        if (cards.length == 1) {
                            if (cards[i].name == "Group") {
                                upgrade.push("<:cards:900131721855516743> `" + cards[i].code + "` **#" + cards[i].issue + " " + cards[i].group.toUpperCase() + "**\n" + cards[i].era + "\n" + cards[i].stars)
                            } else {
                                upgrade.push("<:cards:900131721855516743> `" + cards[i].code + "` **#" + cards[i].issue + " " + cards[i].group.toUpperCase() + " " + cards[i].name.toUpperCase() + "**\n" + cards[i].era + "\n" + cards[i].stars)
                            }
                        } else {
                            if (cards[i].name == "Group") {
                                upgrade.push("<:cards:900131721855516743> `" + cards[i].code + "` " + cards[i].stars + " **#" + cards[i].issue + " " + cards[i].group + "**\n")

                            } else {
                                upgrade.push("<:cards:900131721855516743> `" + cards[i].code + "` " + cards[i].stars + " **#" + cards[i].issue + " " + cards[i].group + "** " + cards[i].name + "\n")
                            }
                        }
                        //UPGRADE COST: Each card will cost 65% of its worth to upgrade
                        totalCost += Math.round(cards[i].worth * .65)
                    }
                    if (i % 10 == 0) {
                        pageCount += 1;
                        pages.push(pageCount)
                    }

                    /*-------------------------------------------UPGRADE CHANCE-----------------------------------------*/

                    // SETTING UP UPGRADE: Based on the condition of each card, there is a different likelihood the card will be 
                    // upgraded. 

                    var upgradeChance = 0
                    var condition = 0
                    var nameCondition = ""
                    var stars = ""
                    var conditionWorth = 0
                    var issueWorth = 0
                    var cardWorth = 0
                    if (cards[i].condition == 0) {
                        upgradeChance = 85
                        nameCondition = "Bad"
                        stars = "◆◇◇◇◇"
                        conditionWorth = 10
                        issueWorth = (cards[i].worth - (0 * 0))
                    } else if (cards[i].condition == 1) {
                        upgradeChance = 60
                        nameCondition = "Fine"
                        stars = "◆◆◇◇◇"
                        conditionWorth = 20
                        issueWorth = (cards[i].worth - (10 * 1))
                    } else if (cards[i].condition == 2) {
                        upgradeChance = 40
                        nameCondition = "Good"
                        stars = "◆◆◆◇◇"
                        conditionWorth = 40
                        issueWorth = (cards[i].worth - (20 * 2))
                    } else if (cards[i].condition == 3) {
                        upgradeChance = 30
                        nameCondition = "Excellent"
                        stars = "◆◆◆◆◇"
                        conditionWorth = 60
                        issueWorth = (cards[i].worth - (40 * 3))
                    } else if (cards[i].condition == 4) {
                        upgradeChance = 25
                        nameCondition = "Pristine"
                        stars = "◆◆◆◆◆"
                        conditionWorth = 80
                        issueWorth = (cards[i].worth - (60 * 4))
                    }

                    const chance = Math.floor(Math.random() * 100) + 1; // Randomizes upgrade chance 1-100 
                    var choseUpgrade = false
                    if (chance >= 1 && chance <= upgradeChance) {
                        choseUpgrade = true
                        condition = cards[i].condition + 1
                        cardWorth = (condition * conditionWorth) + issueWorth
                        upgradeInfo.push({ card: cards[i], upgraded: true, condition: condition, nameCondition: nameCondition, stars: stars, worth: cardWorth })
                    }
                }

                var cardAmount = ""
                var messageOutput;
                var cardAttachment;
                if (cards.length == 1) {
                    const card = cards[0]

                    /*--------------------------------------CARDS COMPONENTS-------------------------------------*/
                    //CANVAS: Creates a canvas to hold all of the card components to be displayed in the embed
                    const canvas = Canvas.createCanvas(600, 900);
                    const context = canvas.getContext('2d');
                    const background = await Canvas.loadImage('transparent.png');
                    context.drawImage(background, 0, 0, canvas.width, canvas.height);

                    // MAIN IMAGE: Gets the overall main image of the card, which is either an idol or a group
                    const idolMainImage = await Canvas.loadImage(card.mainImage);
                    context.drawImage(idolMainImage, 30, 75, 540, 657);

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
                    } else {
                        context.fillStyle = "#313131";
                        context.fillRect(0, 0, 34, 900);
                        context.fillStyle = "#313131";
                        context.fillRect(565, 0, 35, 900);
                        context.fillStyle = "#313131";
                        context.fillRect(0, 729, 600, 171);
                        context.fillStyle = "#313131";
                        context.fillRect(0, 0, 600, 76);
                    }

                    // FRAME: Receives the frame currently applied to the card and adds it to the canvas
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

                    cardAmount = "Card"

                    const buffer = canvas.toBuffer();
                    cardAttachment = { file: buffer, name: "upgradeCard.png" }; // Buffers the image and create an attachment
                    const upgradingCard = new Eris.RichEmbed()
                        .setTitle("**Upgrade Card**")
                        .setDescription(upgrade.slice((page) * 10 - 10, (page) * 10).toString().replace(/,/g, "") + "\n\n**Cost**\n" + totalCost + " <:opal:899430579831988275>")
                        .setColor("#33A7FF")
                        .setImage("attachment://upgradeCard.png")
                        .setFooter(`${player.username}#${player.discriminator} | Upgrading Card`, player.avatarURL, player.avatarURL)
                    messageOutput = await message.channel.createMessage({ embed: upgradingCard }, cardAttachment)
                    messageID = Object.values(messageOutput)[0]
                    message.channel.getMessage(messageID)
                        .then(message => {
                            message.addReaction("⭐")
                            message.addReaction("❌")
                        })
                } else {
                    cardAmount = "Cards"
                    const upgradingCard = new Eris.RichEmbed()
                        .setTitle("**Upgrade Cards**")
                        .setDescription(upgrade.slice((page) * 10 - 10, (page) * 10).toString().replace(/,/g, "") + "\n**Cost**\n" + totalCost + " <:opal:899430579831988275>")
                        .setColor("#33A7FF")
                        .setImage("attachment://upgradeCard.png")
                        .setFooter(`${player.username}#${player.discriminator} | Upgrading Card`, player.avatarURL, player.avatarURL)
                    messageOutput = await message.channel.createMessage({ embed: upgradingCard })
                    messageID = Object.values(messageOutput)[0]
                    if (upgrade.length < 11) {
                        message.channel.getMessage(messageID)
                            .then(message => {
                                message.addReaction("⭐")
                                message.addReaction("❌")
                            })

                    } else if (upgrade.length >= 11) {
                        const upgradingCard = new Eris.RichEmbed()
                            .setTitle("**Upgrade Cards**")
                            .setDescription(upgrade.slice((page) * 10 - 10, (page) * 10).toString().replace(/,/g, "") + "\n**Cost**\n" + totalCost + " <:opal:899430579831988275>")
                            .setColor("#33A7FF")
                            .setFooter(`${player.username}#${player.discriminator} | Upgrading Cards`, player.avatarURL, player.avatarURL)
                        messageOutput = await message.channel.createMessage({ embed: upgradingCard })
                        messageID = Object.values(messageOutput)[0]
                        message.channel.getMessage(messageID)
                            .then(message => {
                                message.addReaction("⭐")
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
                                        upgradingCard.setDescription(upgrade.slice((page) * 10 - 10, (page) * 10).toString().replace(/,/g, "") + "\n**Cost**\n" + totalCost + " <:opal:899430579831988275>")
                                        message.edit({ embed: upgradingCard })
                                    }
                                    if (event.emoji.name === "▶️") {
                                        if (page == pages.length) return;
                                        page++;
                                        upgradingCard.setDescription(upgrade.slice((page) * 10 - 10, (page) * 10).toString().replace(/,/g, "") + "\n**Cost**\n" + totalCost + " <:opal:899430579831988275>")
                                        message.edit({ embed: upgradingCard })
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
                            const upgraderReaction = []
                            if (event.emoji.name == "❌") {
                                upgraderReaction.push(event.userID); // Adds the reactors of the "x" emoji to the array
                                // UPGRADER REACTION: If the player who initiated the burn process reacted to the "x" emoji reaction,
                                // the upgrade process is canceled.
                                console.log(upgraderReaction)
                                if (upgraderReaction.includes(upgrader.userID)) {
                                    const upgradingCard = new Eris.RichEmbed()
                                        .setTitle("**Upgrade Canceled**")
                                        .setDescription(upgrade.slice((page) * 10 - 10, (page) * 10).toString().replace(/,/g, ""))
                                        .setColor("#ff4d6d")
                                        .setImage("attachment://upgradeCard.png")
                                        .setFooter(`${player.username}#${player.discriminator} | Canceled Upgrade`, player.avatarURL, player.avatarURL)
                                    if (upgrade.length == 1) {
                                        message.edit({ embed: upgradingCard }, cardAttachment)
                                    } else {
                                        message.edit({ embed: upgradingCard }, { attachments: [] })
                                    }
                                    message.removeReactions("⭐")
                                    message.removeReactions("❌")
                                    message.removeReactions('◀️')
                                    message.removeReactions('▶️')
                                }
                            } if (event.emoji.name == "⭐") {
                                upgraderReaction.push(event.userID); // Adds the reactors to the array
                                // UPGRADER REACTION: If the player who initiated the upgrade process reacted to the star emoji reaction,
                                // the upgrade process completes and all relevant components of the player's information and the card's
                                // information are updated.
                                if (upgraderReaction.includes(upgrader.userID)) {
                                    if (upgrader.opals >= totalCost) {

                                        if (upgradeInfo.length != 0) {

                                            const successfulUpgrade = []
                                            for (i = 0; i < upgradeInfo.length; i++) {
                                                var card = await claimedCards.findOne({ code: upgradeInfo[i].card.code })
                                                card.condition = upgradeInfo[i].condition
                                                card.nameCondition = upgradeInfo[i].nameCondition
                                                card.stars = upgradeInfo[i].stars
                                                card.worth = upgradeInfo[i].worth
                                                card.timesUpgraded += 1
                                                card.upgraded = true
                                                card.save()

                                                if (upgradeInfo.length == 1) {
                                                    if (card.name == "Group") {
                                                        successfulUpgrade.push("<:cards:900131721855516743> `" + card.code + "` **#" + card.issue + " " + card.group.toUpperCase() + "**\n" + card.era + "\n" + card.stars)
                                                    } else {
                                                        successfulUpgrade.push("<:cards:900131721855516743> `" + card.code + "` **#" + card.issue + " " + card.group.toUpperCase() + " " + card.name.toUpperCase() + "**\n" + card.era + "\n" + card.stars)
                                                    }
                                                } else {
                                                    if (cards[i].name == "Group") {
                                                        successfulUpgrade.push("<:cards:900131721855516743> `" + card.code + "` " + card.stars + " **#" + card.issue + " " + card.group + "**\n")

                                                    } else {
                                                        successfulUpgrade.push("<:cards:900131721855516743> `" + card.code + "` " + card.stars + " **#" + card.issue + " " + card.group + "** " + card.name + "\n")
                                                    }
                                                }
                                            }

                                            upgrader.opals -= totalCost
                                            upgrader.save()

                                            var newAmount = ""
                                            if (successfulUpgrade.length == 1) {
                                                newAmount = "Card"
                                            } else {
                                                newAmount = "Cards"
                                            }
                                            const upgradingCard = new Eris.RichEmbed()
                                                .setTitle("**Successfully Upgraded " + newAmount + "**")
                                                .setDescription(successfulUpgrade.slice((page) * 10 - 10, (page) * 10).toString().replace(/,/g, ""))
                                                .setColor("#9370DB")
                                                .setImage("attachment://upgradeCard.png")
                                                .setFooter(`${player.username}#${player.discriminator} | Upgraded ` + successfulUpgrade.length + " " + newAmount, player.avatarURL, player.avatarURL)
                                            if (successfulUpgrade.length == 1) {
                                                message.edit({ embed: upgradingCard }, cardAttachment)
                                            } else {
                                                message.edit({ embed: upgradingCard }, { attachments: [] })
                                            }
                                            message.removeReactions("⭐")
                                            message.removeReactions("❌")
                                            message.removeReactions('◀️')
                                            message.removeReactions('▶️')
                                        } else {
                                            upgrader.opals -= totalCost
                                            upgrader.save()
                                            const upgradingCard = new Eris.RichEmbed()
                                                .setTitle("**Upgrade Failed**")
                                                .setDescription(upgrade.slice((page) * 10 - 10, (page) * 10).toString().replace(/,/g, ""))
                                                .setColor("#ff4d6d")
                                                .setImage("attachment://upgradeCard.png")
                                                .setFooter(`${player.username}#${player.discriminator} | Upgrading ` + cardAmount, player.avatarURL, player.avatarURL)
                                            if (upgrade.length == 1) {
                                                message.edit({ embed: upgradingCard }, cardAttachment)
                                            } else {
                                                message.edit({ embed: upgradingCard }, { attachments: [] })
                                            }
                                            message.removeReactions("⭐")
                                            message.removeReactions("❌")
                                            message.removeReactions('◀️')
                                            message.removeReactions('▶️')
                                        }
                                    } else {
                                        const upgradingCard = new Eris.RichEmbed()
                                            .setTitle("**Upgrade Failed**")
                                            .setDescription(upgrade.slice((page) * 10 - 10, (page) * 10).toString().replace(/,/g, ""))
                                            .setColor("#ff4d6d")
                                            .setImage("attachment://upgradeCard.png")
                                            .setFooter(`${player.username}#${player.discriminator} | Upgrading ` + cardAmount + ` | Insufficient Opals`, player.avatarURL, player.avatarURL)
                                        if (upgrade.length == 1) {
                                            message.edit({ embed: upgradingCard }, cardAttachment)
                                        } else {
                                            message.edit({ embed: upgradingCard }, { attachments: [] })
                                        }
                                        message.removeReactions("⭐")
                                        message.removeReactions("❌")
                                        message.removeReactions('◀️')
                                        message.removeReactions('▶️')
                                    }

                                }

                            }

                        })
                    })

            }
        }
    }
}
