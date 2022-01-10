/*---------------------------------------LOADING IN THE PACKAGES-----------------------------------*/

// MODELS: Gets the necessary data model from the database to complete the privating process
const user = require('../models/user.js');

/*-----------------------------------BAN COMMAND: BEGINNING BAN PROCESS--------------------------*/
module.exports = {
    name: 'unban',
    description: "Unbans players once determined that their violations were minor or nonexistent",
    aliases: [],
    async execute(client, message, args, Eris) {
        const teamMember = message.member.user; // Stores the information of the messaging team member

        // UNBANNER: Only the developers are able to unban players
        if (teamMember.id == "729810040395137125" || teamMember.id == "665806267020738562") {

            if (args != null && args != undefined) {
                if (args.length >= 1) {
                    const unbannedPlayer = await user.findOne({ userID: args[0] })
                    if (unbannedPlayer.banned) {
                        unbannedPlayer.banned = false
                        const unbanned = new Eris.RichEmbed()
                            .setTitle("")
                            .setDescription("The chosen player has been officially **unbanned** from Icon. After further explanation, they have been reinstated.\n\n**"
                                + unbannedPlayer.name + "#" + unbannedPlayer.discrim + "**\n" + unbannedPlayer.userID)
                            .setColor("#9370DB")
                            .setFooter(`${teamMember.username}#${teamMember.discriminator} | Unbanning Player`, teamMember.avatarURL, teamMember.avatarURL)
                        message.channel.createMessage({ embed: unbanned })
                        unbannedPlayer.save()
                    } else {
                        const notBanned = new Eris.RichEmbed()
                        .setTitle("")
                        .setDescription("The chosen player is not currently **banned**. Banning will officially initiate the ban and possible appeal processes. Otherwise, they will remain unbanned.\n\n**"
                            + unbannedPlayer.name + "#" + unbannedPlayer.discrim + "**\n" + unbannedPlayer.userID)
                        .setColor("#9370DB")
                        .setFooter(`${teamMember.username}#${teamMember.discriminator} | Unbanning Player`, teamMember.avatarURL, teamMember.avatarURL)
                    message.channel.createMessage({ embed: notBanned })
                    }
                }
            }
        }
    }
}