const magazine = require('../models/magazine.js');
const claimedCards = require('../models/claimedCards.js');
const user = require('../models/user.js');

module.exports = {
    name: 'removecardfrommag',
    description: "Removes a card from the magazine",
    aliases: ["rmc", "removecardfrommag", "removecard", "rmcard"],
    async execute(client, message, args, Eris) {

        const owner = message.member.user;
        const card = args[0]

        const chosenCard = []


        magazine.findOne({
            creator: owner.id

        }, (err, mag) => {
            if (mag != undefined) {

                var index = mag.cards.indexOf(card)
                mag.cards.splice(index, 1)
                mag.cards.splice(index, 0, "Empty")
                mag.save()

                const embed = new Eris.RichEmbed()
                embed.setDescription(`Successfully removed card from slot ` + (index + 1))
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