/*---------------------------------------LOADING IN THE PACKAGES-----------------------------------*/

// MODELS: Gets the necessary data model from the database to complete the privating process
const user = require('../models/user.js');
const claimedCards = require('../models/claimedCards.js');

/*-----------------------------------BLACKLIST COMMAND: BEGINNING BLACKLIST PROCESS--------------------------*/
module.exports = {
    name: 'blacklist',
    description: "Blacklists players from playing Icon and transfers their cards to hicon",
    aliases: [],
    async execute(client, message, args, Eris) {
        const teamMember = message.member.user; // Stores the information of the messaging team member

        // BANNER: Only the developers are able to ban players
        if (teamMember.id == "729810040395137125" || teamMember.id == "665806267020738562") {

            if (args != null && args != undefined) {
                if (args.length >= 1) {
                    const blacklistedPlayer = await user.findOne({ userID: args[0] })
                    if (!blacklistedPlayer.blacklisted) {
                        blacklistedPlayer.blacklisted = true

                        const hicon = await user.findOne({ userID: "881301440071618600" })
                        for (i = 0; i < blacklistedPlayer.inventory.length; i++) {
                            var card = await claimedCards.findOne({ code: blacklistedPlayer.inventory[i] })
                            card.owner.push("881301440071618600")
                            card.stickers = []
                            card.cosmetics = [{ name: "Barcode", image: './img/cosmetics/misc/Barcode.png', x: 477, y: 20, w: 90, h: 40 }]
                            card.frame = { name: "Default", image: './img/cosmetics/frames/default_frame.png', x: 0, y: 0, w: 600, h: 900 }
                            card.labels = []
                            card.save()
                            hicon.inventory.push(blacklistedPlayer.inventory[i])
                        }

                        blacklistedPlayer.inventory = []

                        hicon.save()
                        blacklistedPlayer.save()

                        const blacklisted = new Eris.RichEmbed()
                            .setTitle("")
                            .setDescription("The chosen player has been officially **blacklisted** from Icon. Their cards have been transferred to hicon#3407.\n\n**"
                                + blacklistedPlayer.name + "#" + blacklistedPlayer.discrim + "**\n" + blacklistedPlayer.userID)
                            .setColor("#9370DB")
                            .setFooter(`${teamMember.username}#${teamMember.discriminator} | Blacklisted Player`, teamMember.avatarURL, teamMember.avatarURL)
                        message.channel.createMessage({ embed: blacklisted })
                    } else {
                        const alreadyBanned = new Eris.RichEmbed()
                            .setTitle("")
                            .setDescription("The chosen player is currently **blacklisted.** Reinstating the player with unblacklist will allow them to gain back access gameplay and commands. Otherwise, they will remain blacklisted.\n\n**"
                                + bannedPlayer.name + "#" + bannedPlayer.discrim + "**\n" + bannedPlayer.userID)
                            .setColor("#9370DB")
                            .setFooter(`${teamMember.username}#${teamMember.discriminator} | Unblacklisting Player`, teamMember.avatarURL, teamMember.avatarURL)
                        message.channel.createMessage({ embed: alreadyBanned })
                    }
                }
            }
        }
    }
}