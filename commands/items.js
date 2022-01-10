const user = require('../models/user.js');

module.exports = {
    name: 'items',
    description: "An inventory for all the items that belong to a player, including cosmetics",
    aliases: [],
    async execute(client, message, args, Eris) {

        const member = message.member.user;
        const player = await user.findOne({ userID: member.id })

        console.log(player.banned)

        if (player != null && player != undefined) {

            /*------------------------------------------GETS ALL THE ITEMS OWNED BY A PLAYER-----------------------------*/

            // STICKERS: Pulls all of the stickers
            const stickers = []
            if (player.stickers.length != 0) {
                for (i = 0; i < player.stickers.length; i++) {
                    stickers.push("**" + player.stickers[i].name + " Sticker** (" + player.stickers[i].quantity + " )\n")
                }
            }
            const frames = []
            if (player.frames[0] != undefined) {
                for (i = 0; i < player.frames.length; i++) {
                    frames.push(player.frames[i].name + " (" + player.frames[i].quantity + ")\n")
                }
            }
            const cosmetics = []
            if (player.cosmetics[0] != undefined) {
                for (i = 0; i < player.frames.length; i++) {
                    cosmetics.push(player.cosmetics[i].name + "\n")
                }
            }

            /*---------------------------PLACES ALL ITEM LISTS INTO ONE FOR READABILITY-----------------------------*/
            const allItems = []
            if (stickers.length != 0) {
                for (i = 0; i < stickers.length; i++) {
                    allItems.push(stickers[i])
                }
            }

            if (frames.length != 0) {
                for (i = 0; i < frames.length; i++) {
                    allItems.push(frames[i])
                }
            }

            if (cosmetics.length != 0) {
                for (i = 0; i < cosmetics.length; i++) {
                    allItems.push(cosmetics[i])
                }
            }

            /*---------------------------ITEMS EMBED WITH LIST OF ALL THE ITEMS IN A PLAYER'S INVENTORY------------------------------------*/


            if (allItems.length != 0) {

                var pageCount = 0
                var page = 1
                const pages = []
                for (i = 0; i < allItems.length; i++) {
                    if (i % 10 == 0) {
                        pageCount += 1;
                        pages.push(pageCount)
                    }
                }

                if (allItems.length < 11) {
                    const items = new Eris.RichEmbed()
                        .setTitle("**" + member.username.toUpperCase() + "'S** ITEMS")
                        .setDescription("" + allItems.slice((page) * 10 - 10, (page) * 10).toString().replace(/,/g, ""))
                        .setColor("#33A7FF")
                        .setAuthor(`${member.username}#${member.discriminator}`, member.avatarURL, member.avatarURL)
                        .setFooter(`Page ${page} of ${pages.length}  |  ${allItems.length} Items`)
                    message.channel.createMessage({ embed: items })
                }

            } else {

            }
        }



    }
}