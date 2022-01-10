/*---------------------------------------LOADING IN THE PACKAGES-----------------------------------*/

// MODELS: Gets the necessary data model from the database to complete the privating process
const user = require('../models/user.js');

/*---------------------------------------PERFORMS THE PRIVATING PROCESS--------------------------*/
module.exports = {
    name: 'private',
    description: "Provides players the opportunity to private their inventories",
    aliases: ["priv"],
    async execute(client, message, args, Eris) {
        const messager = message.member.user // Gets the player who wants to be privated
        const privater = await user.findOne({ userID: messager.id })

        if (!privater.private) {
            if (!message.member.roles.includes("873295232668688406") && !message.member.roles.includes("873296833672273971") && !message.member.roles.includes("873304692002795530") && !message.member.roles.includes("873458618597539880")) {
                privater.private = true
                const private = new Eris.RichEmbed()
                    .setTitle("**Now Private**")
                    .setTitle("")
                    .setDescription("Your inventory and ownership of cards has now been made **private** to other players. To toggle back to **public**, perform the private command.")
                    .setColor("#9370DB")
                    .setFooter(`${messager.username}#${messager.discriminator} | Now Private`, messager.avatarURL, messager.avatarURL)
                message.channel.createMessage({ embed: private })
                privater.save()
            }

        } else {
            privater.private = false
            const public = new Eris.RichEmbed()
                .setTitle("")
                .setDescription("Your inventory and ownership of cards has now been made **public** to other players. To toggle back to **private**, perform the private command.")
                .setColor("#9370DB")
                .setFooter(`${messager.username}#${messager.discriminator} | Now Public`, messager.avatarURL, messager.avatarURL)
            message.channel.createMessage({ embed: public })
            privater.save()
        }

    }
}