/*---------------------------------------LOADING IN THE PACKAGES-----------------------------------*/

// MODELS: Gets the necessary data models from the database to complete the profile color process
const profiles = require('../models/profile.js');
const cardInfo = require('../models/cardInfo.js');

// REACTION HANDLER: Allows the player to interact with the embeds
const ReactionHandler = require('eris-reactions');

// FOLDERS: Searches and pulls folders and file paths. This is important
// especially to pull and use the card images.
const fs = require('fs');
const recursive = require('fs-readdir-recursive')
const path = require('path');

// CANVAS: Provides the visibly drawn canvas and all the components of the cards, including fonts
const Canvas = require('canvas');

/*-----------------------------------------PROFILE COLOR COMMAND: BEGIN COLOR PROCESS-----------------------------*/
module.exports = {
    name: 'profileBadges',
    description: "Allows players to add badges to their profile",
    aliases: ["pbadge", "badge", "profilebadges", "badges"],
    async execute(client, message, args, Eris) {

        const member = message.member.user;
        const profile = await profiles.findOne({ userID: member.id })
        var messageID = ""
        var messageOutput;

        if (profile != undefined && profile != null) {
            if (args != undefined && args != null) {
                const search = args
                const slot = search[0]

                var verifiedSpot;
                if (Number(slot) > 0 && Number(slot) < 7) {
                    verifiedSpot = Number(slot)
                }

                if (verifiedSpot != null && verifiedSpot != undefined) {

                    var groupCheck = false
                    var nameCheck = false
                    var eraCheck = false

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

                    var filters = []

                    for (i = 0; i < search.length; i++) {
                        if (search[i].includes("g=") || search[i].includes("group=") || search[i].includes("G=") || search[i].includes("Group=")) {
                            groupCheck = true
                            filters.push({ filter: "group", startingIndex: i })
                        }
                        if (search[i].includes("n=") || search[i].includes("name=") || search[i].includes("N=") || search[i].includes("Name=")) {
                            nameCheck = true
                            filters.push({ filter: "name", startingIndex: i })
                        }
                        if (search[i].includes("e=") || search[i].includes("era=") || search[i].includes("E=") || search[i].includes("Era=")) {
                            eraCheck = true
                            filters.push({ filter: "era", startingIndex: i })
                        }
                        search[i] = search[i].replace(/(.*)=/, "")
                    }

                    const initialFilters = []
                    if (groupCheck || nameCheck || eraCheck) {
                        for (i = 0; i < filters.length; i++) {
                            if (i < filters.length - 1) {
                                initialFilters.push({ name: filters[i].filter, content: search.slice(filters[i].startingIndex, filters[i + 1].startingIndex).toString().replace(/,/g, " ") })
                            } else {
                                initialFilters.push({ name: filters[i].filter, content: search.slice(filters[i].startingIndex, search.length).toString().replace(/,/g, " ") })
                            }
                        }

                        var groupFilter = ""
                        var idolFilter = ""
                        var eraFilter = ""
                        for (i = 0; i < initialFilters.length; i++) {
                            if (initialFilters[i].name == "group") {
                                for (j = 0; j < initialFilters[i].content.length; j++) {
                                    groupFilter += initialFilters[i].content[j];
                                }
                            } else if (initialFilters[i].name == "name") {
                                for (j = 0; j < initialFilters[i].content.length; j++) {
                                    idolFilter += initialFilters[i].content[j];
                                }
                            } else if (initialFilters[i].name = "era") {
                                for (j = 0; j < initialFilters[i].content.length; j++) {
                                    eraFilter += initialFilters[i].content[j];
                                }
                            }
                        }

                        var group = "" // Stores the name of the group
                        var idol = "" // Stores the name of the idol
                        var era = "" // Stores the name of the era
                        var idolImage = "" // Stores the image path of the idol

                        var foundGroup = false // Confirms if a specific group name is found from the search
                        var foundIdol = false // Confirms if a specific idol name is found from the search
                        var foundEra = false // Confirms if a specific era name is found from the search

                        const cards = []
                        var groupCard = false
                        for (i = 0; i < combinedFiles.length; i++) {
                            if (combinedFiles[i].includes("\\")) {
                                group = combinedFiles[i].substring(0, combinedFiles[i].indexOf("\\"))
                                interval = combinedFiles[i].substring(combinedFiles[i].indexOf("\\") + 1)
                                era = interval.substring(0, interval.indexOf("\\"))
                                idolImage = interval.substring(interval.indexOf("\\") + 1)
                            } else if (combinedFiles[i].includes("/")) {
                                group = combinedFiles[i].substring(0, combinedFiles[i].indexOf("/"))
                                interval = combinedFiles[i].substring(combinedFiles[i].indexOf("/") + 1)
                                era = interval.substring(0, interval.indexOf("/"))
                                idolImage = interval.substring(interval.indexOf("/") + 1)
                            }
                            idol = idolImage.substring(0, idolImage.indexOf("_"))
                            if (initialFilters.length == 1) {
                                if (groupFilter.toLowerCase() == group.toLowerCase()) {
                                    foundGroup = true
                                    if (combinedFiles[i].includes("Group")) {
                                        cards.push({ image: combinedFiles[i], name: idol, group: group, era: era })
                                        groupCard = true
                                    }
                                } else if (idolFilter.toLowerCase() == idol.toLowerCase()) {
                                    foundIdol = true
                                    cards.push({ image: combinedFiles[i], name: idol, group: group, era: era })
                                } else if (eraFilter.toLowerCase() == era.toLowerCase()) {
                                    foundEra = true
                                    cards.push({ image: combinedFiles[i], name: idol, group: group, era: era })
                                }
                            } else if (initialFilters.length == 2) {
                                if (groupCheck && nameCheck) {
                                    if (groupFilter.toLowerCase() == group.toLowerCase() && idolFilter.toLowerCase() == idol.toLowerCase()) {
                                        foundGroup = true
                                        foundIdol = true
                                        cards.push({ image: combinedFiles[i], name: idol, group: group, era: era })
                                    }
                                } else if (groupCheck && eraCheck) {
                                    if (groupFilter.toLowerCase() == group.toLowerCase() && eraFilter == era.toLowerCase()) {
                                        foundGroup = true
                                        foundEra = true
                                        if (combinedFiles[i].includes("Group")) {
                                            groupCard = true
                                            cards.push({ image: combinedFiles[i], name: idol, group: group, era: era })
                                        }
                                    }
                                } else if (nameCheck && eraCheck) {
                                    if (idolFilter.toLowerCase() == idol.toLowerCase() && eraFilter.toLowerCase() == era.toLowerCase()) {
                                        foundIdol = true
                                        foundEra = true
                                        cards.push({ image: combinedFiles[i], name: idol, group: group, era: era })
                                    }
                                }
                            } else if (initialFilters.length == 3) {
                                if (groupFilter.toLowerCase() == group.toLowerCase() && idolFilter.toLowerCase() == idol.toLowerCase() && eraFilter.toLowerCase() == era.toLowerCase()) {
                                    foundGroup = true
                                    foundIdol = true
                                    foundEra = true
                                    cards.push({ image: combinedFiles[i], name: idol, group: group, era: era })
                                }
                            }
                        }

                        var unspecifiedCard;
                        // NO GROUPS, IDOLS, OR ERA MATCHED: If the player's search does not exactly match a group,
                        // idol, or era name, then all results that match the given string will be returned. For instance,
                        // if a player types "red" and there are no matched results for "red", then all results that include
                        // the string "red" will be returned.
                        for (i = 0; i < combinedFiles.length; i++) {
                            if (combinedFiles[i].includes("\\")) {
                                group = combinedFiles[i].substring(0, combinedFiles[i].indexOf("\\"))
                                interval = combinedFiles[i].substring(combinedFiles[i].indexOf("\\") + 1)
                                era = interval.substring(0, interval.indexOf("\\"))
                                idolImage = interval.substring(interval.indexOf("\\") + 1)
                            } else if (combinedFiles[i].includes("/")) {
                                group = combinedFiles[i].substring(0, combinedFiles[i].indexOf("/"))
                                interval = combinedFiles[i].substring(combinedFiles[i].indexOf("/") + 1)
                                era = interval.substring(0, interval.indexOf("/"))
                                idolImage = interval.substring(interval.indexOf("/") + 1)
                            }

                            idol = idolImage.substring(0, idolImage.indexOf("_"))
                            if (initialFilters.length == 1) {
                                if (!foundGroup && !foundEra && !foundIdol) {
                                    if (groupCheck) {
                                        if (combinedFiles[i].toLowerCase().includes(groupFilter.toLowerCase())) {
                                            if (combinedFiles[i].includes("Group")) {
                                                cards.push({ image: combinedFiles[i], name: idol, group: group, era: era })
                                            }
                                        }
                                    } else if (nameCheck) {
                                        if (combinedFiles[i].toLowerCase().includes(idolFilter.toLowerCase())) {
                                            cards.push({ image: combinedFiles[i], name: idol, group: group, era: era })
                                        }
                                    } else if (eraCheck) {
                                        if (combinedFiles[i].toLowerCase().includes(eraName.toLowerCase())) {
                                            cards.push({ image: combinedFiles[i], name: idol, group: group, era: era })
                                        }
                                    }
                                }
                            } else if (initialFilters.length == 2) {
                                var found = false
                                if ((!foundGroup && !foundIdol && !foundEra) || (foundGroup && !foundIdol && !foundEra) || (!foundGroup && foundIdol && !foundEra) || (!foundGroup && !foundIdol && foundEra)) {
                                    if (groupCheck && nameCheck) {
                                        if (combinedFiles[i].toLowerCase().includes(groupFilter.toLowerCase()) && combinedFiles[i].toLowerCase().includes(idolFilter.toLowerCase())) {
                                            if (idolFilter.toLowerCase() == idol.toLowerCase()) {
                                                foundIdol = true
                                                cards.push({ image: combinedFiles[i], name: idol, group: group, era: era })
                                            } else if (groupFilter.toLowerCase() == group.toLowerCase()) {
                                                foundGroup = true
                                                cards.push({ image: combinedFiles[i], name: idol, group: group, era: era })
                                            } else {
                                                unspecifiedCard = { image: combinedFiles[i], name: idol, group: group, era: era }
                                            }
                                        }
                                    } else if (nameCheck && eraCheck) {
                                        if (combinedFiles[i].toLowerCase().includes(idolFilter.toLowerCase()) && combinedFiles[i].toLowerCase().includes(eraFilter.toLowerCase())) {

                                            if (idol.toLowerCase() == idolFilter.toLowerCase()) {
                                                cards.push({ image: combinedFiles[i], name: idol, group: group, era: era })
                                                foundIdol = true
                                            } else if (era.toLowerCase() == eraFilter.toLowerCase()) {
                                                cards.push({ image: combinedFiles[i], name: idol, group: group, era: era })
                                                foundEra = true
                                            } else {
                                                unspecifiedCard = {image: combinedFiles[i], name: idol, group: group, era: era }
                                            }
                                        }

                                    } else if (groupCheck && eraCheck) {
                                        if (combinedFiles[i].toLowerCase().includes(eraFilter.toLowerCase()) && combinedFiles[i].toLowerCase().includes(groupFilter.toLowerCase())) {
                                            if (groupFilter.toLowerCase() == group.toLowerCase()) {
                                                if (combinedFiles[i].includes("Group")) {
                                                    cards.push({ image: combinedFiles[i], name: idol, group: group, era: era })
                                                }
                                                foundGroup = true
                                            } else if (eraFilter.toLowerCase() == era.toLowerCase()) {
                                                cards.push({ image: combinedFiles[i], name: idol, group: group, era: era })
                                                foundEra = true
                                            } else {
                                                unspecifiedCard = { image: combinedFiles[i], name: idol, group: group, era: era }
                                            }
                                        }
                                    }
                                }
                            } else if (initialFilters.length == 3) {
                                if ((!foundGroup && !foundIdol && !foundEra) || (foundGroup && !foundIdol && !foundEra) || (!foundGroup && foundIdol && !foundEra) || (!foundGroup && !foundIdol && foundEra)
                                    || (foundGroup && foundIdol && !foundEra) || (!foundGroup && foundIdol && foundEra) || (foundGroup && !foundIdol && foundEra)) {

                                    if (groupCheck && nameCheck && eraCheck) {
                                        if (combinedFiles[i].toLowerCase().includes(groupFilter.toLowerCase()) && combinedFiles[i].toLowerCase().includes(idolFilter.toLowerCase()) && combinedFiles[i].toLowerCase().includes(eraFilter.toLowerCase())) {
                                            if (groupFilter.toLowerCase() == group.toLowerCase()) {
                                                if (combinedFiles[i].includes("Group")) {
                                                    cards.push({ image: combinedFiles[i], name: idol, group: group, era: era })
                                                }
                                                foundGroup = true
                                            } else if (idolFilter.toLowerCase() == idol.toLowerCase()) {
                                                cards.push({ image: combinedFiles[i], name: idol, group: group, era: era })
                                                foundIdol = true
                                            } else if (eraFilter.toLowerCase() == era.toLowerCase()) {
                                                cards.push({ image: combinedFiles[i], name: idol, group: group, era: era })
                                                foundEra = true
                                            } else {
                                                unspecifiedCard = { image: combinedFiles[i], name: idol, group: group, era: era }
                                            }
                                        }
                                    }
                                }
                            }
                        }

                     
                        var selectedCard;
                        if(!foundGroup && !foundIdol && !foundEra) {
                            selectedCard = unspecifiedCard
                        }

                        if (cards.length != 0 ||(selectedCard != null && selectedCard != undefined)) {
                        
                            if(foundGroup || foundIdol || foundEra || cards.length != 0) {
                                selectedCard = cards[0]
                            }
                            var cardIcon = ""

                            if (selectedCard.era.includes(";")) {
                                selectedCard.era = selectedCard.era.replace(";", ":")
                            }

                            if (selectedCard.image.includes("Group")) {
                                cardIcon = "./img/group_icons/" + selectedCard.image
                            } else {
                                cardIcon = "./img/idol_icons/" + selectedCard.image
                            }

                            const canvas = Canvas.createCanvas(150, 130);
                            const context = canvas.getContext('2d');
                            const background = await Canvas.loadImage('transparent.png');
                            context.drawImage(background, 0, 0, canvas.width, canvas.height);

                            const idolIcon = await Canvas.loadImage(cardIcon);
                            context.drawImage(idolIcon, 5, 5, 138, 121);

                            const buffer = canvas.toBuffer();
                            const cardAttachment = { file: buffer, name: "addBadge.png" };


                            const addBadge = new Eris.RichEmbed()
                                .setTitle("<:confirm:905320713483866133> **Add Badge to Profile in Spot #" + verifiedSpot + "?**")
                                .setDescription(`**` + selectedCard.group + "** " + selectedCard.name + " (" + selectedCard.era + ")\n\nIf the badge shown is correct, press the film. Otherwise, find another badge by making the filters more detailed.")
                                .setColor("#9370DB")
                                .setImage("attachment://addBadge.png")
                                .setFooter(`${member.username}#${member.discriminator} | Adding Badge to Profile`, member.avatarURL, member.avatarURL)
                            messageOutput = await message.channel.createMessage({ embed: addBadge }, cardAttachment)
                            messageID = Object.values(messageOutput)[0]
                            message.channel.getMessage(messageID)
                                .then(message => {
                                    message.addReaction("🎞️")
                                    message.addReaction("❌")
                                })

                            message.channel.getMessage(messageID)
                                .then(async message => {
                                    const reactionListener = new ReactionHandler.continuousReactionStream(
                                        message,
                                        (userID) => userID != message.author.id,
                                        false,
                                        { max: 10, time: 60000 }
                                    );
                                    reactionListener.on('reacted', async (event) => {
                                        const badgeReaction = []
                                        if (event.emoji.name === "❌") {
                                            badgeReaction.push(event.userID);
                                            if (badgeReaction.includes(member.id)) {
                                                const canceledBadge = new Eris.RichEmbed()
                                                    .setTitle("**Adding Badge Canceled**")
                                                    .setDescription("**" + selectedCard.group + "** " + selectedCard.name + " (" + selectedCard.era + ")\n\n")
                                                    .setColor("#ff4d6d")
                                                    .setImage("attachment://addBadge.png")
                                                    .setFooter(`${member.username}#${member.discriminator} | Canceled Badge`, member.avatarURL, member.avatarURL)
                                                message.edit({ embed: canceledBadge }, cardAttachment)
                                                message.removeReactions("🎞️")
                                                message.removeReactions("❌")
                                            }
                                        } if (event.emoji.name === "🎞️") {
                                            badgeReaction.push(event.userID);
                                            if (badgeReaction.includes(member.id)) {
                                                const profileData = await profiles.findOne({ userID: member.id }) // Receives the updated profile

                                                if (profileData.numBadges < 7) {

                                                    var foundSpot = false

                                                    for (i = 0; i < profileData.badges.length; i++) {
                                                        if (profileData.badges[i].spot == verifiedSpot) {
                                                            foundSpot = true
                                                        }
                                                    }
                                                    if (verifiedSpot == 1 && !foundSpot) {
                                                        profile.badges.push({ name: selectedCard.name, group: selectedCard.group, era: selectedCard.era, icon: cardIcon, spot: 1, x: 10, y: 7, w: 138, h: 121 })
                                                        profile.numBadges = profileData.numBadges + 1
                                                    } else if (verifiedSpot == 2 && !foundSpot) {
                                                        profile.badges.push({ name: selectedCard.name, group: selectedCard.group, era: selectedCard.era, icon: cardIcon, spot: 2, x: 155, y: 7, w: 138, h: 121 })
                                                        profile.numBadges = profileData.numBadges + 1
                                                    } else if (verifiedSpot == 3 && !foundSpot) {
                                                        profile.numBadges = profileData.numBadges + 1
                                                        profile.badges.push({ name: selectedCard.name, group: selectedCard.group, era: selectedCard.era, icon: cardIcon, spot: 3, x: 10, y: 135, w: 138, h: 121 })
                                                    } else if (verifiedSpot == 4 && !foundSpot) {
                                                        profile.numBadges = profileData.numBadges + 1
                                                        profile.badges.push({ name: selectedCard.name, group: selectedCard.group, era: selectedCard.era, icon: cardIcon, spot: 4, x: 155, y: 135, w: 138, h: 121 })
                                                    } else if (verifiedSpot == 5 && !foundSpot) {
                                                        profile.numBadges = profileData.numBadges + 1
                                                        profile.badges.push({ name: selectedCard.name, group: selectedCard.group, era: selectedCard.era, icon: cardIcon, spot: 5, x: 10, y: 263, w: 138, h: 121 })
                                                    } else if (verifiedSpot == 6 && !foundSpot) {
                                                        profile.numBadges = profileData.numBadges + 1
                                                        profile.badges.push({ name: selectedCard.name, group: selectedCard.group, era: selectedCard.era, icon: cardIcon, spot: 6, x: 155, y: 263, w: 138, h: 121 })
                                                    }

                                                    if (!foundSpot) {
                                                        profile.save()
                                                        const successfulBadge = new Eris.RichEmbed()
                                                            .setTitle("<:confirm:905320713483866133> **Successfully Added Badge in Spot #" + verifiedSpot + "**")
                                                            .setDescription("**" + selectedCard.group + "** " + selectedCard.name + " (" + selectedCard.era + ")")
                                                            .setColor("#9370DB")
                                                            .setImage("attachment://addBadge.png")
                                                            .setFooter(`${member.username}#${member.discriminator} | Added Badge`, member.avatarURL, member.avatarURL)
                                                        message.edit({ embed: successfulBadge }, cardAttachment)
                                                        message.removeReactions("🎞️")
                                                        message.removeReactions("❌")
                                                    } else {
                                                        const badgeLimit = new Eris.RichEmbed()
                                                            .setTitle("**Badge Spot Full**")
                                                            .setDescription("**" + selectedCard.group + "** " + selectedCard.name + " (" + selectedCard.era + ")")
                                                            .setColor("#ff4d6d")
                                                            .setImage("attachment://addBadge.png")
                                                            .setFooter(`${member.username}#${member.discriminator} | Badge Already Exists in Spot`, member.avatarURL, member.avatarURL)
                                                        message.edit({ embed: badgeLimit }, cardAttachment)
                                                        message.removeReactions("🎞️")
                                                        message.removeReactions("❌")
                                                    }
                                                } else {
                                                    const badgeLimit = new Eris.RichEmbed()
                                                        .setTitle("**Badge Limit Exceeded**")
                                                        .setDescription("**" + selectedCard.group + "** " + selectedCard.name + " (" + selectedCard.era + ")")
                                                        .setColor("#ff4d6d")
                                                        .setImage("attachment://addBadge.png")
                                                        .setFooter(`${member.username}#${member.discriminator} | Badge Limit Exceeded`, member.avatarURL, member.avatarURL)
                                                    message.edit({ embed: badgeLimit }, cardAttachment)
                                                    message.removeReactions("🎞️")
                                                    message.removeReactions("❌")
                                                }
                                            }
                                        }
                                    })
                                })
                        } else {
                            const incorrectFormat = new Eris.RichEmbed()
                                .setTitle("")
                                .setDescription(`<:exclaim:906289233814241290> No cards could be found with the given filter. Try making the filters more detailed.`)
                                .setColor("#9370DB")
                                .setFooter(`${member.username}#${member.discriminator} | Invalid Format`, member.avatarURL, member.avatarURL)
                            message.channel.createMessage({ embed: incorrectFormat })

                        }
                    }
                } else {
                    const incorrectFormat = new Eris.RichEmbed()
                        .setTitle("")
                        .setDescription(`<:exclaim:906289233814241290> Badges are required to be put in specific spots. Provide a spot number 1-6 before providing group, name, or era filters.`)
                        .setColor("#9370DB")
                        .setFooter(`${member.username}#${member.discriminator} | Invalid Format`, member.avatarURL, member.avatarURL)
                    message.channel.createMessage({ embed: incorrectFormat })
                }
            }
        } else {
            const noProfile = new Eris.RichEmbed()
                .setTitle("")
                .setDescription(`<:exclaim:906289233814241290> In order add badges to your profile, a profile must be created first. Use the profile command to create your profile.`)
                .setColor("#9370DB")
                .setFooter(`${member.username}#${member.discriminator} | Profile Does Not Exist`, member.avatarURL, member.avatarURL)
            message.channel.createMessage({ embed: noProfile })
        }
    }
}
