const magazine = require('../models/magazine.js');


module.exports = {
    name: 'magazineDesc',
    description: "Creates a magazine description",
    aliases: ["md", "magdesc", "magazinedesc", "mdesc"],
    async execute(client, message, args, Eris) {

        const creator = message.member.user;
        magazine.findOne({
            creator: creator.id
        }, (err, mag) => {

            var magDesc = "";

            for (i = 0; i < args.length; i++) {
                magDesc += "" + args[i]
                if (i < args.length - 1) {
                    magDesc += " "
                }
            }

            if (mag != undefined) {
                mag.description = "" + magDesc

                mag.save()

                const magazineView = new Eris.RichEmbed()
                    .setTitle("")
                    .setDescription('Successfully changed the description of the magazine')
                message.channel.createMessage({ embed: magazineView });
            } else {
                const magazineView = new Eris.RichEmbed()
                    .setTitle("")
                    .setDescription('You must purchase a magazine in the shop first.')
                message.channel.createMessage({ embed: magazineView });
            }


        })

    }
}