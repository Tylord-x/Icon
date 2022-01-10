/*---------------------------------------LOADING IN THE PACKAGES---------------------------------------*/
// MODELS: Gets the necessary data models from the database to complete the balance process
const user = require('../models/user.js');

/*--------------------------------CREATE BALANCE COMMAND: BEGINNING BALANCE PROCESS----------------------------------------------*/
module.exports = {
    name: 'balance',
    description: "Allows players to check their balance",
    aliases: ["bal", "money"],
    async execute(client, message, args, Eris) {
        const member = message.member.user;
        const player = await user.findOne({ userID: member.id })

        if (player != null && player != undefined) {

            const money = new Eris.RichEmbed()
                .setTitle('')
                .setColor("#33A7FF")
                .setDescription(`**` + member.username.toUpperCase() + `'S BALANCE**\n\n**` + player.diamonds + `** <:diamond:898641993511628800> | **` + player.opals + `** <:opal:899430579831988275>`)
                .setFooter(`${member.username}#${member.discriminator} | Showing Balance`, member.avatarURL, member.avatarURL)
            message.channel.createMessage({ embed: money });

        } else if (player == null || player == undefined) {
            const money = new Eris.RichEmbed()
                .setTitle('')
                .setColor("#33A7FF")
                .setDescription(`**` + member.username.toUpperCase() + `'S BALANCE**\n\n**0** <:diamond:898641993511628800> | **0** <:opal:899430579831988275>`)
                .setFooter(`${member.username}#${member.discriminator} | Showing Balance`, member.avatarURL, member.avatarURL)
            message.channel.createMessage({ embed: money });
        }
    }
}

