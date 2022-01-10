const magazine = require('../models/magazine.js');
const claimedCards = require('../models/claimedCards.js');
const user = require('../models/user.js');
const magazineTracker = require('../gameplay/magazines/magTracker.js');


module.exports = {
    name: 'magazineName',
    description: "Changes the name of the magazine",
    aliases: ["mn", "magname", "mname", "magazinename"],
    async execute(client, message, args, Eris) {

        const creator = message.member.user;
        magazine.findOne({
            creator: creator.id
        }, (err, mag) => {

            var magazineName = "";

            if (mag != undefined) {
                for (i = 0; i < args.length; i++) {
                    magazineName += "" + args[i]
                    if(i < args.length - 1) {
                        magazineName += " "
                    }
                }

                mag.name = magazineName;

                mag.save()

                const magazineView = new Eris.RichEmbed()
                    .setTitle("")
                    .setDescription('Successfully changed the name of the magazine')
                message.channel.createMessage({ embed: magazineView });
            } else {
                const magazineView = new Eris.RichEmbed()
                    .setTitle("")
                    .setDescription('You must purchase a magazine first in the shop.')
                message.channel.createMessage({ embed: magazineView });
            }

        })

    }
}
