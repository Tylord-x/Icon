/*---------------------------------------LOADING IN THE PACKAGES-----------------------------------*/

// MODELS: Gets the necessary data models from the database to complete the profile color process
const profiles = require('../models/profile.js');
const cardInfo = require('../models/cardInfo.js');

const Canvas = require('canvas');

// REACTION HANDLER: Allows the player to interact with the embeds
const ReactionHandler = require('eris-reactions');

/*-----------------------------------------PROFILE BADGE COMMAND: BEGIN REMOVAL PROCESS-----------------------------*/
module.exports = {
    name: 'removeBadge',
    description: "Allows players to remove badges from their profile",
    aliases: ["rmbadge", "removebadge"],
    async execute(client, message, args, Eris) {

        const member = message.member.user;
        const profile = await profiles.findOne({ userID: member.id })
        const content = args

        if (profile != null && profile != undefined) {

            if (content.length >= 1) {

                var verifiedSpot;
                if (Number(content[0]) > 0 && Number(content[0]) < 7) {
                    verifiedSpot = Number(content[0])
                }

                if (verifiedSpot != undefined && verifiedSpot != null) {

                    if (profile.badges.length >= 1) {
                        var badgeTitle = ""
                        var badgeIndex;
                        for (i = 0; i < profile.badges.length; i++) {
                            if (verifiedSpot == profile.badges[i].spot) {
                                if (profile.badges[i].name == "Group") {
                                    badgeTitle = "**" + profile.badges[i].group + "** (" + profile.badges[i].era + ")"
                                    badgeIndex = i
                                } else {
                                    badgeTitle = "** " + profile.badges[i].group + "** " + profile.badges[i].name + " (" +  profile.badges[i].era + ")"
                                    badgeIndex = i
                                }
                            }
                        }

                        if (badgeIndex != null && badgeIndex != undefined) {
                            profile.badges.splice(badgeIndex, 1)
                            profile.numBadges = profile.numBadges - 1
                            profile.save()

                            const successfulRemoval = new Eris.RichEmbed()
                                .setTitle("")
                                .setDescription("The " + badgeTitle + " Badge in **Spot #" + verifiedSpot + "** has been removed")
                                .setColor("#9370DB")
                                .setFooter(`${member.username}#${member.discriminator} | Removed Badge`, member.avatarURL, member.avatarURL)
                            message.channel.createMessage({ embed: successfulRemoval })
                        } else {
                            const noBadges = new Eris.RichEmbed()
                                .setTitle("")
                                .setDescription(`<:exclaim:906289233814241290> There are no badges that are able to be removed from the given spot`)
                                .setColor("#9370DB")
                                .setFooter(`${member.username}#${member.discriminator} | Badge Removal Failed`, member.avatarURL, member.avatarURL)
                            message.channel.createMessage({ embed: noBadges })
                        }

                    } else {
                        const noBadges = new Eris.RichEmbed()
                            .setTitle("")
                            .setDescription(`<:exclaim:906289233814241290> There are no badges left that are able to be removed`)
                            .setColor("#9370DB")
                            .setFooter(`${member.username}#${member.discriminator} | No Badges Exist`, member.avatarURL, member.avatarURL)
                        message.channel.createMessage({ embed: noBadges })
                    }
                } else {
                    const noSlot = new Eris.RichEmbed()
                        .setTitle("")
                        .setDescription(`<:exclaim:906289233814241290> A slot numbered 1-6 of a badge must be given in order to remove the badge`)
                        .setColor("#9370DB")
                        .setFooter(`${member.username}#${member.discriminator} | Badge Removal Failed`, member.avatarURL, member.avatarURL)
                    message.channel.createMessage({ embed: noSlot })
                }

            } else {
                const noProfile = new Eris.RichEmbed()
                    .setTitle("")
                    .setDescription(`<:exclaim:906289233814241290> In order remove badges to your profile, a profile must be created first. Use the profile command to create your profile.`)
                    .setColor("#9370DB")
                    .setFooter(`${member.username}#${member.discriminator} | Profile Does Not Exist`, member.avatarURL, member.avatarURL)
                message.channel.createMessage({ embed: noProfile })
            }

        }
    }
}