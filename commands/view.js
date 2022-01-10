/*---------------------------------------------LOADING IN PACKAGES-------------------------------------*/

// CANVAS: Provides all the necessary components of Canvas and its related packages. The fonts used
// on the displayed cards registered with the registerFont component of Canvas.
const Canvas = require('canvas');
const { registerFont } = require('canvas');
registerFont('./fonts/Prompt-Bold.ttf', { family: 'Prompt-Bold' })
registerFont('./fonts/Prompt-Medium.ttf', { family: 'Prompt-Medium' })
registerFont('./fonts/Prompt-Regular.ttf', { family: 'Prompt' })


const fs = require('fs');

const claimedCards = require('../models/claimedCards.js');
const teamCards = require('../models/teamCards.js');
const user = require('../models/user.js');

/*-------------------------------------------VIEW COMMAND: BEGIN VIEW PROCESS------------------------------------------------*/

module.exports = {
    name: 'view',
    description: "viewing player-owned cards",
    aliases: ['v'],
    async execute(client, message, args, Eris) {

        // CREATES CANVAS: Creates the initial canvas that contains the card components
        const canvas = Canvas.createCanvas(600, 900);
        const context = canvas.getContext('2d');
        const background = await Canvas.loadImage('transparent.png');
        context.drawImage(background, 0, 0, canvas.width, canvas.height);

        // VIEWER: Gets the information of the player who initiated viewing the card
        const viewer = message.member.user;

        /*---------------------------------------VIEWING CARDS BY CARD CODE------------------------------------*/

        //ARGS: Checks to see if arguments are defined
        if (args != undefined && args != null) {

            // ARGS: Ensures that there are more arguments than 1, but will check
            if (args.length >= 1) {

                var cardCode = args[0] // Stores the first argument after the command as the card code

                // CARD: Waits for the document to load that satisfies the query. The card code is what
                // will be used to pull the document, which will return all of the card's information.
                var card = await claimedCards.findOne({ code: cardCode })
                // USER: Waits for the document to load that satisfies the query. The most recent owner of the card
                // is what will be used to pull the document, which will return all of the owner's information.

                if (card != null && card != undefined) {
                    var player = await user.findOne({ userID: card.owner[card.owner.length - 1] })

                    /*---------------------------------------IMAGES AND COSMETICS------------------------------------*/

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
                    const cardAttachment = { file: buffer, name: "viewCard.png" };

                    // OWNERSHIP CHECK: Performs various checks to see how the owner should be viewed on the card.
                    // If a card is currently in play and not burned, it will appear with an "Owned By" statement. 
                    // If the owner is private, it will state "Owned by Private". If the owner is not private, the
                    // card will appear with the user's name, which can be clicked on to view their profile. If
                    // a card is currently burned, the card will have no "Owned By" statement until it is back in
                    // the position of a player.
                    var owner = ""
                    var hasOwner = ""
                    if (player.private) {
                        if (player.userID == viewer.id) {
                            owner = `<@${card.owner[card.owner.length - 1]}>`
                        } else {
                            owner = `Private`
                        }
                    } else {
                        owner = `<@${card.owner[card.owner.length - 1]}>`
                    }
                    if (card.burned) {
                        if (card.owner[card.owner.length - 1] == "881301440071618600") {
                            hasOwner = "Owned By " + owner + "\n\n"
                        } else {
                            hasOwner = ""
                        }
                    } else {
                        hasOwner = "Owned By " + owner + "\n\n"
                    }

                    // EMBED SHOWCASED: Changes the look of the embed dependent on if the card is a group card or a regular
                    // idol card. If the card chosen is a group card, any reference to name is removed, as it appears as "Group."
                    if (card.name == "Group") {
                        const viewCard = new Eris.RichEmbed()
                            .setTitle("<:cards:900131721855516743> `" + card.code + "` **" + card.group.toUpperCase() + "**")
                            .setDescription(hasOwner + "**#" + card.issue + " " + card.group.toUpperCase() + "**\n" + card.era + "\n" + card.stars)
                            .setColor(embedColor)
                            .setImage("attachment://viewCard.png")
                            .setFooter(`${viewer.username}#${viewer.discriminator} | Viewing Card`, viewer.avatarURL, viewer.avatarURL)
                        message.channel.createMessage({ embed: viewCard }, cardAttachment);
                    } else {
                        const viewCard = new Eris.RichEmbed()
                            .setTitle("<:cards:900131721855516743> `" + card.code + "` **" + card.name.toUpperCase() + "**")
                            .setDescription(hasOwner + "**#" + card.issue + " " + card.group.toUpperCase() + " " + card.name.toUpperCase() + "**\n" + card.era + "\n" + card.stars)
                            .setColor(embedColor)
                            .setImage("attachment://viewCard.png")
                            .setFooter(`${viewer.username}#${viewer.discriminator} | Viewing Card`, viewer.avatarURL, viewer.avatarURL)
                        message.channel.createMessage({ embed: viewCard }, cardAttachment);
                    }
                }

            } else if (args.length == 0) {

                /*----------------------------------VIEWING MOST RECENT CARD OF VIEWER------------------------------------*/
                // USER: Waits for the document to load that satisfies the query. The id of the viewer (player who has messaged the view command)
                // is used to pull up the player's information. This is to set up displaying their most recent card.
                var player = await user.findOne({ userID: viewer.id })

                if (player != null && player != undefined) {

                    if (player.inventory.length != 0) {

                        var recentCard = player.inventory[player.inventory.length - 1]

                        // CARD: Waits for the documents to load that satisfies the query. In this case, it checks for the player or viewer 
                        // as the owner and the most recent card code that is found in the player's inventory.
                        var card = await claimedCards.findOne({ $and: [{ owner: player.userID }, { code: recentCard }] })

                        /*---------------------------------------IMAGES AND COSMETICS------------------------------------*/

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
                        const cardAttachment = { file: buffer, name: "viewCard.png" };

                        // EMBED SHOWCASED: Changes the look of the embed dependent on if the card is a group card or a regular
                        // idol card. If the card chosen is a group card, any reference to name is removed, as it appears as "Group."
                        if (card.name == "Group") {
                            const viewCard = new Eris.RichEmbed()
                                .setTitle("<:cards:900131721855516743> `" + card.code + "` **" + card.group.toUpperCase() + "**")
                                .setDescription(`Owned By <@${card.owner[card.owner.length - 1]}>\n\n**#` + card.issue + " " + card.group.toUpperCase() + "**\n" + card.era + "\n" + card.stars)
                                .setColor(embedColor)
                                .setImage("attachment://viewCard.png")
                                .setFooter(`${viewer.username}#${viewer.discriminator} | Viewing Card`, viewer.avatarURL, viewer.avatarURL)
                            message.channel.createMessage({ embed: viewCard }, cardAttachment);
                        } else {
                            const viewCard = new Eris.RichEmbed()
                                .setTitle("<:cards:900131721855516743> `" + card.code + "` **" + card.name.toUpperCase() + "**")
                                .setDescription(`Owned By <@${card.owner[card.owner.length - 1]}>\n\n**#` + card.issue + " " + card.group.toUpperCase() + " " + card.name.toUpperCase() + "**\n" + card.era + "\n" + card.stars)
                                .setColor(embedColor)
                                .setImage("attachment://viewCard.png")
                                .setFooter(`${viewer.username}#${viewer.discriminator} | Viewing Card`, viewer.avatarURL, viewer.avatarURL)
                            message.channel.createMessage({ embed: viewCard }, cardAttachment);
                        }

                    }
                }
            }

        }
    }
}

