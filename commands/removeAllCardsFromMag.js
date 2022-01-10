const magazine = require('../models/magazine.js');
const claimedCards = require('../models/claimedCards.js');
const user = require('../models/user.js');

module.exports = {
    name: 'removeallfrommag',
    description: "Removes a card from the magazine",
    aliases: ["rac", "removeallfrommag", "removecards", "rmcards", "removeallcards", "rmallcards"],
    async execute(client, message, args, Eris) {

        const owner = message.member.user;

        magazine.findOne({
            creator: owner.id

        }, (err, mag) => {
            if (mag != undefined) {

                const indexTracker = []

                for (i = 0; i < mag.cards.length; i++) {
                    if (mag.cards[i] != "Empty") {
                        indexTracker.push(i)
                    }
                }

                for (i = 0; i < indexTracker.length; i++) {

                    mag.cards.splice(indexTracker[i], 1)
                    mag.cards.splice(indexTracker[i], 0, "Empty")

                }

                mag.save()

                const embed = new Eris.RichEmbed()
                embed.setDescription(`Successfully removed all cards from the magazine.`)
                message.channel.createMessage({ embed: embed })
            } else {
                
                const magazineView = new Eris.RichEmbed()
                    .setTitle("")
                    .setDescription('You must purchase a magazine from the shop first.')
                message.channel.createMessage({ embed: magazineView });
            }
        })
    }
}