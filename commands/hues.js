/*---------------------------------------LOADING IN THE PACKAGES---------------------------------------*/

// MODELS: Gets the necessary data models from the database to complete the hue process

const user = require('../models/user.js');
const hues = require('../models/ownedHues.js')


// EMBED REACTION HANDLER: Allows the player to interact with the embeds
const ReactionHandler = require('eris-reactions');

/*---------------------------------HUES COMMANDS: BEGINNING THE HUES PROCESS----------------------*/

module.exports = {
    name: 'hues',
    description: "Displays the hue lookbook of a player",
    aliases: [""],
    async execute(client, message, args, Eris) {

        const viewer = message.member.user;

        var player = "";
        var playerInfo;
        var playerName = ""
        var playerDiscriminator = ""
        var playerAvatar = ""
        if (message.mentions.length >= 1 || message.mentions.length < 1 && args.length >= 1) {

            const search = args
            if (message.mentions.length >= 1) {
                player = message.channel.guild.members.get(message.mentions[0].id).user.id
                playerInfo = message.channel.guild.members.get(message.mentions[0].id).user
                playerName = message.channel.guild.members.get(message.mentions[0].id).user.username
                playerDiscriminator = message.channel.guild.members.get(message.mentions[0].id).user.discriminator
                playerAvatar = message.channel.guild.members.get(message.mentions[0].id).user.avatarURL
            } else {
                const checkPlayer = await user.findOne({ userID: search[0] })
                if (checkPlayer != null && checkPlayer != undefined) {
                    player = checkPlayer.userID
                    playerInfo = checkPlayer
                    playerName = checkPlayer.name
                    playerDiscriminator = checkPlayer.discriminator
                    playerAvatar = checkPlayer.avatar
                }
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

            if (player != "") {
                if (search[0] == player || search[0] == "<@!" + message.channel.guild.members.get(message.mentions[0].id).user.id + ">" || search[0] == "<@" + message.channel.guild.members.get(message.mentions[0].id).user.id + ">") {
                    search.shift()
                }
            } else if (player == "") {
                player = viewer.id
                playerInfo = viewer
                playerName = viewer.username
                playerDiscriminator = viewer.discriminator
                playerAvatar = viewer.avatarURL
            }
        }

        var messager = false

        if (player == "") {
            player = viewer.id
            playerInfo = viewer
            playerName = viewer.username
            playerDiscriminator = viewer.discriminator
            playerAvatar = viewer.avatarURL
            messager = true
        }

        const owner = await user.findOne({ userID: player })

        if ((owner != null && owner != undefined) || messager) {
            if (owner != null && owner != undefined) {
                const foundHues = []

                for (i = 0; i < owner.hues.length; i++) {
                    foundHues.push(owner.hues[i])
                }

                if (foundHues.length != 0) {
                    const ownedHues = await hues.find({ $and: [{ owner: player }, { code: { $in: foundHues } }] })

                    if (ownedHues.length != 0) {

                        const huesList = []

                        var pages = [];
                        let pageCount = 0;


                        for (i = 0; i < ownedHues.length; i++) {
                            huesList.push('`' + ownedHues[i].code + '` **' + ownedHues[i].name + '** | ' + ownedHues[i].hexCode + ' (' + ownedHues[i].quantity + ')\n')

                            if (i % 10 === 0) {
                                pageCount += 1;
                                pages.push(pageCount)
                            }
                        }

                        let page = 1;

                        var hueIndex = Math.floor(Math.random() * ownedHues.length)

                        const hueLookbook = new Eris.RichEmbed()
                            .setTitle("")
                            .setDescription("**" + playerName.toUpperCase() + "'S HUE LOOKBOOK**\n\n**Featured Hue**\n`" + ownedHues[hueIndex].code + "` " + ownedHues[hueIndex].name + "\n\n" + huesList.slice((page) * 10 - 10, (page) * 10).toString().replace(/,/g, ""))
                            .setColor(ownedHues[hueIndex].hexCode)
                            .setAuthor(`${playerName}#${playerDiscriminator}`, playerAvatar, playerAvatar)
                            .setFooter(`${viewer.username}#${viewer.discriminator} | Viewing Lookbook`, viewer.avatarURL, viewer.avatarURL)

                        messageOutput = await message.channel.createMessage({ embed: hueLookbook })
                        messageID = Object.values(messageOutput)[0]

                        if (huesList.length >= 11) {

                            message.channel.getMessage(messageID)
                                .then(function (message) {
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
                                                const newIndex = Math.floor(Math.random() * ownedHues.length)
                                                hueLookbook.setDescription("**" + playerName.toUpperCase() + "'S HUE LOOKBOOK**\n\n**Featured Hue**\n`" + ownedHues[newIndex].code + "` " + ownedHues[newIndex].name + "\n\n" + huesList.slice((page) * 10 - 10, (page) * 10).toString().replace(/,/g, ""))
                                                hueLookbook.setColor(ownedHues[newIndex].hexCode)
                                                message.edit({ embed: hueLookbook })
                                            }
                                        }
                                        if (event.emoji.name == "◀️") {
                                            viewerReaction.push(event.userID)
                                            if (viewerReaction.includes(viewer.id)) {
                                                if (page == 1) return;
                                                page--;
                                                const newIndex = Math.floor(Math.random() * ownedHues.length)
                                                hueLookbook.setDescription("**" + playerName.toUpperCase() + "'S HUE LOOKBOOK**\n\n**Featured Hue**\n`" + ownedHues[newIndex].code + "` " + ownedHues[newIndex].name + "\n\n" + huesList.slice((page) * 10 - 10, (page) * 10).toString().replace(/,/g, ""))
                                                hueLookbook.setColor(ownedHues[newIndex].hexCode)
                                                message.edit({ embed: hueLookbook })
                                            }
                                        }

                                        if (event.emoji.name == "▶️") {
                                            viewerReaction.push(event.userID)
                                            if (viewerReaction.includes(viewer.id)) {
                                                if (page == pages.length) return;
                                                page++;
                                                const newIndex = Math.floor(Math.random() * foundHues.length)
                                                hueLookbook.setDescription("**" + playerName.toUpperCase() + "'S HUE LOOKBOOK**\n\n**Featured Hue**\n`" + ownedHues[newIndex].code + "` " + ownedHues[newIndex].name + "\n\n" + huesList.slice((page) * 10 - 10, (page) * 10).toString().replace(/,/g, ""))
                                                hueLookbook.setColor(ownedHues[newIndex].hexCode)
                                                message.edit({ embed: hueLookbook })
                                            }
                                        }

                                        if (event.emoji.name == "⏩") {
                                            viewerReaction.push(event.userID)
                                            if (viewerReaction.includes(viewer.id)) {
                                                if (page == pages.length) return;
                                                page = pages.length;
                                                const newIndex = Math.floor(Math.random() * ownedHues.length)
                                                hueLookbook.setDescription("**" + playerName.toUpperCase() + "'S HUE LOOKBOOK**\n\n**Featured Hue**\n`" + ownedHues[newIndex].code + "` " + ownedHues[newIndex].name + "\n\n" + huesList.slice((page) * 10 - 10, (page) * 10).toString().replace(/,/g, ""))
                                                hueLookbook.setColor(ownedHues[newIndex].hexCode)
                                                message.edit({ embed: hueLookbook })
                                            }
                                        }

                                    })

                                })

                        }

                    } else {
                        const hueLookbook = new Eris.RichEmbed()
                            .setTitle("")
                            .setDescription("**" + playerName.toUpperCase() + "'S HUE LOOKBOOK**\nNo hues can be found within this lookbook")
                            .setColor("#33A7FF")
                            .setAuthor(`${playerName}#${playerDiscriminator}`, playerAvatar, playerAvatar)
                            .setFooter(`${viewer.username}#${viewer.discriminator} | Viewing Lookbook`, viewer.avatarURL, viewer.avatarURL)
                        messageOutput = await message.channel.createMessage({ embed: hueLookbook })
                        messageID = Object.values(messageOutput)[0]

                    }
                } else {
                    const hueLookbook = new Eris.RichEmbed()
                        .setTitle("")
                        .setDescription("**" + playerName.toUpperCase() + "'S HUE LOOKBOOK**\nNo hues can be found within this lookbook")
                        .setColor("#33A7FF")
                        .setAuthor(`${playerName}#${playerDiscriminator}`, playerAvatar, playerAvatar)
                        .setFooter(`${viewer.username}#${viewer.discriminator} | Viewing Lookbook`, viewer.avatarURL, viewer.avatarURL)
                    messageOutput = await message.channel.createMessage({ embed: hueLookbook })
                    messageID = Object.values(messageOutput)[0]
                }
            } else if (owner == null || owner == undefined) {
                if (player != viewer.id) {
                    const noPlayer = new Eris.RichEmbed()
                        .setTitle("")
                        .setDescription("<:exclaim:906289233814241290> No player with the given information can be found within the Icon playerbase")
                        .setColor("#9370DB")
                        .setFooter(`${viewer.username}#${viewer.discriminator} | Viewing Lookbook`, viewer.avatarURL, viewer.avatarURL)
                    message.channel.createMessage({ embed: noPlayer })

                } else if (player == viewer.id) {
                    const hueLookbook = new Eris.RichEmbed()
                        .setTitle("")
                        .setDescription("**" + playerName.toUpperCase() + "'S HUE LOOKBOOK**\nNo hues can be found within this lookbook")
                        .setColor("#33A7FF")
                        .setAuthor(`${playerName}#${playerDiscriminator}`, playerAvatar, playerAvatar)
                        .setFooter(`${viewer.username}#${viewer.discriminator} | Viewing Lookbook`, viewer.avatarURL, viewer.avatarURL)
                    messageOutput = await message.channel.createMessage({ embed: hueLookbook })
                    messageID = Object.values(messageOutput)[0]
                }

            }

        }
    }
}




