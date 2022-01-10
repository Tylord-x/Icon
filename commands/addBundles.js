/*---------------------------------------LOADING IN THE PACKAGES---------------------------------------*/

// MODELS: Gets the necessary data models from the database to complete the shop process
const hues = require('../models/hueBundle.js');

// FUNCTIONS: Uses a helper function with repetitive actions
const { hueBundles } = require('../functions/shop/hueBundles');

const colorNames = require('color-name-list')
const nearestColor = require('nearest-color')

require("pluris");
/*---------------------------------SHOP COMMANDS: BEGINNING THE SHOP COMMANDS----------------------*/

module.exports = {
    name: 'addBundles',
    description: "Adding Themed Hue Bundles",
    aliases: ["addbundles", "hb", "huebundles", "bundles"],
    async execute(client, message, args, Eris) {

        const bundles = await hueBundles()
        const member = message.member.user;

        if (member.id == "729810040395137125" || member.id == "665806267020738562") {
            if (bundles != null && bundles != undefined) {

                console.log(bundles)

                var createdItem = 0
                var changedItem = 0
                for (i = 0; i < bundles.length; i++) {
                    var bundle = await hues.findOne({ name: bundles[i].name })
                    if (bundle == null || bundle == undefined) {

                        const names = []
                        const hexCodes = []
                        const rgbs = []

                        for (j = 0; j < bundles[i].hues.length; j++) {

                            const color = colorNames.reduce((o, { name, hex }) => Object.assign(o, { [name]: hex }), {});
                            const nearest = nearestColor.from(color);
                            const selectedColor = nearest(bundles[i].hues[j]);
                            var rgb = Object.values(selectedColor.rgb)
                            rgb = rgb.toString().replace(/,[s]*/g, ", ")
                            names.push(selectedColor.name)
                            hexCodes.push(selectedColor.value)
                            rgbs.push(rgb)

                        }

                        const newData = new hues({
                            bundleName: bundles[i].name,
                            names: names,
                            hexCodes: hexCodes,
                            rgb: rgbs
                        })
                        newData.save().catch(err => console.log(err));
                        createdItem = createdItem + 1
                    }
                }


                if (createdItem > 0 || changedItem > 0) {
                    var created = ""
                    var changed = ""
                    if (createdItem == 1) {
                        created = "bundle"
                    } else {
                        created = "bundles"
                    }

                    if (changedItem == 1) {
                        changed = "bundle"
                    } else {
                        changed = "bundles"
                    }
                    if (createdItem > 0 && changedItem == 0) {
                        const itemsAdded = new Eris.RichEmbed()
                            .setTitle("")
                            .setDescription(`Created **${createdItem}** ${created} for the shop`)
                            .setColor("#9370DB")
                            .setFooter(`${member.username}#${member.discriminator} | Hue Bundles Added`, member.avatarURL, member.avatarURL)
                        message.channel.createMessage({ embed: itemsAdded })
                    } else if (createdItem == 0 && changedItem > 0) {
                        const itemsChanged = new Eris.RichEmbed()
                            .setTitle("")
                            .setDescription(`Changed the details of **${changedItem}** ${changed}`)
                            .setColor("#9370DB")
                            .setFooter(`${member.username}#${member.discriminator} | Hue Bundles Changed`, member.avatarURL, member.avatarURL)
                        message.channel.createMessage({ embed: itemsChanged })

                    } else if (createdItem > 0 && changedItem > 0) {
                        const itemsAdded = new Eris.RichEmbed()
                            .setTitle("")
                            .setDescription(`Created **${createdItem}** shop ${created} and changed **${changedItem}** shop ${changed}`)
                            .setColor("#9370DB")
                            .setFooter(`${member.username}#${member.discriminator} | Hue Bundles Added`, member.avatarURL, member.avatarURL)
                        message.channel.createMessage({ embed: itemsAdded })
                    }
                } else {

                    const noItems = new Eris.RichEmbed()
                        .setTitle("")
                        .setDescription(`No hue bundles were added or changed`)
                        .setColor("#9370DB")
                        .setFooter(`${member.username}#${member.discriminator} | No Hue Bundles Added`, member.avatarURL, member.avatarURL)
                    message.channel.createMessage({ embed: noItems })
                }

            }

        }
    }
}
