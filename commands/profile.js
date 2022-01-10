/*---------------------------------------LOADING IN THE PACKAGES-----------------------------------*/

// MODELS: Gets the necessary data models from the database to complete the profile process
const user = require('../models/user.js');
const profile = require('../models/profile.js');

// CANVAS: Provides all the necessary components of Canvas and its related packages. The fonts used
// on the displayed cards registered with the registerFont component of Canvas.
const Canvas = require('canvas');
const { registerFont } = require('canvas');
registerFont('./fonts/Prompt-Bold.ttf', { family: 'Prompt-Bold' })
registerFont('./fonts/Prompt-Medium.ttf', { family: 'Prompt-Medium' })
registerFont('./fonts/Prompt-Regular.ttf', { family: 'Prompt' })

/*-----------------------------------------PROFILE COMMAND: BEGIN PROFILE PROCESS-----------------------------*/
module.exports = {
    name: 'profile',
    description: "Allows players to create a profile",
    aliases: ["p"],
    async execute(client, message, args, Eris) {
        const viewer = message.member.user;
        var messager = false
        var player = "";
        var playerInfo;
        var playerName = "" // Depending on the chosen player (mentioning, id, or viewer), will provide their name
        var playerDiscriminator = "" // Depending on the chosen player (mentioning, id, or viewer), will provide their discriminator
        var playerAvatar = "" // Depending on the chosen player (mentioning, id, or viewer), will provide their avatar url
        const search = args
        if (message.mentions.length >= 1 || message.mentions.length < 1 && args.length >= 1) {
            // MENTION: If a player is mentioned, 
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
        }

        if (player == "") {
            player = viewer.id
            playerInfo = viewer
            playerName = viewer.username
            playerDiscriminator = viewer.discriminator
            playerAvatar = viewer.avatarURL
            messager = true
        }

        const playerData = await user.findOne({ userID: player })

        if ((playerData != undefined && playerData != null) || messager) {
            if (playerData != undefined && playerData != null) {
                const profiles = await profile.findOne({ userID: player })
                if (profiles == null || profiles == undefined) {
                    if (player == viewer.id) {
                        const newData = new profile({
                            userID: viewer.id,
                            companyName: "",
                            description: "",
                            color: "",
                            badges: [],
                            specialBadges: [],
                            brandAmbassador: [],
                            collects: "",
                            numBadges: 0
                        })
                        newData.save().catch(error => console.log(error));
                        const description = "\n\n<:message:908957428576583710> **Description**\nInsert freeform content about you, your gameplay style, or other information you want to showcase with `description` or its shortcut, `desc`"
                        const collection = "\n\n<:list:908958914459086868> **Collects**\nCreate a list or description of the artists or cards you collect with `collects`"
                        const color = "\n\n<:design:908970027103961129> **Color**\nCustomize the sidebar and visuals of your profile with a splash of color using `color`"
                        const brandAndBadges = "\n\n<:slideshow:908972644102201364> **Visuals**\n`badge` |  `brand`"
                        const guide = `Welcome to your new profile, ${viewer.username}#${viewer.discriminator}!` + description + collection + color + brandAndBadges
                        const profileView = new Eris.RichEmbed()
                            .setTitle("")
                            .setDescription(`**SPOTLIGHT ON ${viewer.username.toUpperCase()}**\n\n` + guide)
                            .setColor("#33A7FF")
                            .setAuthor(`${viewer.username}#${viewer.discriminator}`, viewer.avatarURL, viewer.avatarURL)
                            .setFooter(`${viewer.username}#${viewer.discriminator} | Viewing Profile`, playerAvatar, playerAvatar)
                        message.channel.createMessage({ embed: profileView })

                    }

                } else {

                    /*-------------------------PROFILE HAS BEEN FOUND AND WILL BE DISPLAYED--------------------------*/

                    // CANVAS: Sets up the canvas that will hold all the visual components of the profile
                    const canvas = Canvas.createCanvas(880, 400);
                    const context = canvas.getContext('2d');
                    const background = await Canvas.loadImage('transparent.png');
                    context.drawImage(background, 0, 0, canvas.width, canvas.height)

                    /*-----------------------------------PROFILE DESCRIPTION----------------------------*/
                    // DESCRIPTION: A player can add a description to their profile. If the profile description has been
                    // found to be filled out within the profile, the description will be shown. If the profile description
                    // is empty, the description will be a guide of how to fill out the description.
                    var description = ""
                    if (profiles.description != "") {
                        description = "\n" + profiles.description
                    } else {
                        description = "\n\n<:message:908957428576583710> **Description**\nInsert freeform content about you, your gameplay style, or other information you want to showcase with `description` or its shortcut, `desc`"
                    }

                    /*------------------------------------COLLECTION LIST-----------------------------------*/

                    // COLLECTION LIST: Players are able to provide a list of the artists they are currently collecting. It is freeform
                    // save for the character limit of 1010 characters.
                    var collects = ""
                    if (profiles.collects != "") {
                        collects = "\n\n**Collects**\n" + profiles.collects
                    } else {
                        collects = "\n\n<:list:908958914459086868> **Collects**\nCreate a list or description of the artists or cards you collect with `collects`"
                    }

                    /*------------------------------------COLORS-----------------------------------*/

                    // COLOR: A player can change the default color of their profile by adding
                    // a valid hex code.
                    var color = ""
                    var colorGuide = ""
                    if (profiles.color != "") {
                        color = profiles.color
                    } else {
                        color = "#33A7FF"
                        colorGuide = "\n\n<:design:908970027103961129> **Color**\nCustomize the sidebar and visuals of your profile with a splash of color using `color`"
                    }

                    /*-------------------------------------------BADGES---------------------------------------------*/

                    var badgeGuide = ""
                    //BADGES: If badges are set, they will show up within the profile
                    if (profiles.badges.length != 0) {
                        for (i = 0; i < profiles.badges.length; i++) {
                            const idolIcon = await Canvas.loadImage(profiles.badges[i].icon);
                            context.drawImage(idolIcon, profiles.badges[i].x + 8, profiles.badges[i].y + 8, profiles.badges[i].w, profiles.badges[i].h);
                        }

                    } else {
                        badgeGuide = "`badge`"
                    }

                    /*-----------------------------------------BRAND AMBASSADOR-----------------------------------------------*/

                    var brandGuide = ""
                    if (profiles.brandAmbassador.length != 0) {

                        /*----------------------------------------RIGHT SIDE BAR-----------------------------------*/
                        context.fillStyle = "#000000"
                        context.fillRect(643, 6, 200, 400)

                        context.font = '25px Prompt-Bold';
                        context.textAlign = "center"
                        context.fillStyle = color
                        context.fillText("BRAND", 743, 95);

                        context.font = '20px Prompt-Bold';
                        context.textAlign = "center"
                        context.fillStyle = "#FFFFFF"
                        context.fillText("AMBASSADOR", 743, 120);

                        context.font = '20px Prompt-Bold';
                        context.textAlign = "center"
                        context.fillStyle = "#FFFFFF"
                        if (profiles.brandAmbassador.name == "Group") {
                            context.fillText('GROUP', 743, 300);
                        } else {
                            context.fillText(profiles.brandAmbassador.group.toUpperCase(), 743, 300);
                        }

                        const brandIcon = await Canvas.loadImage(profiles.brandAmbassador.icon);
                        context.drawImage(brandIcon, 675, 140, 138, 121);

                        /*----------------------------------------MAIN IMAGE AREA--------------------------------*/

                        const ambassador = await Canvas.loadImage(profiles.brandAmbassador.image);
                        context.drawImage(ambassador, 315, 6, 329, 400);

                        context.fillStyle = "#000000"
                        context.fillRect(315, 340, 329, 60)
                        context.strokeStyle = color;
                        context.strokeRect(330, 350, 300, 40);


                        if (profiles.brandAmbassador.name == "Group") {
                            context.font = '28px "Prompt-Bold"';
                            context.textAlign = "center";
                            context.fillStyle = "#FFFFFF"
                            var groupName = profiles.brandAmbassador.group.toUpperCase();
                            context.fillText(groupName, 478, 380);
                        } else {
                            context.font = '28px "Prompt-Bold"';
                            context.textAlign = "center";
                            context.fillStyle = "#FFFFFF"
                            var idolName = profiles.brandAmbassador.name.toUpperCase();
                            context.fillText(idolName, 478, 380);
                        }

                    } else {
                        brandGuide = "`brand`"
                    }

                    var brandAndBadges = ""
                    if (brandGuide != "" || badgeGuide != "") {
                        if (brandGuide != "" && badgeGuide != "") {
                            brandAndBadges = "\n\n<:slideshow:908972644102201364> **Visuals**\n" + badgeGuide + " | " + brandGuide
                        } else if (brandGuide != "" && badgeGuide == "") {
                            brandAndBadges = "\n\n<:slideshow:908972644102201364> **Visuals**\n" + brandGuide
                        } else if (brandGuide == "" && badgeGuide != "") {
                            brandAndBadges = "\n\n<:slideshow:908972644102201364> **Visuals**\n" + badgeGuide
                        }
                    }

                    const buffer = canvas.toBuffer();
                    const attachment = { file: buffer, name: "profile.png" };

                    var guide = ""
                    if (profiles.description == "" && profiles.collects == "" && profiles.color == "" && profiles.badges.length == 0 && profiles.brandAmbassador.length == 0) {
                        guide = `\n\nWelcome to your new profile, ${playerName}#${playerDiscriminator}!`
                    }

                    const profileView = new Eris.RichEmbed()
                        .setTitle("")
                        .setDescription(`**SPOTLIGHT ON ${playerName.toUpperCase()}**` + guide + description + collects + colorGuide + brandAndBadges)
                        .setColor(color)
                        .setAuthor(`${playerName}#${playerDiscriminator} `, playerAvatar, playerAvatar)
                    if (profiles.brandAmbassador.length == 0 && profiles.badges.length == 0) {
                        profileView.setFooter(`${viewer.username}#${viewer.discriminator} | Viewing Profile`, viewer.avatarURL, viewer.avatarURL)
                        message.channel.createMessage({ embed: profileView })
                    } else if (profiles.brandAmbassador.length != 0 || profiles.badges.length != 0) {
                        if (profiles.brandAmbassador.length != 0) {
                            if (profiles.brandAmbassador.name == "Group") {
                                profileView.setFooter(`${viewer.username}#${viewer.discriminator} | Feat. ` + profiles.brandAmbassador.group, viewer.avatarURL, viewer.avatarURL)
                            } else {
                                profileView.setFooter(`${viewer.username}#${viewer.discriminator} | Feat. ` + profiles.brandAmbassador.group + " " + profiles.brandAmbassador.name, viewer.avatarURL, viewer.avatarURL)
                            }
                        } else {
                            profileView.setFooter(`${viewer.username}#${viewer.discriminator} | Viewing Profile`, viewer.avatarURL, viewer.avatarURL)
                        }
                        profileView.setImage("attachment://profile.png")
                        message.channel.createMessage({ embed: profileView }, attachment)
                    }



                }
            } else if (playerData == undefined || playerData == null) {
                if (player != viewer.id) {
                    const noPlayer = new Eris.RichEmbed()
                    .setTitle("")
                    .setDescription("<:exclaim:906289233814241290> No player with the given information can be found within the Icon playerbase")
                    .setColor("#9370DB")
                    .setFooter(`${viewer.username}#${viewer.discriminator} | Viewing Profile`, viewer.avatarURL, viewer.avatarURL)
                message.channel.createMessage({ embed: noPlayer })
                } else if (player == viewer.id) {
                    setTimeout(async () => {
                        const newPlayer = await user.findOne({ userID: player })
                        if (newPlayer != undefined && newPlayer != null) {
                            const profiles = await profile.findOne({ userID: newPlayer.userID })
                            if (profiles == null || profiles == undefined) {
                                if (player == viewer.id) {
                                    const newData = new profile({
                                        userID: viewer.id,
                                        companyName: "",
                                        description: "",
                                        color: "",
                                        badges: [],
                                        specialBadges: [],
                                        brandAmbassador: [],
                                        collects: "",
                                        numBadges: 0
                                    })
                                    newData.save().catch(err => console.log(err));

                                    const description = "\n\n<:message:908957428576583710> **Description**\nInsert freeform content about you, your gameplay style, or other information you want to showcase with `description` or its shortcut, `desc`"
                                    const collection = "\n\n<:list:908958914459086868> **Collects**\nCreate a list or description of the artists or cards you collect with `collects`"
                                    const color = "\n\n<:design:908970027103961129> **Color**\nCustomize the sidebar and visuals of your profile with a splash of color using `color`"
                                    const brandAndBadges = "\n\n<:slideshow:908972644102201364> **Visuals**\n`badge` |  `brand`"
                                    const guide = `Welcome to your new profile, ${viewer.username}#${viewer.discriminator}!` + description + collection + color + brandAndBadges
                                    const profileView = new Eris.RichEmbed()
                                        .setTitle("")
                                        .setDescription(`**SPOTLIGHT ON ${viewer.username.toUpperCase()}**\n\n` + guide)
                                        .setColor("#33A7FF")
                                        .setAuthor(`${viewer.username}#${viewer.discriminator}`, viewer.avatarURL, viewer.avatarURL)
                                        .setFooter(`${viewer.username}#${viewer.discriminator} | Viewing Profile`, playerAvatar, playerAvatar)
                                    message.channel.createMessage({ embed: profileView })
                                }
                            }
                        }

                    }, 250)

                }
            }


        }

    }
}