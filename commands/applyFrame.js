/*---------------------------------------LOADING IN THE PACKAGES-----------------------------------*/

// MODELS: Gets the necessary data model from the database to complete the applying frame process
const user = require('../models/user.js');
const claimedCards = require('../models/claimedCards.js');

// CANVAS: Provides all the necessary components of Canvas and its related packages. The fonts used
// on the displayed cards registered with the registerFont component of Canvas.
const Canvas = require('canvas');
const { registerFont } = require('canvas');
registerFont('./fonts/Prompt-Bold.ttf', { family: 'Prompt-Bold' })
registerFont('./fonts/Prompt-Medium.ttf', { family: 'Prompt-Medium' })
registerFont('./fonts/Prompt-Regular.ttf', { family: 'Prompt' })

// REACTION HANDLER: Allows the player to interact with the embeds
const ReactionHandler = require('eris-reactions');


/*-----------------------------------BAN COMMAND: BEGINNING BAN PROCESS--------------------------*/
module.exports = {
    name: 'applyframe',
    description: "Allows players to apply frames to their cards",
    aliases: ['af'],
    async execute(client, message, args, Eris) {
        const member = message.member.user;
        const applier = await user.findOne({ userID: member.id })
        const content = args

        // CREATES CANVAS: Creates the initial canvas that contains the card components
        const canvas = Canvas.createCanvas(600, 900);
        const context = canvas.getContext('2d');
        const background = await Canvas.loadImage('transparent.png');
        context.drawImage(background, 0, 0, canvas.width, canvas.height);

        if (content.length >= 1) {

            const cardCode = content[0]

            if (applier.inventory.length != 0) {
                var selectedCode;
                for (i = 0; i < applier.inventory.length; i++) {
                    if (applier.inventory[i] == cardCode.toLowerCase()) {
                        selectedCode = applier.inventory[i]
                    }
                }

                if (selectedCode != null && selectedCode != undefined) {
                    const card = await claimedCards.findOne({ code: selectedCode })

                    if (card != null && card != undefined) {
                        const nameFrame = content.slice(1, content.length)

                        var frameContent = ""
                        for (i = 0; i < nameFrame.length; i++) {
                            for (char in nameFrame[i]) {
                                if (nameFrame[i].charAt(char) == "(" || nameFrame[i].charAt(char) == ")" || nameFrame[i].charAt(char) == "*" || nameFrame[i].charAt(char) == "&" || nameFrame[i].charAt(char) == "%"
                                    || nameFrame[i].charAt(char) == "." || nameFrame[i].charAt(char) == "!" || nameFrame[i].charAt(char) == "@" || nameFrame[i].charAt(char) == "#" || nameFrame[i].charAt(char) == "]"
                                    || nameFrame[i].charAt(char) == "[" || nameFrame[i].charAt(char) == ":" || nameFrame[i].charAt(char) == ";" || nameFrame[i].charAt(char) == "?" || nameFrame[i].charAt(char) == "<"
                                    || nameFrame[i].charAt(char) == ">" || nameFrame[i].charAt(char) == "'") {
                                    frameContent += "\\" + nameFrame[i].charAt(char)

                                } else {
                                    frameContent += "" + nameFrame[i].charAt(char)
                                }
                            }
                            if (i < nameFrame[i].length - 1) {
                                frameContent += " "
                            }
                        }

                        if (frameContent.includes("frame") || frameContent.includes("Frame")) {
                            if (frameContent.includes("frame")) {

                            } else if (frameContent.includes()) {

                            }
                        }

                        const regex = new RegExp(frameContent, "i")
                        var selectedFrame;
                        if (applier.frames.length != 0) {
                            for (i = 0; i < applier.frames.length; i++) {
                                if (applier.frames[i].name.match(regex)) {
                                    selectedFrame = applier.frames[i]
                                }

                            }
                        }

                        if (selectedFrame != undefined && selectedFrame != null) {
                            const idolMainImage = await Canvas.loadImage(card.mainImage);
                            context.drawImage(idolMainImage, 30, 75, 540, 657);

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
                                        lowerGradient.addColorStop(i * (1 / (card.hues.length - 0.5)), card.hues[i].hexCode);
                                    } if (card.hues.length == 3) {
                                        lowerGradient.addColorStop(i * (1 / (card.hues.length - 0.8)), card.hues[i].hexCode);
                                    }
                                }

                                var higherGradient = context.createLinearGradient(((1 / card.hues.length) * 100), 76, (600 - ((1 / card.hues.length) * 100)), 76);

                                for (i = 0; i < card.hues.length; i++) {
                                    if (card.hues.length == 1) {
                                        higherGradient.addColorStop(i * (1 / (card.hues.length)), card.hues[i].hexCode);
                                    } if (card.hues.length == 2) {
                                        higherGradient.addColorStop(i * (1 / (card.hues.length - 0.5)), card.hues[i].hexCode);
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
                            const frame = await Canvas.loadImage(selectedFrame.image)
                            context.drawImage(frame, 0, 0, 600, 900);

                            // STICKERS: Cycles through all of the stickers contained on the card and places them in their correct
                            // positions on the cards. If no stickers exist on the card, no stickers will be showcased.
                            if (card.stickers != null && card.stickers != undefined && card.stickers.length != 0) {
                                for (i = 0; i < card.stickers.length; i++) {
                                    console.log(card.stickers[i])
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
                            if (card.hueApplied) {
                                embedColor = card.hues[0].hexCode
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
                            const cardAttachment = { file: buffer, name: "frame.png" };

                            var frameName = selectedFrame.image.replace("./img/cosmetics/frames/", "")
                            var frameFile = frameName.substring(0, frameName.indexOf(".png"))
                            frameName = frameFile.replace(/_/g, " ")

                            const cardView = new Eris.RichEmbed()
                                .setTitle("<:confirm:905320713483866133> **Add Frame to Card?**")
                                .setDescription("`" + card.code + "` **#" + card.issue + " " + card.group.toUpperCase() + " " + card.name.toUpperCase() + "**\n" + card.era + "\n" + card.stars + "\n\n**Selected Frame**\n" + frameName)
                                .setColor(embedColor)
                                .setImage("attachment://frame.png")
                                .setFooter(`${member.username}#${member.discriminator} | Applying Frame`, member.avatarURL, member.avatarURL)
                            messageOutput = await message.channel.createMessage({ embed: cardView }, cardAttachment)
                            messageID = Object.values(messageOutput)[0]

                            message.channel.getMessage(messageID)
                                .then(message => {
                                    message.channel.getMessage(messageID)
                                        .then(message => {
                                            message.addReaction('🎞️')
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
                                                }

                                                if (event.emoji.name === "🎞️") {
                                                    applierReaction.push(event.userID);
                                                    var appliedFrame;
                                                    var selectedIndex = 0
                                                    if (applierReaction.includes(applier.userID)) {

                                                        if (card.condition == 5) {
                                                            for (i = 0; i < applier.frames.length; i++) {
                                                                if (applier.frames[i].image.includes(frameFile)) {
                                                                    if (applier.frames[i].quantity > 0) {
                                                                        appliedFrame = applier.frames[i]
                                                                        selectedIndex = i
                                                                        card.frame = applier.frames[i]
                                                                    }
                                                                }

                                                            }

                                                            if (appliedFrame != undefined && appliedFrame != null) {

                                                                var finalFrame = {
                                                                    name: applier.frames[selectedIndex].name, image: applier.frames[selectedIndex].image, x: applier.frames[selectedIndex].x,
                                                                    y: applier.frames[selectedIndex].y, w: applier.frames[selectedIndex].w, h: applier.frames[selectedIndex].h, quantity: applier.frames[selectedIndex].quantity - 1
                                                                }
                                                                applier.frames.splice(selectedIndex, 1)
                                                                applier.frames.splice(selectedIndex, 0, finalFrame)

                                                                card.save()
                                                                applier.save()

                                                                cardView.setTitle("<:confirm:905320713483866133> **Successfully Added Frame to Card**")
                                                                cardView.setDescription("`" + card.code + "` **#" + card.issue + " " + card.group.toUpperCase() + " " + card.name.toUpperCase() + "**\n" + card.era + "\n" + card.stars + "\n\n**Selected Frame**\n" + frameName)
                                                                cardView.setColor(embedColor)
                                                                cardView.setImage("attachment://frame.png")
                                                                cardView.setFooter(`${member.username}#${member.discriminator} | Applied Frame`, member.avatarURL, member.avatarURL)
                                                                message.edit({ embed: cardView }, cardAttachment)
                                                                message.removeReactions('🎞️')
                                                                message.removeReactions('❌')

                                                            } else {
                                                                cardView.setTitle("**Applying Frame Failed**")
                                                                cardView.setDescription("<:exclaim:906289233814241290> Insufficient frame quantity \n\n`" + card.code + "` **#" + card.issue + " " + card.group.toUpperCase() + " " + card.name.toUpperCase() + "**\n" + card.era + "\n" + card.stars + "\n\n**Selected Frame**\n" + frameName)
                                                                cardView.setColor(embedColor)
                                                                cardView.setImage("attachment://frame.png")
                                                                cardView.setFooter(`${member.username}#${member.discriminator} | Applying Frame Failed`, member.avatarURL, member.avatarURL)
                                                                message.edit({ embed: cardView }, cardAttachment)
                                                                message.removeReactions('🎞️')
                                                                message.removeReactions('❌')
                                                            }
                                                        } else {
                                                            cardView.setTitle("**Applying Frame Failed**")
                                                            cardView.setDescription("<:exclaim:906289233814241290> The card must be in pristine condition \n\n`" + card.code + "` **#" + card.issue + " " + card.group.toUpperCase() + " " + card.name.toUpperCase() + "**\n" + card.era + "\n" + card.stars + "\n\n**Selected Frame**\n" + frameName)
                                                            cardView.setColor(embedColor)
                                                            cardView.setImage("attachment://frame.png")
                                                            cardView.setFooter(`${member.username}#${member.discriminator} | Applying Frame Failed`, member.avatarURL, member.avatarURL)
                                                            message.edit({ embed: cardView }, cardAttachment)
                                                            message.removeReactions('🎞️')
                                                            message.removeReactions('❌')
                                                        }

                                                    }
                                                }
                                            })
                                        })
                                })

                        } else {
                            const noFrame = new Eris.RichEmbed()
                                .setTitle("")
                                .setDescription("<:exclaim:906289233814241290> A valid frame name must be provided. A frame with the given information cannot be found within your item collection.")
                                .setColor("#9370DB")
                                .setFooter(`${member.username}#${member.discriminator} | Frame Not Found`, member.avatarURL, member.avatarURL)
                            message.channel.createMessage({ embed: noFrame })
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
            }

        } else {
            const invalidFormat = new Eris.RichEmbed()
                .setTitle("")
                .setDescription("<:exclaim:906289233814241290> A card code followed by the selected frame name must be given to continue the frame application process")
                .setColor("#9370DB")
                .setFooter(`${member.username}#${member.discriminator} | Invalid Format`, member.avatarURL, member.avatarURL)
            message.channel.createMessage({ embed: invalidFormat })
        }
    }
}