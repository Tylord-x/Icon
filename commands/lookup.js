/*---------------------------------------LOADING IN THE PACKAGES---------------------------------------*/
// MODELS: Gets the necessary data models from the database to complete the lookup process
const cardInfo = require('../models/cardInfo.js');
const claimedCards = require('../models/claimedCards.js');
const user = require('../models/user.js');

// REACTION HANDLER: Allows the player to interact with the embeds
const ReactionHandler = require('eris-reactions');


// MESSAGE LISTENER: Listens for all the messages that are typed by the traders
const { MessageCollector } = require('eris-message-collector');

// FOLDERS: Searches and pulls folders and file paths. This is important
// especially to pull and use the card images.
const fs = require('fs');
const recursive = require('fs-readdir-recursive')
const path = require('path');

// CANVAS: Provides all the necessary components of Canvas and its related packages. The fonts used
// on the displayed cards registered with the registerFont component of Canvas.
const Canvas = require('canvas');
const { registerFont } = require('canvas');
registerFont('./fonts/Prompt-Bold.ttf', { family: 'Prompt-Bold' })
registerFont('./fonts/Prompt-Medium.ttf', { family: 'Prompt-Medium' })
registerFont('./fonts/Prompt-Regular.ttf', { family: 'Prompt' })

/*----------------------------------------------LOOKUP COMMAND: BEGINNING THE LOOKUP PROCESS-----------------------------------------*/
module.exports = {
    name: 'lookup',
    description: "Creates an inventory of owner cards by players",
    aliases: ["lu"],
    async execute(client, message, args, Eris, lookupCooldown) {

        const search = args // Stores the messaged arguments as a variable 'search'
        const singleSearch = search // Clarifies the search as being a non-filtered, single search
        const viewer = message.member.user; // Receives the information of the messaging player

        var messageOutput; // Stores the 
        var messageID = "" // Stores the ID of the message embed

        const lookupCheck = new Set()

        /*-------------------------------------RECEIVES INFORMATION FOR SINGLE SEARCH------------------------------*/

        // SINGLE SEARCH: Cycles through the arguments and creates a string. This will be used later to match cards
        // within the game.
        if (singleSearch.length >= 1) {
            var singleContent = ""
            for (i = 0; i < singleSearch.length; i++) {
                singleContent += singleSearch[i]
                if (i < singleSearch.length - 1) {
                    singleContent += " "
                }
            }

            const folders = ["idol_cards/", "group_cards/"] // 

            // FILES: Uses a package called recursive to trace recursively through
            // the file paths to get all files within the "idol_cards" and "group_cards"
            // folders. This means that all in-game cards will be able to be displayed.
            const files = []
            for (i = 0; i < folders.length; i++) {
                files.push(await recursive("./img/" + folders[i]))
            }

            // COMBINED CARDS: Combines together the two arrays that are outputted from
            // the recursively traced file paths: "idol_cards" and "group_cards"
            const combinedFiles = files[0].concat(files[1])

            var group = "" // Stores the name of the group
            var idol = "" // Stores the name of the idol
            var era = "" // Stores the name of the era
            var idolImage = "" // Stores the file path of the card image

            var foundGroup = false // Confirms if a specific group name is found from the search
            var foundIdol = false // Confirms if a specific idol name is found from the search
            var foundEra = false // Confirms if a specific era name is found from the search

            const cards = []
            for (i = 0; i < combinedFiles.length; i++) {
                if (combinedFiles[i].toLowerCase().includes(singleContent.toLowerCase())) {
                    if (combinedFiles[i].includes("\\")) {
                        group = combinedFiles[i].substring(0, combinedFiles[i].indexOf("\\"))
                        interval = combinedFiles[i].substring(combinedFiles[i].indexOf("\\") + 1)
                        era = interval.substring(0, interval.indexOf("\\"))
                        idolImage = interval.substring(interval.indexOf("\\") + 1)
                        idol = idolImage.substring(0, idolImage.indexOf("_"))
                    } else if (combinedFiles[i].includes("/")) {
                        group = combinedFiles[i].substring(0, combinedFiles[i].indexOf("/"))
                        interval = combinedFiles[i].substring(combinedFiles[i].indexOf("/") + 1)
                        era = interval.substring(0, interval.indexOf("/"))
                        idolImage = interval.substring(interval.indexOf("/") + 1)
                        idol = idolImage.substring(0, idolImage.indexOf("_"))
                    }
                    if (group.toLowerCase() == singleContent.toLowerCase()) {
                        foundGroup = true
                        cards.push({ image: combinedFiles[i], name: idol, group: group, era: era })
                    } else if (idol.toLowerCase() == singleContent.toLowerCase()) {
                        foundIdol = true
                        cards.push({ image: combinedFiles[i], name: idol, group: group, era: era })
                    } else if (era.toLowerCase() == singleContent.toLowerCase()) {
                        foundEra = true
                        cards.push({ image: combinedFiles[i], name: idol, group: group, era: era })
                    }
                }
            }

            // NO GROUPS, IDOLS, OR ERA MATCHED: If the player's search does not exactly match a group,
            // idol, or era name, then all results that match the given string will be returned. For instance,
            // if a player types "red" and there are no matched results for "red", then all results that include
            // the string "red" will be returned.
            if (!foundGroup && !foundIdol && !foundEra) {
                for (i = 0; i < combinedFiles.length; i++) {
                    if (combinedFiles[i].includes("\\")) {
                        group = combinedFiles[i].substring(0, combinedFiles[i].indexOf("\\"))
                        interval = combinedFiles[i].substring(combinedFiles[i].indexOf("\\") + 1)
                        era = interval.substring(0, interval.indexOf("\\"))
                        idolImage = interval.substring(interval.indexOf("\\") + 1)
                        idol = idolImage.substring(0, idolImage.indexOf("_"))
                    } else if (combinedFiles[i].includes("/")) {
                        group = combinedFiles[i].substring(0, combinedFiles[i].indexOf("/"))
                        interval = combinedFiles[i].substring(combinedFiles[i].indexOf("/") + 1)
                        era = interval.substring(0, interval.indexOf("/"))
                        idolImage = interval.substring(interval.indexOf("/") + 1)
                        idol = idolImage.substring(0, idolImage.indexOf("_"))
                    }
                    if (combinedFiles[i].toLowerCase().includes(singleContent.toLowerCase())) {
                        cards.push({ image: combinedFiles[i], name: idol, group: group, era: era })
                    }
                }
            }

            const cardList = []
            const foundCards = []
            var pageCount = 0
            var page = 1
            const pages = []

            if (cards.length != 0) {
                for (i = 0; i < cards.length; i++) {
                    if (cards[i].era.includes(";")) {
                        cards[i].era = cards[i].era.replace(";", ":")
                    }
                    foundCards.push(await cardInfo.find({ $and: [{ group: cards[i].group }, { name: cards[i].name }, { era: cards[i].era }] }))

                    if (cards[i].name == "Group") {
                        cardList.push("**" + (i + 1) + "** — **" + cards[i].group + "** Group (" + cards[i].era + ")\n")
                    } else {
                        cardList.push("**" + (i + 1) + "** — **" + cards[i].group + "** " + cards[i].name + " (" + cards[i].era + ")\n")
                    }

                    if (i % 15 == 0) {
                        pageCount += 1;
                        pages.push(pageCount)
                    }
                }

                const lookup = new Eris.RichEmbed()
                    .setTitle("")
                    .setDescription("<:search:905765062462046238> **" + singleContent.toUpperCase() + "**\nNow showing results from search...\n\n" + cardList.slice((page) * 15 - 15, (page) * 15).toString().replace(/,/g, ""))
                    .setColor("#33A7FF")
                    .setFooter(`${viewer.username}#${viewer.discriminator} | Viewing Lookup`, viewer.avatarURL, viewer.avatarURL)
                messageOutput = await message.channel.createMessage({ embed: lookup })
                messageID = Object.values(messageOutput)[0]
                message.channel.getMessage(messageID)
                    .then(message => {
                        if (cards.length <= 15) {
                            message.addReaction("❌")
                        }
                        if (cards.length > 15) {
                            message.addReaction("❌")
                            message.addReaction('⏪');
                            message.addReaction('◀️');
                            message.addReaction('▶️')
                            message.addReaction('⏩');

                            const reactionListener = new ReactionHandler.continuousReactionStream(
                                message,
                                (userID) => userID != message.author.id,
                                false,
                                { max: 100, time: 60000 }
                            );
                            const viewerReaction = []
                            reactionListener.on('reacted', (event) => {
                                if (event.emoji.name == "⏪") {
                                    viewerReaction.push(event.userID)
                                    if (viewerReaction.includes(viewer.id)) {
                                        if (page == 1) return;
                                        page = 1;
                                        lookup.setDescription("<:search:905765062462046238> **" + singleContent.toUpperCase() + "**\nNow showing results from search...\n\n" + cardList.slice((page) * 15 - 15, (page) * 15).toString().replace(/,/g, ""))
                                        message.edit({ embed: lookup })
                                    }
                                }
                                if (event.emoji.name == "◀️") {
                                    viewerReaction.push(event.userID)
                                    if (viewerReaction.includes(viewer.id)) {
                                        if (page == 1) return;
                                        page--;
                                        lookup.setDescription("<:search:905765062462046238> **" + singleContent.toUpperCase() + "**\nNow showing results from search...\n\n" + cardList.slice((page) * 15 - 15, (page) * 15).toString().replace(/,/g, ""))
                                        message.edit({ embed: lookup })
                                    }
                                }

                                if (event.emoji.name == "▶️") {
                                    viewerReaction.push(event.userID)
                                    if (viewerReaction.includes(viewer.id)) {
                                        if (page == pages.length) return;
                                        page++;
                                        lookup.setDescription("<:search:905765062462046238> **" + singleContent.toUpperCase() + "**\nNow showing results from search...\n\n" + cardList.slice((page) * 15 - 15, (page) * 15).toString().replace(/,/g, ""))
                                        message.edit({ embed: lookup })
                                    }
                                }

                                if (event.emoji.name == "⏩") {
                                    viewerReaction.push(event.userID)
                                    if (viewerReaction.includes(viewer.id)) {
                                        if (page == pages.length) return;
                                        page = pages.length;
                                        lookup.setDescription("<:search:905765062462046238> **" + singleContent.toUpperCase() + "**\nNow showing results from search...\n\n" + cardList.slice((page) * 15 - 15, (page) * 15).toString().replace(/,/g, ""))
                                        message.edit({ embed: lookup })
                                    }
                                }
                            })
                        }
                    })

                message.channel.getMessage(messageID)
                    .then(message => {

                        let filter = (message) => message.author.id == message.member.id
                        const collector = new MessageCollector(client, message.channel, filter, { // Create our collector with our options set as the current channel, the client, filter and our time
                            time: 60000
                        });


                        collector.on("collect", async (message) => {

                            if (message.author.id == viewer.id) {

                                var selectedCard;
                                for (i = 0; i < foundCards.length; i++) {
                                    if (i == message.content - 1) {
                                        selectedCard = foundCards[i]
                                    }
                                }

                                var generated = 0
                                var claimed = 0
                                var issueNum = 1
                                var mainImage = ""
                                var icon = ""
                                var claimRate;
                                var eraName = ""
                                var idolName = ""
                                var groupName = ""
                                if (selectedCard != undefined && selectedCard != null && selectedCard.length != 0) {
                                    generated = selectedCard[0].numGenerated
                                    claimed = selectedCard[0].numClaimed
                                    mainImage = selectedCard[0].mainImage
                                    icon = selectedCard[0].icon
                                    issueNum = selectedCard[0].issue
                                    if (selectedCard[0].era.includes(";")) {
                                        selectedCard[0].era = selectedCard[0].era.replace(";", ":")
                                    }
                                    groupName = selectedCard[0].group
                                    idolName = selectedCard[0].name
                                    eraName = selectedCard[0].era
                                    claimRate = Math.round((claimed / generated) * 100) + "%"
                                } else {

                                    for (i = 0; i < cards.length; i++) {
                                        if (i == (message.content - 1)) {
                                            selectedCard = cards[i]
                                        }
                                    }

                                    if (selectedCard != null && selectedCard != undefined) {
                                        if (selectedCard.name == "Group") {
                                            mainImage = "./img/group_cards/" + selectedCard.image
                                            icon = "./img/group_icons/" + selectedCard.image
                                        } else {
                                            mainImage = "./img/idol_cards/" + selectedCard.image
                                            icon = "./img/idol_icons/" + selectedCard.image
                                        }
                                        claimRate = "0%"
                                        if (selectedCard.era.includes(";")) {
                                            selectedCard.era = selectedCard.era.replace(";", ":")
                                        }
                                        groupName = selectedCard.group
                                        idolName = selectedCard.name
                                        eraName = selectedCard.era
                                    }
                                }

                                if (selectedCard != null && selectedCard != undefined) {
                                    if (selectedCard.length != 0) {

                                        // CREATES CANVAS: Creates the initial canvas that contains the card components
                                        const canvas = Canvas.createCanvas(600, 900);
                                        const context = canvas.getContext('2d');
                                        const background = await Canvas.loadImage('transparent.png');
                                        context.drawImage(background, 0, 0, canvas.width, canvas.height);

                                        // MAIN IMAGE: Gets the overall main image of the card, which is either an idol or a group
                                        const idolMainImage = await Canvas.loadImage(mainImage);
                                        context.drawImage(idolMainImage, 30, 75, 540, 657);


                                        // FRAME: Receives the frame currently applied to the card and adds it to the canvas
                                        const frame = await Canvas.loadImage("./img/cosmetics/frames/Default_Frame.png")
                                        context.drawImage(frame, 0, 0, 600, 900);

                                        //COSMETICS
                                        const cosmetic = await Canvas.loadImage("./img/cosmetics/misc/Barcode.png")
                                        context.drawImage(cosmetic, 477, 20, 90, 40);


                                        // ICON: Gets the icon that matches the idol or group depicted in the main image by era
                                        const idolIcon = await Canvas.loadImage(icon);
                                        context.drawImage(idolIcon, 34, 747.5, 138, 121);

                                        /*---------------------------------------FONTS & TEXT---------------------------------------*/

                                        // ISSUE NUMBER: Placed on top left of the chosen card. It provides the issue number associated
                                        // with the card.
                                        context.font = '37px "Prompt"';
                                        context.textAlign = "left";
                                        context.fillStyle = "#FFFFFF";
                                        var issue = "#0"
                                        context.fillText(issue, 33, 50);

                                        // IDOL AND GROUP NAMES: Determines whether a card is a group card or a regular idol card and displays
                                        // the text accordingly. Both output two lines of text that provides accurate information about the card.
                                        // If it is a regular idol card, the idol's name followed by the group the idol belongs to is given. If it
                                        // is a group card or soloist card, the group's name followed by "group" or "soloist" is given.

                                        if (idolName == "Group") {
                                            if (groupName.length >= 14) {
                                                context.font = '42px "Prompt-Bold"';
                                            } else {
                                                context.font = '45px "Prompt-Bold"';
                                            }
                                            context.textAlign = "right";
                                            context.fillStyle = "#FFFFFF"
                                            var selectedGroup = groupName.toUpperCase();
                                            context.fillText(selectedGroup, 566, 810);

                                            context.font = '26px "Prompt"';
                                            context.textAlign = "right";
                                            context.fillStyle = "#FFFFFF";
                                            var selectedLabel = idolName.toUpperCase();
                                            context.fillText(selectedLabel, 566, 838);

                                        } else {
                                            context.font = '44px "Prompt-Bold"';
                                            context.textAlign = "right";
                                            context.fillStyle = "#FFFFFF"
                                            var selectedIdol = idolName.toUpperCase();
                                            context.fillText(selectedIdol, 566, 810);

                                            context.font = '26px "Prompt"';
                                            context.textAlign = "right";
                                            context.fillStyle = "#FFFFFF";
                                            var selectedGroup = groupName.toUpperCase();
                                            context.fillText(selectedGroup, 566, 838);
                                        }

                                        const buffer = canvas.toBuffer();
                                        const cardAttachment = { file: buffer, name: "lookup.png" };

                                        const lookup = new Eris.RichEmbed()
                                            .setTitle("")
                                            .setColor("#33A7FF")
                                            .setImage("attachment://lookup.png")
                                            .addField("**Generated**", "" + generated, true)
                                            .addField("**Claimed**", "" + claimed, true)
                                            .addField("**Claim Rate**", claimRate)
                                            .addField("**Current Issue**", "#" + issueNum, true)
                                            .setFooter(`${viewer.username}#${viewer.discriminator} | Viewing Lookup`, viewer.avatarURL, viewer.avatarURL)
                                        if (idolName == "Group") {
                                            lookup.setDescription("<:confirm:905320713483866133> **" + groupName + "** (" + eraName + ")\nSelected Card Information Found")
                                        } else {
                                            lookup.setDescription("<:confirm:905320713483866133> **" + groupName + "** " + idolName + " (" + eraName + ")\nSelected Card Information Found")
                                        }
                                        messageOutput = await message.channel.createMessage({ embed: lookup }, cardAttachment)
                                        messageID = Object.values(messageOutput)[0]

                                    }
                                }
                            }
                        })

                        const reactor = new ReactionHandler.continuousReactionStream(
                            message,
                            (userID) => userID != message.author.id,
                            false,
                            { max: 100, time: 60000 }
                        );
                        const lookupReaction = []
                        reactor.on('reacted', (event) => {
                            if (event.emoji.name === "❌") {
                                lookupReaction.push(event.userID); 
                                if (lookupReaction.includes(viewer.id)) {
                                    lookup.setTitle("")
                                    lookup.setDescription("<:search:905765062462046238> **" + singleContent.toUpperCase() + "**\nSearch ended...\n\n" + cardList.slice((page) * 15 - 15, (page) * 15).toString().replace(/,/g, ""))
                                    lookup.setColor("#9370DB")
                                    lookup.setFooter(`${viewer.username}#${viewer.discriminator} | Ended Lookup`, viewer.avatarURL, viewer.avatarURL)
                                    message.edit({embed: lookup})
                                    message.removeReactions("❌")
                                    message.removeReactions('⏪');
                                    message.removeReactions('◀️');
                                    message.removeReactions('▶️')
                                    message.removeReactions('⏩');
                                    collector.stop()
                                    lookupCooldown.delete(viewer.id)
                                   
                                }
                            }

                        })

                    })
            } else {
                const lookup = new Eris.RichEmbed()
                    .setTitle("")
                    .setDescription("<:search:905765062462046238> **" + singleContent.toUpperCase() + "**\nNow showing results from search...\n\nNo cards were able to be found with this search.")
                    .setColor("#33A7FF")
                    .setFooter(`${viewer.username}#${viewer.discriminator} | Viewing Lookup`, viewer.avatarURL, viewer.avatarURL)
                messageOutput = await message.channel.createMessage({ embed: lookup })
                messageID = Object.values(messageOutput)[0]
                message.channel.getMessage(messageID)
            }

        } else {
            const invalidFormat = new Eris.RichEmbed()
                .setTitle("")
                .setDescription(`<:exclaim:906289233814241290> The name of an idol, group, or era must be given to continue the lookup process`)
                .setColor("#9370DB")
                .setFooter(`${viewer.username}#${viewer.discriminator} | Invalid Format`, viewer.avatarURL, viewer.avatarURL)
            message.channel.createMessage({ embed: invalidFormat })
        }
    }
}