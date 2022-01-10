const magazine = require('../models/magazine.js');
const claimedCards = require('../models/claimedCards.js');
const user = require('../models/user.js');
const magazineTracker = require('../gameplay/magazines/magTracker.js');


module.exports = {
    name: 'magazineColor',
    description: "Changes color of the magazine",
    aliases: ["mc", "magcolor", "magazinecolor"],
    async execute(client, message, args, Eris) {

        const creator = message.member.user;
        magazine.findOne({
            creator: creator.id
        }, (err, mag) => {

            if (mag != undefined) {
                mag.color = "" + args[0]

                mag.save()

                const magazineView = new Eris.RichEmbed()
                    .setTitle("")
                    .setDescription('Successfully changed the color of the magazine')
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
