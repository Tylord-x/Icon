/*---------------------------------------LOADING IN THE PACKAGES-----------------------------------*/

// MODELS: Gets the necessary data model from the database to complete the privating process
const user = require('../models/user.js');

/*-----------------------------------BAN COMMAND: BEGINNING BAN PROCESS--------------------------*/
module.exports = {
    name: 'unblacklist',
    description: "Unblacklists players once determined that their violations were minor or nonexistent",
    aliases: [],
    async execute(client, message, args, Eris) {
        const teamMember = message.member.user; // Stores the information of the messaging team member

        // UNBANNER: Only the developers are able to unban players
        if (teamMember.id == "729810040395137125" || teamMember.id == "665806267020738562") {

            if (args != null && args != undefined) {
                if (args.length >= 1) {
                    const unblacklistPlayer = await user.findOne({ userID: args[0] })
                    if (unblacklistPlayer.blacklisted) {
                        unblacklistPlayer.blacklisted = false
                        const unblacklisted = new Eris.RichEmbed()
                            .setTitle("")
                            .setDescription("The chosen player has been officially **unblacklisted** from Icon. After further explanation, they have been reinstated.\n\n**"
                                + unblacklistPlayer.name + "#" + unblacklistPlayer.discrim + "**\n" + unblacklistPlayer.userID)
                            .setColor("#9370DB")
                            .setFooter(`${teamMember.username}#${teamMember.discriminator} | Unblacklisted Player`, teamMember.avatarURL, teamMember.avatarURL)
                        message.channel.createMessage({ embed: unblacklisted })
                        unblacklistPlayer.save()
                    } else {
                        const notBlacklisted = new Eris.RichEmbed()
                        .setTitle("")
                        .setDescription("The chosen player is not currently **blacklisted**. Blacklisting will officially initiate the blacklist the player and confiscate their cards. Otherwise, they will remain unblacklisted.\n\n**"
                            + unblacklistPlayer.name + "#" + unblacklistPlayer.discrim + "**\n" + unblacklistPlayer.userID)
                        .setColor("#9370DB")
                        .setFooter(`${teamMember.username}#${teamMember.discriminator} | Unblacklisting Player`, teamMember.avatarURL, teamMember.avatarURL)
                    message.channel.createMessage({ embed: notBlacklisted })
                    }
                }
            }
        }
    }
}