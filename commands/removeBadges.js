/*---------------------------------------LOADING IN THE PACKAGES-----------------------------------*/

// MODELS: Gets the necessary data models from the database to complete the profile badge removal process
const profiles = require('../models/profile.js');

/*-----------------------------------------PROFILE REMOVE BADGES COMMAND: BEGIN REMOVING BADGE PROCESS-----------------------------*/
module.exports = {
    name: 'removeBadges',
    description: "Allows players to add badges to their profile",
    aliases: ["rmbadges", "removebadges"],
    async execute(client, message, args, Eris) {

        const member = message.member.user;
        const profile = await profiles.findOne({ userID: member.id })

        if (profile != null && profile != undefined) {

            if (profile.badges.length >= 1) {
                profile.badges = []
                profile.numBadges = 0
                profile.save()

                const successfulRemoval = new Eris.RichEmbed()
                    .setTitle("")
                    .setDescription(`All badges within your profile have successfully been removed`)
                    .setColor("#9370DB")
                    .setFooter(`${member.username}#${member.discriminator} | Removed Badges`, member.avatarURL, member.avatarURL)
                message.channel.createMessage({ embed: successfulRemoval })

            } else {
                const noProfile = new Eris.RichEmbed()
                    .setTitle("")
                    .setDescription(`<:exclaim:906289233814241290> There are no badges that are able to be removed`)
                    .setColor("#9370DB")
                    .setFooter(`${member.username}#${member.discriminator} | No Badges Exist`, member.avatarURL, member.avatarURL)
                message.channel.createMessage({ embed: noProfile })
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