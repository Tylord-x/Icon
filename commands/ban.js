/*---------------------------------------LOADING IN THE PACKAGES-----------------------------------*/

// MODELS: Gets the necessary data model from the database to complete the privating process
const user = require('../models/user.js');

/*-----------------------------------BAN COMMAND: BEGINNING BAN PROCESS--------------------------*/
module.exports = {
    name: 'ban',
    description: "Bans players from playing Icon until appeal process is carried out",
    aliases: [],
    async execute(client, message, args, Eris) {
        const teamMember = message.member.user; // Stores the information of the messaging team member

        // BANNER: Only the developers are able to ban players
        if (teamMember.id == "729810040395137125" || teamMember.id == "665806267020738562") {

            if (args != null && args != undefined) {
                if (args.length >= 1) {
                    const bannedPlayer = await user.findOne({ userID: args[0] })
                    if (!bannedPlayer.banned) {
                        bannedPlayer.banned = true
                        const banned = new Eris.RichEmbed()
                            .setTitle("")
                            .setDescription("The chosen player has been officially **banned** from Icon. They may go through an **appeal process** to potentially get off the banned list and continue playing.\n\n**"
                                + bannedPlayer.name + "#" + bannedPlayer.discrim + "**\n" + bannedPlayer.userID)
                            .setColor("#9370DB")
                            .setFooter(`${teamMember.username}#${teamMember.discriminator} | Banning Player`, teamMember.avatarURL, teamMember.avatarURL)
                        message.channel.createMessage({ embed: banned })
                        bannedPlayer.save()
                    } else { 
                        const alreadyBanned = new Eris.RichEmbed()
                        .setTitle("")
                        .setDescription("The chosen player is currently **banned.** Unbanning will officially reinstate player gameplay and commands. Otherwise, they will remain banned.\n\n**"
                            + bannedPlayer.name + "#" + bannedPlayer.discrim + "**\n" + bannedPlayer.userID)
                        .setColor("#9370DB")
                        .setFooter(`${teamMember.username}#${teamMember.discriminator} | Unbanning Player`, teamMember.avatarURL, teamMember.avatarURL)
                    message.channel.createMessage({ embed: alreadyBanned })
                    }
                }
            }
        }
    }
}