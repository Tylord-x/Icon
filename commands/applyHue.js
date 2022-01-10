/*------------------------------------------------NEW CODE------------------------------*/


/*---------------------------------------LOADING IN THE PACKAGES-----------------------------------*/

// MODELS: Gets the necessary data model from the database to complete the applying frame process
const user = require('../models/user.js');
const claimedCards = require('../models/claimedCards.js');
const ownedHues = require('../models/ownedHues.js');
// CANVAS: Provides all the necessary components of Canvas and its related packages. The fonts used
// on the displayed cards registered with the registerFont component of Canvas.
const Canvas = require('canvas');
const { registerFont } = require('canvas');

registerFont('./fonts/Prompt-Bold.ttf', { family: 'Prompt-Bold' })
registerFont('./fonts/Prompt-Medium.ttf', { family: 'Prompt-Medium' })
registerFont('./fonts/Prompt-Regular.ttf', { family: 'Prompt' })

// REACTION HANDLER: Allows the player to interact with the embeds
const ReactionHandler = require('eris-reactions');

/*-----------------------------------HUE COMMAND: BEGINNING HUE PROCESS--------------------------*/
module.exports = {
    name: 'applyhue',
    description: "Allows players to apply hues to their cards",
    aliases: ['ah'],
    async execute(client, message, args, Eris) {
        const member = message.member.user;
        const applier = await user.findOne({ userID: member.id })
        const content = args

        if (content.length >= 2) {

            if (applier.inventory.length != 0) {
                const cardCode = content[0]

                var matchedCode;
                for (i = 0; i < applier.inventory.length; i++) {
                    if (applier.inventory[i] == cardCode.toLowerCase()) {
                        matchedCode = applier.inventory[i]
                    }
                }

                if (matchedCode != null && matchedCode != undefined) {
                    const card = await claimedCards.findOne({ code: matchedCode })

                    if (card != null && card != undefined) {
                        const hueCodes = content.slice(1, content.length)

                        const selectedHues = []
                        if (applier.hues.length != 0) {
                            for (i = 0; i < hueCodes.length; i++) {
                                for (j = 0; j < applier.hues.length; j++) {
                                    if (hueCodes[i].includes(",")) {
                                        hueCodes[i] = hueCodes[i].replace(",", "")
                                    }
                                    if (hueCodes[i].toLowerCase() == applier.hues[j]) {
                                        selectedHues.push(applier.hues[j])
                                    }
                                }
                            }

                            const hues = []
                            for (i = 0; i < selectedHues.length; i++) {
                                var hue = await ownedHues.findOne({ code: selectedHues[i] })
                                hues.push(hue)
                            }

                            if (hues.length != 0) {

                                if (hues.length <= 3) {

                                    var frameImage = ""
                                    if (card.frame.image.includes("Default")) {
                                        frameImage = "./img/cosmetics/frames/Default_Hue_Frame.png"
                                    } else {
                                        frameImage = card.frame.image
                                    }

                                    // CREATES CANVAS: Creates the initial canvas that contains the card components
                                    const canvas = Canvas.createCanvas(600, 900);
                                    const context = canvas.getContext('2d');
                                    const background = await Canvas.loadImage('transparent.png');
                                    context.drawImage(background, 0, 0, canvas.width, canvas.height);


                                    /*---------------------------------------IMAGES AND COSMETICS------------------------------------*/

                                    // MAIN IMAGE: Gets the overall main image of the card, which is either an idol or a group
                                    const idolMainImage = await Canvas.loadImage(card.mainImage);
                                    context.drawImage(idolMainImage, 30, 75, 540, 657);


                                    /*---------------------------------HUE APPLICATION---------------------------------*/


                                    const huesList = []

                                    context.fillStyle = hues[0].hexCode;
                                    context.fillRect(0, 0, 34, 900);
                                    context.fillStyle = hues[hues.length - 1].hexCode;
                                    context.fillRect(565, 0, 35, 900);

                                    var lowerGradient = context.createLinearGradient(((1 / hues.length) * 100), 729, (600 - ((1 / hues.length) * 100)), 729);

                                    for (i = 0; i < hues.length; i++) {
                                        if (hues.length == 1) {
                                            lowerGradient.addColorStop(i * (1 / (hues.length)), hues[i].hexCode);
                                        } if (hues.length == 2) {
                                            lowerGradient.addColorStop(i * (1 / (hues.length - 1)), hues[i].hexCode);
                                        } if (hues.length == 3) {
                                            lowerGradient.addColorStop(i * (1 / (hues.length - 0.8)), hues[i].hexCode);
                                        }
                                    }


                                    var higherGradient = context.createLinearGradient(((1 / hues.length) * 100), 76, (600 - ((1 / hues.length) * 100)), 76);

                                    for (i = 0; i < hues.length; i++) {
                                        if (hues.length == 1) {
                                            higherGradient.addColorStop(i * (1 / (hues.length)), hues[i].hexCode);
                                        } if (hues.length == 2) {
                                            higherGradient.addColorStop(i * (1 / (hues.length - 1)), hues[i].hexCode);
                                        } if (hues.length == 3) {
                                            higherGradient.addColorStop(i * (1 / (hues.length - 0.8)), hues[i].hexCode);
                                        }
                                        huesList.push("`" + hues[i].code + "` **" + hues[i].name + '** | ' + hues[i].hexCode + '\n')
                                    }

                                    context.fillStyle = lowerGradient;
                                    context.fillRect(0, 729, 600, 171);
                                    context.fillStyle = higherGradient;
                                    context.fillRect(0, 0, 600, 76);



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

                                    // EMBED COLOR: The embed is colored based on whether a card is dyed. The default is the basic
                                    // Icon blue color, "#33A7FF", which is found as the default for most of the embeds in the game.
                                    // If a card is dyed, the embed takes on the color of the left most point of the hue.

                                    var embedColor = ""
                                    if (hues.length != 0) {
                                        embedColor = hues[0].hexCode;
                                    } else {
                                        embedColor = "#33A7FF"
                                    }

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
                                    const cardAttachment = { file: buffer, name: "card.png" };

                                    var hueAmount = ""
                                    if (hues.length == 1) {
                                        hueAmount = "Hue"
                                    } else {
                                        hueAmount = "Hues"
                                    }

                                    const cardView = new Eris.RichEmbed()
                                        .setTitle("<:confirm:905320713483866133> **Add " + hueAmount + " to Card?**")
                                        .setDescription("`" + card.code + "` **#" + card.issue + " " + card.group.toUpperCase() + " " + card.name.toUpperCase() + "**\n" + card.era + "\n" + card.stars + "\n\n**Selected " + hueAmount + "**\n" + huesList.toString().replace(/,/g, ""))
                                        .setColor(embedColor)
                                        .setImage("attachment://card.png")
                                        .setFooter(`${member.username}#${member.discriminator} | Applying ` + hueAmount, member.avatarURL, member.avatarURL)
                                    messageOutput = await message.channel.createMessage({ embed: cardView }, cardAttachment)
                                    messageID = Object.values(messageOutput)[0]

                                    message.channel.getMessage(messageID)
                                        .then(message => {
                                            message.addReaction('🧵')
                                            message.addReaction('❌')
                                            const reactionListener = new ReactionHandler.continuousReactionStream(
                                                message,
                                                (userID) => userID !== message.author.id,
                                                false,
                                                // In case other players try to react, it will allot four reactions
                                                { maxMatches: 4, time: 60000 }
                                            );
                                            reactionListener.on('reacted', async (event) => {
                                                const applierReaction = []
                                                if (event.emoji.name === "❌") {
                                                    applierReaction.push(event.userID);
                                                    if (applierReaction.includes(applier.userID)) {
                                                        cardView.setTitle("**Canceled Adding Hues**")
                                                        cardView.setDescription("`" + card.code + "` **#" + card.issue + " " + card.group.toUpperCase() + " " + card.name.toUpperCase() + "**\n" + card.era + "\n" + card.stars + "\n\n**Selected " + hueAmount + "**\n" + huesList.toString().replace(/,/g, ""))
                                                        cardView.setColor(embedColor)
                                                        cardView.setImage("attachment://card.png")
                                                        cardView.setFooter(`${member.username}#${member.discriminator} | Canceled Adding ` + hueAmount, member.avatarURL, member.avatarURL)
                                                        message.edit({ embed: cardView }, cardAttachment)
                                                        message.removeReactions('🧵')
                                                        message.removeReactions('❌')
                                                    }

                                                }

                                                if (event.emoji.name === "🧵") {
                                                    applierReaction.push(event.userID);
                                                    const appliedHues = []
                                                    if (applierReaction.includes(applier.userID)) {


                                                        if (card.condition == "5") {
                                                            for (i = 0; i < hues.length; i++) {
                                                                if (hues[i].quantity > 0) {
                                                                    appliedHues.push(hues[i])
                                                                }
                                                            }

                                                            if (appliedHues.length == hues.length) {
                                                                for (i = 0; i < hues.length; i++) {
                                                                    if (hues[i].quantity == 1) {
                                                                        hues[i].quantity = 0
                                                                        hues[i].save()
                                                                    } else if (hues[i].quantity >= 1) {
                                                                        hues[i].quantity = hues[i].quantity - 1
                                                                        hues[i].save()
                                                                    }
                                                                }
                                                                card.hues = appliedHues
                                                                card.hueApplied = true
                                                                card.save()

                                                                cardView.setTitle("<:confirm:905320713483866133> **Successfully Applied " + hueAmount + " to Card**")
                                                                cardView.setImage("attachment://card.png")
                                                                cardView.setFooter(`${member.username}#${member.discriminator} | Applied ` + hueAmount, member.avatarURL, member.avatarURL)
                                                                message.edit({ embed: cardView }, cardAttachment)
                                                                message.removeReactions('🧵')
                                                                message.removeReactions('❌')
                                                            } else {
                                                                var hueCheck = ""
                                                                if (hues.length > 1) {
                                                                    hueCheck = "One or more of the selected hues has an insufficient quantity of zero"
                                                                } else if (hues.length == 1) {
                                                                    hueCheck = "`" + hues[0].code + "` **" + hues[0].name + "** has an insufficient quantity of zero"
                                                                }
                                                                cardView.setTitle("**Applying " + hueAmount + " Failed**")
                                                                cardView.setDescription("<:exclaim:906289233814241290> " + hueCheck + "\n\n`" + card.code + "` **#" + card.issue + " " + card.group.toUpperCase() + " " + card.name.toUpperCase() + "**\n" + card.era + "\n" + card.stars + "\n\n**Selected " + hueAmount + "**\n" + huesList.toString().replace(/,/g, ""))
                                                                cardView.setImage("attachment://card.png")
                                                                cardView.setFooter(`${member.username}#${member.discriminator} | Applying ` + hueAmount + ' Failed', member.avatarURL, member.avatarURL)
                                                                message.edit({ embed: cardView }, cardAttachment)
                                                                message.removeReactions('🧵')
                                                                message.removeReactions('❌')
                                                            }

                                                        } else {
                                                            cardView.setTitle("**Applying " + hueAmount + " Failed**")
                                                            cardView.setDescription("<:exclaim:906289233814241290> The card must be in pristine condition\n\n`" + card.code + "` **#" + card.issue + " " + card.group.toUpperCase() + " " + card.name.toUpperCase() + "**\n" + card.era + "\n" + card.stars + "\n\n**Selected " + hueAmount + "**\n" + huesList.toString().replace(/,/g, ""))
                                                            cardView.setImage("attachment://card.png")
                                                            cardView.setFooter(`${member.username}#${member.discriminator} | Applying ` + hueAmount + ' Failed', member.avatarURL, member.avatarURL)
                                                            message.edit({ embed: cardView }, cardAttachment)
                                                            message.removeReactions('🧵')
                                                            message.removeReactions('❌')
                                                        }
                                                    }
                                                }
                                            })
                                        })

                                } else {
                                    const hueLimit = new Eris.RichEmbed()
                                        .setTitle("")
                                        .setDescription("<:exclaim:906289233814241290> Currently only 3 hues can be added to the card at a time")
                                        .setColor("#9370DB")
                                        .setFooter(`${member.username}#${member.discriminator} | Hue Limit Exceeded`, member.avatarURL, member.avatarURL)
                                    message.channel.createMessage({ embed: hueLimit })
                                }
                            } else {
                                var hueCode = ""
                                if (hueCodes.length == 1) {
                                    hueCode = "code"
                                } else if (hueCodes.length > 1) {
                                    hueCode = "codes"
                                }
                                const noHues = new Eris.RichEmbed()
                                    .setTitle("")
                                    .setDescription("<:exclaim:906289233814241290> No hues with the provided information or hue " + hueCode + " can be found within your hue inventory")
                                    .setColor("#9370DB")
                                    .setFooter(`${member.username}#${member.discriminator} | No Hues Found`, member.avatarURL, member.avatarURL)
                                message.channel.createMessage({ embed: noHues })

                            }

                        } else {
                            const noHues = new Eris.RichEmbed()
                                .setTitle("")
                                .setDescription("<:exclaim:906289233814241290> There are no hues that can be found within your hue inventory. Hues can be purchased within the shop.")
                                .setColor("#9370DB")
                                .setFooter(`${member.username}#${member.discriminator} | No Hues Found`, member.avatarURL, member.avatarURL)
                            message.channel.createMessage({ embed: noHues })
                        }
                    }
                } else {

                    const noCard = new Eris.RichEmbed()
                        .setTitle("")
                        .setDescription("<:exclaim:906289233814241290> A valid card code must be provided. A card with the given information cannot be found within your inventory.")
                        .setColor("#9370DB")
                        .setFooter(`${member.username}#${member.discriminator} | Card Not Found`, member.avatarURL, member.avatarURL)
                    message.channel.createMessage({ embed: noCard })

                }
            } else {
                const noCard = new Eris.RichEmbed()
                    .setTitle("")
                    .setDescription("<:exclaim:906289233814241290> There are no cards in your inventory")
                    .setColor("#9370DB")
                    .setFooter(`${member.username}#${member.discriminator} | Cards Not Found`, member.avatarURL, member.avatarURL)
                message.channel.createMessage({ embed: noCard })
            }
        } else {
            const invalidFormat = new Eris.RichEmbed()
                .setTitle("")
                .setDescription("<:exclaim:906289233814241290> The card code followed by the selected hue code or codes must be given to continue the hue application process")
                .setColor("#9370DB")
                .setFooter(`${member.username}#${member.discriminator} | Invalid Format`, member.avatarURL, member.avatarURL)
            message.channel.createMessage({ embed: invalidFormat })
        }
    }
}
