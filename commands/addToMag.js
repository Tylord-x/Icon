const magazine = require('../models/magazine.js');
const claimedCards = require('../models/claimedCards.js');
const user = require('../models/user.js');
const magazineTracker = require('../gameplay/magazines/magTracker.js');


module.exports = {
    name: 'addToMag',
    description: "Creates a magazine",
    aliases: ["cm", "addtomag", "addtomagazine", "addcard"],
    async execute(client, message, args, Eris) {

        const owner = message.member.user;
        const slot = args[0]
        const card = args[1]

        const chosenCard = []

        user.findOne({
            userID: owner.id
        }, (err, userData) => {

        }).then(user => {

            for (i = 0; i < user.inventory.length; i++) {
                if (card == user.inventory[i]) {
                    chosenCard.push(user.inventory[i])
                }
            }

            claimedCards.findOne({
                code: { $in: chosenCard }
            }, (err, card) => {

            }).then(card => {



                magazine.findOne({
                    creator: owner.id
                }, (err, mag) => {




                    if (mag != undefined) {

                        if (args.length >= 2) {

                            if (card !== undefined) {

                                if (mag.cards[(slot - 1)] !== "Empty" && mag.cards[(slot - 1)] != undefined) {
                                    console.log("1")
                                    const embed = new Eris.RichEmbed()
                                    embed.setDescription(`There is already a card in slot ` + slot + ` in **` + mag.name + `** Magazine.`)
                                    message.channel.createMessage({ embed: embed })
                                } else {

                                    for (i = 0; i < 12; i++) {
                                        if (mag.cards[i] != "Empty" && mag.cards[i] == undefined) {
                                            mag.cards[i] = "Empty"
                                        } else if (mag.cards[i] != "Empty" && mag.cards[i] != undefined) {
                                            break;
                                        }
                                    }
                                    mag.cards.splice(slot - 1, 1, card.code)
                                    mag.save()

                                    const embed = new Eris.RichEmbed()
                                    embed.setDescription(`Added card to slot ` + slot + ` in **` + mag.name + `** Magazine.`)
                                    message.channel.createMessage({ embed: embed })



                                }

                            } else {
                                const magazineView = new Eris.RichEmbed()
                                    .setTitle("")
                                    .setDescription('You must enter a correct card.')
                                message.channel.createMessage({ embed: magazineView });
                            }


                        } else {
                            const magazineView = new Eris.RichEmbed()
                                .setTitle("")
                                .setDescription('You must define a slot and card')
                            message.channel.createMessage({ embed: magazineView });
                        }

                    } else {
                        const magazineView = new Eris.RichEmbed()
                            .setTitle("")
                            .setDescription('You must purchase a magazine first in the shop.')
                        message.channel.createMessage({ embed: magazineView });
                    }

                })




            })

        })
    }
}