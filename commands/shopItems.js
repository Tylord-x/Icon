/*---------------------------------------LOADING IN THE PACKAGES---------------------------------------*/

// MODELS: Gets the necessary data models from the database to complete the shop process
const shop = require('../models/shopItems.js');

// REACTION HANDLER: Allows the player to interact with the embeds
const ReactionHandler = require('eris-reactions');

// FUNCTIONS: Uses a helper function with repetitive actions
const { shopItems } = require('../functions/shop/items.js');

require("pluris");
/*---------------------------------SHOP COMMANDS: BEGINNING THE SHOP COMMANDS----------------------*/

module.exports = {
    name: 'shopItems',
    description: "Players are able to shop for cosmetic items",
    aliases: ["si"],
    async execute(client, message, args, Eris) {

        const items = await shopItems()
        const member = message.member.user;

        if (member.id == "729810040395137125" || member.id == "665806267020738562") {
            if (items != null && items != undefined) {

                var createdItem = 0
                var changedItem = 0
                for (i = 0; i < items.length; i++) {
                    var item = await shop.findOne({ itemName: items[i].name })
                    if (item == null || item == undefined) {
                        const newData = new shop({
                            itemName: items[i].name,
                            itemPrice: items[i].price,
                            currency: items[i].currency
                        })
                        newData.save().catch(err => console.log(err));
                        createdItem = createdItem + 1
                    }
                    if (item != null && item != undefined) {
                        if ((items[i].price != item.itemPrice) || (items[i].currency != item.currency)) {
                            if (items[i].price != item.itemPrice) {
                                item.itemPrice = items[i].price
                                changedItem = changedItem + 1
                            }
                            if (items[i].currency != item.currency) {
                                item.currency = items[i].currency
                                changedItem = changedItem + 1
                            }
                            item.save()
                        }
                    }
                }

                console.log(createdItem)

                if (createdItem > 0 || changedItem > 0) {
                    var created = ""
                    var changed = ""
                    if (createdItem == 1) {
                        created = "item"
                    } else {
                        created = "items"
                    }

                    if (changedItem == 1) {
                        changed = "item"
                    } else {
                        changed = "items"
                    }
                    if (createdItem > 0 && changedItem == 0) {
                        const itemsAdded = new Eris.RichEmbed()
                            .setTitle("")
                            .setDescription(`Created **${createdItem}** ${created} for the shop`)
                            .setColor("#9370DB")
                            .setFooter(`${member.username}#${member.discriminator} | Shop Items Added`, member.avatarURL, member.avatarURL)
                        message.channel.createMessage({ embed: itemsAdded })
                    } else if (createdItem == 0 && changedItem > 0) {
                        const itemsChanged = new Eris.RichEmbed()
                            .setTitle("")
                            .setDescription(`Changed the details of **${changedItem}** ${changed}`)
                            .setColor("#9370DB")
                            .setFooter(`${member.username}#${member.discriminator} | Shop Items Changed`, member.avatarURL, member.avatarURL)
                        message.channel.createMessage({ embed: itemsChanged })

                    } else if (createdItem > 0 && changedItem > 0) {
                        const itemsAdded = new Eris.RichEmbed()
                            .setTitle("")
                            .setDescription(`Created **${createdItem}** shop ${created} and changed **${changedItem}** shop ${changed}`)
                            .setColor("#9370DB")
                            .setFooter(`${member.username}#${member.discriminator} | Shop Items Added`, member.avatarURL, member.avatarURL)
                        message.channel.createMessage({ embed: itemsAdded })
                    }
                } else {

                    const noItems = new Eris.RichEmbed()
                        .setTitle("")
                        .setDescription(`No shop items were added or changed`)
                        .setColor("#9370DB")
                        .setFooter(`${member.username}#${member.discriminator} | No Shop Items Added`, member.avatarURL, member.avatarURL)
                    message.channel.createMessage({ embed: noItems })
                }
            }

        }
    }

}