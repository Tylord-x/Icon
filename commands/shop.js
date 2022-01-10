/*---------------------------------------LOADING IN THE PACKAGES---------------------------------------*/

// MODELS: Gets the necessary data models from the database to complete the shop process
const shop = require('../models/shopItems.js');
const user = require('../models/user.js');
const hueTracker = require('../gameplay/hues/hueTracker.js')
const hueInfo = require('../models/hueInfo.js')
const hues = require('../models/ownedHues.js')
const hueBundles = require('../models/hueBundle.js')
const magazines = require('../models/magazine.js')
const frame = require('../models/frames.js')

// EMBED REACTION AND PAGINATION HANDLER: Allows the player to interact with the embeds
const ReactionHandler = require('eris-reactions');
const EmbedPaginator = require('eris-pagination');


// MESSAGE LISTENER: Listens for all the messages that are typed by the shoppers
const { MessageCollector } = require('eris-message-collector');
const items = require('../models/shopItems.js');

//FUNCTIONS: Passes in helper functions
const { shopItems } = require('../functions/shop/items.js');

//COLORS FOR HUES: Gets the packages to randomize colors and receive hues
const colorNames = require('color-name-list')
const nearestColor = require('nearest-color')
const validateColor = require("validate-color").default;
const { validateHTMLColorHex } = require("validate-color");

const ColorThief = require("colorthief")

// CANVAS: Provides all the necessary components of Canvas and its related packages
const Canvas = require('canvas');

const fs = require('fs');
const Eris = require('eris');
const Constants = Eris.Constants;


/*---------------------------SHOP COMMANDS: BEGINNING THE SHOP COMMANDS----------------------*/

module.exports = {
    name: 'shop',
    description: "Players are able to shop for cosmetic items",
    aliases: ["s"],
    async execute(client, message, args, Eris, shopCooldown) {

        const member = message.member.user;
        const shopper = await user.findOne({ userID: member.id })

        const itemsList = []
        const foundItems = await items.find({})
        const shop = await shopItems()

        const bundleCheck = new Set()
        var bundleCollection;
        const frameCheck = new Set()
        var frameCollection;

        var customListener;
        var frameListener;

        var messageID = ""
        var messageOutput;
        const selectedItems = []

        var msg = await message.channel.createMessage({ 
            embed:  {
                title: '**ICON ON THE MARKET**',
                description: "**Welcome to the Official Icon Shop!** Check out all the newest and most popular items. \n\n**Navigation**\nView an item and its description by selecting it in the menu below. To exit the shop early, simply type 0.\n\n**Item of the Month**\nRandom Hue\n\n",
                color: 0x9370DB,
                footer: {
                "icon_url": "" + member.avatarURL,
                "text": `${member.username}#${member.discriminator} | Viewing Shop`
                }, image: {
                    url: "https://i.imgur.com/LqNYajn.png"
                }
        }
        })


                let filter = (m) => m.author.id === message.member.user.id
                const collector = new MessageCollector(client, message.channel, filter, { // Create our collector with our options set as the current channel, the client, filter and our time
                    time: 60000
                });

                collector.on('end', data => {
                                            msg.edit({"embed":  {
                                                title: '**ICON ON THE MARKET**',
                                                description: "**Welcome to the Official Icon Shop!** Check out all the newest and most popular items. \n\n**Item of the Month**\nRandom Hue\n\n",
                                                color: 0x9370DB,
                                                footer: {
                                                "icon_url": "" + member.avatarURL,
                                                "text": `${member.username}#${member.discriminator} | Shop Exited`
                                                }, image: {
                                                    url: "https://i.imgur.com/LqNYajn.png"
                                                }
                                                },
                                                "components": [
                                                {
                                                    "type": 1,
                                                    "components": [
                                                        {
                                                            "type": 3,
                                                            "custom_id": "class_select_1",
                                                            "options":[
                                                                {
                                                                    "label": "Magazine",
                                                                    "value": "Magazine",
                                                                    // "description": "Design your own exclusive magazine",
                                                                    "emoji": {
                                                                        "id": "898641993511628800"
                                                                    }
                                                                },
                                                                {
                                                                    "label": "Random Hue  |  20 Diamonds",
                                                                    "value": "Random Hue",
                                                                    "description": "Add to your hue collection with a new randomized hue",
                                                                    "emoji": {
                                                                        "id": "908970027103961129"
                                                                    }
                                                                },
                                                                {
                                                                    "label": "Custom Hue  |  30 Diamonds",
                                                                    "value": "Custom Hue",
                                                                    "description": "Curate your very own personalized hue",
                                                                    "emoji": {
                                                                        "id": "921507122934591499"
                                                                    }
                                                                },
                                                                {
                                                                    "label": "Random Hue Bundle",
                                                                    "value": "Random Hue Bundle",
                                                                    // "description": "Purchase a random hue bundle",
                                                                    "emoji": {
                                                                        "id": "908972644102201364"
                                                                    }
                                                                },
                                                                {
                                                                    "label": "Themed Hue Bundle",
                                                                    "value": "Themed Hue Bundle",
                                                                    // "description": "Purchase a themed hue bundle",
                                                                    "emoji": {
                                                                        "id": "899430579831988275"
                                                                    }
                                                                },
                                                                {
                                                                    "label": "Frame",
                                                                    "value": "Frame",
                                                                    // "description": "Purchase a frame",
                                                                    "emoji": {
                                                                        "id": "900131721855516743"
                                                                    }
                                                                },
                                                                {
                                                                    "label": "Sticker",
                                                                    "value": "Sticker",
                                                                    // "description": "Purchase a sticker",
                                                                    "emoji": {
                                                                        "id": "900875332159168562"
                                                                    }
                                                                }
                                                            ],
                                                            "placeholder": "Shop has been exited, goodbye!",
                                                            "disabled":true
                                                        }
                                                    ]
                                                }
                                            ]})
                })


                var selectedItem;
                var nameItem = ""
                msg.edit({"components": [
                    {
                        "type": 1,
                        "components": [
                            {
                                "type": 3,
                                "custom_id": "class_select_1",
                                "options":[
                                    {
                                        "label": "Magazine  |  2500 Opals",
                                        "value": "Magazine",
                                        "description": "Design your own exclusive magazine",
                                        "emoji": {
                                            "id": "898641993511628800"
                                        }
                                    },
                                    {
                                        "label": "Random Hue  |  20 Diamonds",
                                        "value": "Random Hue",
                                        "description": "Add to your hue collection with a new randomized hue",
                                        "emoji": {
                                            "id": "908970027103961129"
                                        }
                                    },
                                    {
                                        "label": "Custom Hue  |  30 Diamonds",
                                        "value": "Custom Hue",
                                        "description": "Curate your very own personalized hue",
                                        "emoji": {
                                            "id": "921507122934591499"
                                        }
                                    },
                                    {
                                        "label": "Random Hue Bundle  |  80 Diamonds",
                                        "value": "Random Hue Bundle",
                                        "description": "Gain a new set of five randomly-generated hues",
                                        "emoji": {
                                            "id": "908972644102201364"
                                        }
                                    },
                                    {
                                        "label": "Themed Hue Bundle  |  100 Diamonds",
                                        "value": "Themed Hue Bundle",
                                        "description": "Select a pre-made themed hue bundle",
                                        "emoji": {
                                            "id": "899430579831988275"
                                        }
                                    },
                                    {
                                        "label": "Frame  |  50 Diamonds",
                                        "value": "Frame",
                                        "description": "Decorative borders to customize your favorite cards",
                                        "emoji": {
                                            "id": "900131721855516743"
                                        }
                                    },
                                    {
                                        "label": "Sticker  |  20 Diamonds",
                                        "value": "Sticker",
                                        "description": "Customize your cards with decorative stickers",
                                        "emoji": {
                                            "id": "900875332159168562"
                                        }
                                    }
                                ],
                                "placeholder": "Please make your selection"
                            }
                        ]
                    }
                ]})



                collector.on("collect", async (message) => {
                    if (message.content == "0") {
                        const shoppingCanceled = new Eris.RichEmbed()
                            .setTitle("**Want to leave Icon on the Market?**")
                            .setDescription(`To exit the shop completely, press the starscape. Otherwise, to continue shopping, press the x.`)
                            .setColor("#9370DB")
                            .setFooter(`${member.username}#${member.discriminator} | At the Exit`, member.avatarURL, member.avatarURL)
                        messageOutput = await message.channel.createMessage({ embed: shoppingCanceled , components: [
                            {
                              type: Constants.ComponentTypes.ACTION_ROW, // You can have up to 5 action rows, and 1 select menu per action row
                              components: [
                                {
                                  type: Constants.ComponentTypes.BUTTON, // https://discord.com/developers/docs/interactions/message-components#buttons
                                  style: Constants.ButtonStyles.PRIMARY, // This is the style of the button https://discord.com/developers/docs/interactions/message-components#button-object-button-styles
                                  custom_id: "first_button11",
                                  emoji: {name: "🌌",id: null, animated: "false"},
                                  disabled: false, // Whether or not the button is disabled, is false by default,
                                },
                                {
                                  type: Constants.ComponentTypes.BUTTON, // https://discord.com/developers/docs/interactions/message-components#buttons
                                  style: Constants.ButtonStyles.PRIMARY, // This is the style of the button https://discord.com/developers/docs/interactions/message-components#button-object-button-styles
                                  custom_id: "second_button11",
                                  emoji: {name: "❌",id: null, animated: "false"},
                                  disabled: false, // Whether or not the button is disabled, is false by default.
                                }
                              ]
                            }]})
                        messageID = Object.values(messageOutput)[0]
                        message.channel.getMessage(messageID)
                            .then(message => {

                                client.on("interactionCreate", async (interaction) => {
                                    const shopperReaction = []
                                      if (interaction.data.custom_id == "first_button11" && interaction.message.id == message.id) {
                                        await interaction.deferUpdate()
                                        shopperReaction.push(interaction.member.id);
                                        if (shopperReaction.includes(shopper.userID)) {
                                            const leave = new Eris.RichEmbed()
                                                .setColor(0x9370DB)
                                                .setTitle(`**Shopping Session Ended**`)
                                                .setDescription(`Come again soon, ${member.username}#${member.discriminator}!`)
                                                .setFooter(`${member.username}#${member.discriminator} | Exited Shop`, member.avatarURL, member.avatarURL)
                                            message.edit({ embed: leave , components: []})

                                            collector.stop();
                                            msg.edit({"embed":  {
                                                title: '**ICON ON THE MARKET**',
                                                description: "**Welcome to the Official Icon Shop!** Check out all the newest and most popular items. \n\n**Item of the Month**\nRandom Hue\n\n",
                                                color: 0x9370DB,
                                                footer: {
                                                "icon_url": "" + member.avatarURL,
                                                "text": `${member.username}#${member.discriminator} | Shop Exited`
                                                }, image: {
                                                    url: "https://i.imgur.com/LqNYajn.png"
                                                }
                                                },
                                                "components": [
                                                {
                                                    "type": 1,
                                                    "components": [
                                                        {
                                                            "type": 3,
                                                            "custom_id": "class_select_1",
                                                            "options":[
                                                                {
                                                                    "label": "Magazine",
                                                                    "value": "Magazine",
                                                                    // "description": "Design your own exclusive magazine",
                                                                    "emoji": {
                                                                        "id": "898641993511628800"
                                                                    }
                                                                },
                                                                {
                                                                    "label": "Random Hue  |  20 Diamonds",
                                                                    "value": "Random Hue",
                                                                    "description": "Add to your hue collection with a new randomized hue",
                                                                    "emoji": {
                                                                        "id": "908970027103961129"
                                                                    }
                                                                },
                                                                {
                                                                    "label": "Custom Hue  |  30 Diamonds",
                                                                    "value": "Custom Hue",
                                                                    "description": "Curate your very own personalized hue",
                                                                    "emoji": {
                                                                        "id": "921507122934591499"
                                                                    }
                                                                },
                                                                {
                                                                    "label": "Random Hue Bundle",
                                                                    "value": "Random Hue Bundle",
                                                                    // "description": "Purchase a random hue bundle",
                                                                    "emoji": {
                                                                        "id": "908972644102201364"
                                                                    }
                                                                },
                                                                {
                                                                    "label": "Themed Hue Bundle",
                                                                    "value": "Themed Hue Bundle",
                                                                    // "description": "Purchase a themed hue bundle",
                                                                    "emoji": {
                                                                        "id": "899430579831988275"
                                                                    }
                                                                },
                                                                {
                                                                    "label": "Frame",
                                                                    "value": "Frame",
                                                                    // "description": "Purchase a frame",
                                                                    "emoji": {
                                                                        "id": "900131721855516743"
                                                                    }
                                                                },
                                                                {
                                                                    "label": "Sticker",
                                                                    "value": "Sticker",
                                                                    // "description": "Purchase a sticker",
                                                                    "emoji": {
                                                                        "id": "900875332159168562"
                                                                    }
                                                                }
                                                            ],
                                                            "placeholder": "Shop has been exited, goodbye!",
                                                            "disabled":true
                                                        }
                                                    ]
                                                }
                                            ]})

                                            if (customListener != undefined) {
                                                customListener.stop();
                                            }
                                            if (frameListener != undefined) {
                                                frameListener.stop();
                                                console.log("should end up in here")
                                            }

                                            shopCooldown.delete(shopper.userID)

                                        }

                                    }
                                    else if (interaction.data.custom_id == "second_button11" && interaction.message.id == message.id) {
                                        await interaction.deferUpdate()
                                        //stay embed
                                        const stay = new Eris.RichEmbed()
                                            .setColor(0x9370DB)
                                            .setTitle(`**Continue Shopping**`)
                                            .setDescription(`The shopping session has remained open`)
                                            .setFooter(`${member.username}#${member.discriminator} | Shopping in Progress`, member.avatarURL, member.avatarURL)
                                        message.edit({ embed: stay , components: []})

                                    }
                                })
                            })
                    }


                })
                client.on("interactionCreate", async (interaction) => {
                    if (interaction.data.custom_id == "class_select_1"  && interaction.message.id == msg.id && message.member.user.id == interaction.member.user.id) {
                      await interaction.deferUpdate()
                      var nameItem = interaction.data.values[0]
                      console.log(nameItem)
                                
                                var selectedItem = await items.findOne({ $and: [{ itemName: nameItem}] })

                                    var currencyEmoji = ""
                                    var nameCurrency = ""
                                    if (selectedItem.currency == "Diamonds") {
                                        nameCurrency = "diamonds"
                                        currencyEmoji = "<:diamond:898641993511628800>"
                                    } else if (selectedItem.currency == "Opals") {
                                        nameCurrency = "opals"
                                        currencyEmoji = "<:diamond:898641993511628800>"
                                    }

                            switch (nameItem) {
                                /*--------------------------------SHOP SECTION: HUES-------------------------------------------*/

                                //RANDOM HUE: Creates a randomized hue that is able to be purchased
                                case "Random Hue": {
                                    console.log("im in here")
                                    nameItem = ""

                                    const randomHue = new Eris.RichEmbed()
                                        .setTitle("**Random Hue**")
                                        .setDescription(`Add to your hue collection with a new random hue crafted from an extensive list of colors and color names.\n\n**Cost of Item**\n` + selectedItem.itemPrice + " " + currencyEmoji + "\n\n**Purchasing Guide**\nAdd the random hue to your cart and complete your purchase by pressing the credit card. To cancel buying a random hue, press the x.")
                                        .setColor("#9370DB")
                                        .setImage("https://i.imgur.com/pJ60h2d.png")
                                        .setFooter(`${member.username}#${member.discriminator} | Add Random Hue to Cart`, member.avatarURL, member.avatarURL)
                                    messageOutput = await message.channel.createMessage({ embed: randomHue ,
                                        components: [
                                        {
                                          type: Constants.ComponentTypes.ACTION_ROW, // You can have up to 5 action rows, and 1 select menu per action row
                                          components: [
                                            {
                                              type: Constants.ComponentTypes.BUTTON, // https://discord.com/developers/docs/interactions/message-components#buttons
                                              style: Constants.ButtonStyles.PRIMARY, // This is the style of the button https://discord.com/developers/docs/interactions/message-components#button-object-button-styles
                                              custom_id: "first_button1",
                                              emoji: {name: "💳",id: null, animated: "false"},
                                              disabled: false, // Whether or not the button is disabled, is false by default,
                                            },
                                            {
                                              type: Constants.ComponentTypes.BUTTON, // https://discord.com/developers/docs/interactions/message-components#buttons
                                              style: Constants.ButtonStyles.PRIMARY, // This is the style of the button https://discord.com/developers/docs/interactions/message-components#button-object-button-styles
                                              custom_id: "second_button1",
                                              emoji: {name: "❌",id: null, animated: "false"},
                                              disabled: false, // Whether or not the button is disabled, is false by default.
                                            }
                                          ]
                                        }] })
                                    messageID = Object.values(messageOutput)[0]

                                    message.channel.getMessage(messageID)
                                        .then(message => {
                                            client.on("interactionCreate", async (interaction) => {
                                                const shopperReaction = []
                                                  if (interaction.data.custom_id == "second_button1" && interaction.message.id == message.id) {
                                                    await interaction.deferUpdate()
                                                    shopperReaction.push(interaction.member.id);
                                                    if (shopperReaction.includes(shopper.userID)) {
                                                        const canceled = new Eris.RichEmbed()
                                                            .setTitle("Currently in Shop")
                                                            .setDescription(`Continue shopping by selecting another item to view and potentially purchase. To exit the shop early, type 0.`)
                                                            .setColor("#9370DB")
                                                            .setFooter(`${member.username}#${member.discriminator} | In Shop`, member.avatarURL, member.avatarURL)
                                                        message.edit({ embed: canceled , components: []})
                                                    }
                                                }
                                                if (interaction.data.custom_id == "first_button1" && interaction.message.id == message.id) {
                                                    shopperReaction.push(interaction.member.id);
                                                    if (shopperReaction.includes(shopper.userID)) {
                                                        if (shopper[nameCurrency] >= selectedItem.itemPrice) {
                                                            var randomColor = Math.floor(Math.random() * 16777215).toString(16);
                                                            while (randomColor.length < 6) {
                                                                randomColor = Math.floor(Math.random() * 16777215).toString(16);
                                                            }
                                                            message.edit({components: []})

                                                            const color = colorNames.reduce((o, { name, hex }) => Object.assign(o, { [name]: hex }), {});
                                                            const nearest = nearestColor.from(color);
                                                            const selectedColor = nearest('#' + randomColor);
                                                            var rgb = Object.values(selectedColor.rgb)
                                                            rgb = rgb.toString().replace(/,[s]*/g, ", ")

                                                            const canvas = Canvas.createCanvas(150, 150);
                                                            const context = canvas.getContext('2d');
                                                            const background = await Canvas.loadImage('transparent.png');
                                                            context.drawImage(background, 0, 0, canvas.width, canvas.height);

                                                            context.fillStyle = "#" + randomColor
                                                            context.fillRect(0, 0, canvas.width, canvas.height);

                                                            const hueBuffer = canvas.toBuffer();
                                                            const hueAttachment = { file: hueBuffer, name: "hue.png" };

                                                            hueTracker.execute(message, client)
                                                            const hueInformation = await hueInfo.findOne({ $and: [{ name: selectedColor.name }, { hexCode: selectedColor.value }, { rgb: rgb }] })
                                                            const boughtHue = await hues.findOne({ $and: [{ owner: shopper.userID }, { name: selectedColor.name }, { hexCode: selectedColor.value }, { rgb: rgb }] })


                                                            if (hueInformation == null || hueInformation == undefined) {
                                                                const newData = new hueInfo({
                                                                    name: selectedColor.name,
                                                                    hexCode: selectedColor.value,
                                                                    rgb: rgb
                                                                })
                                                                newData.save().catch(err => console.log(err));
                                                            }

                                                            if (boughtHue == null || boughtHue == undefined) {
                                                                const newData = new hues({
                                                                    name: selectedColor.name,
                                                                    hexCode: selectedColor.value,
                                                                    rgb: rgb,
                                                                    owner: [shopper.userID],
                                                                    quantity: 1
                                                                })
                                                                newData.save().catch(err => console.log(err));
                                                            } else {
                                                                boughtHue.quantity = boughtHue.quantity + 1
                                                                boughtHue.save()
                                                            }

                                                            shopper[nameCurrency] = shopper[nameCurrency] - selectedItem.itemPrice
                                                            shopper.save()

                                                            const purchasedHue = new Eris.RichEmbed()
                                                                .setTitle("**" + selectedColor.name.toUpperCase() + "**")
                                                                .setDescription(`**Color Name**\n` + selectedColor.name + "\n**Hex Code**\n" + selectedColor.value + "\n**RGB Value**\n" + rgb)
                                                                .setColor("#" + randomColor)
                                                                .setImage("attachment://hue.png")
                                                                .setFooter(`${member.username}#${member.discriminator} | Purchased ` + selectedColor.name, member.avatarURL, member.avatarURL)
                                                            message.channel.createMessage({ embed: purchasedHue }, hueAttachment)
                                                        } else {
                                                            const canceled = new Eris.RichEmbed()
                                                                .setTitle("")
                                                                .setDescription(`<:exclaim:906289233814241290> Transaction unsuccessful due to insufficient ` + nameCurrency)
                                                                .setColor("#9370DB")
                                                                .setFooter(`${member.username}#${member.discriminator} | Purchasing Item Failed`, member.avatarURL, member.avatarURL)
                                                            message.edit({ embed: canceled , components: []})
                                                        }
                                                    }
                                                }
                                            })
                                        })
                                    break;
                                } case
                                    "Custom Hue": {
                                        nameItem = ""
                                        const customHue = new Eris.RichEmbed()
                                            .setTitle("**CUSTOM HUE**")
                                            .setDescription(`Curate your very own personalized hue collection with custom-picked hues.\n\n**Cost of Item**\n` + selectedItem.itemPrice + " " + currencyEmoji + "\n\n**Purchasing Guide**\nProvide a valid hex code starting with a # (hashtag) followed by six letters and/or numbers. A prompt to buy the hue will appear after. To cancel buying a custom hue, press the x.\n**Ex. #000000**")
                                            .setColor("#9370DB")
                                            .setImage("https://i.imgur.com/406xi4h.png")
                                            .setFooter(`${member.username}#${member.discriminator} | Purchasing Custom Hue`, member.avatarURL, member.avatarURL)
                                        messageOutput = await message.channel.createMessage({ embed: customHue ,
                                            components: [
                                                {
                                                  type: Constants.ComponentTypes.ACTION_ROW, // You can have up to 5 action rows, and 1 select menu per action row
                                                  components: [
                                                   {
                                                      type: Constants.ComponentTypes.BUTTON, // https://discord.com/developers/docs/interactions/message-components#buttons
                                                      style: Constants.ButtonStyles.PRIMARY, // This is the style of the button https://discord.com/developers/docs/interactions/message-components#button-object-button-styles
                                                      custom_id: "first_button2",
                                                      emoji: {name: "❌",id: null, animated: "false"},
                                                      disabled: false, // Whether or not the button is disabled, is false by default.
                                                    }
                                                  ]
                                                }]
                                         })
                                        messageID = Object.values(messageOutput)[0]

                                        message.channel.getMessage(messageID)
                                            .then(message => {

                                                let customHueFilter = (message) => message.author.id == message.member.id
                                                const customCollector = new MessageCollector(client, message.channel, customHueFilter, { // Create our collector with our options set as the current channel, the client, filter and our time
                                                    time: 60000
                                                });

                                                customListener = customCollector.on("collect", async (message) => {
                                                    if (message.author.id == member.id) {
                                                        if (message.content.length >= 1) {
                                                            if (message.content.startsWith('#') && message.content.length == 7 && typeof (message.content) != "number") {
                                                                const validatedColor = await validateHTMLColorHex(message.content)
                                                                if (validatedColor) {
                                                                    const color = colorNames.reduce((o, { name, hex }) => Object.assign(o, { [name]: hex }), {});
                                                                    const nearest = nearestColor.from(color);
                                                                    const selectedColor = nearest(message.content);
                                                                    var rgb = Object.values(selectedColor.rgb)
                                                                    rgb = rgb.toString().replace(/,[s]*/g, ", ")

                                                                    const canvas = Canvas.createCanvas(150, 150);
                                                                    const context = canvas.getContext('2d');
                                                                    const background = await Canvas.loadImage('transparent.png');
                                                                    context.drawImage(background, 0, 0, canvas.width, canvas.height);

                                                                    context.fillStyle = message.content
                                                                    context.fillRect(0, 0, canvas.width, canvas.height);

                                                                    const hueBuffer = canvas.toBuffer();
                                                                    const hueAttachment = { file: hueBuffer, name: "hue.png" };

                                                                    const foundHue = new Eris.RichEmbed()
                                                                        .setTitle("**" + selectedColor.name.toUpperCase() + "**")
                                                                        .setDescription(`**Color Name**\n` + selectedColor.name + "\n**Hex Code**\n" + selectedColor.value + "\n**RGB Value**\n" + rgb)
                                                                        .setColor(message.content)
                                                                        .setImage("attachment://hue.png")
                                                                        .setFooter(`${member.username}#${member.discriminator} | Created ` + selectedColor.name, member.avatarURL, member.avatarURL)
                                                                    messageOutput = await message.channel.createMessage({ embed: foundHue , components: [
                                                                        {
                                                                          type: Constants.ComponentTypes.ACTION_ROW, // You can have up to 5 action rows, and 1 select menu per action row
                                                                          components: [
                                                                            {
                                                                              type: Constants.ComponentTypes.BUTTON, // https://discord.com/developers/docs/interactions/message-components#buttons
                                                                              style: Constants.ButtonStyles.PRIMARY, // This is the style of the button https://discord.com/developers/docs/interactions/message-components#button-object-button-styles
                                                                              custom_id: "first_button3",
                                                                              emoji: {name: "💳",id: null, animated: "false"},
                                                                              disabled: false, // Whether or not the button is disabled, is false by default,
                                                                            },
                                                                            {
                                                                              type: Constants.ComponentTypes.BUTTON, // https://discord.com/developers/docs/interactions/message-components#buttons
                                                                              style: Constants.ButtonStyles.PRIMARY, // This is the style of the button https://discord.com/developers/docs/interactions/message-components#button-object-button-styles
                                                                              custom_id: "second_button3",
                                                                              emoji: {name: "❌",id: null, animated: "false"},
                                                                              disabled: false, // Whether or not the button is disabled, is false by default.
                                                                            }
                                                                          ]
                                                                        }]}, hueAttachment)
                                                                    messageID = Object.values(messageOutput)[0]
                                                                    message.channel.getMessage(messageID)
                                                                        .then(message => {
                                                                            client.on("interactionCreate", async (interaction) => {
                                                                                const shopperReaction = []
                                                                                  if (interaction.data.custom_id == "second_button3" && interaction.message.id == message.id) {
                                                                                    await interaction.deferUpdate()
                                                                                    shopperReaction.push(interaction.member.id);
                                                                                    if (shopperReaction.includes(shopper.userID)) {
                                                                                        customCollector.stop()
                                                                                        const canceled = new Eris.RichEmbed()
                                                                                            .setTitle("Currently in Shop")
                                                                                            .setDescription(`Continue shopping by selecting another item to view and potentially purchase. To exit the shop early, type 0 and follow the prompt.`)
                                                                                            .setColor("#9370DB")
                                                                                            .setFooter(`${member.username}#${member.discriminator} | In Shop`, member.avatarURL, member.avatarURL)
                                                                                        message.edit({ embed: canceled,components: [], attachments: [] })
                                                                                    }
                                                                                }

                                                                                if (interaction.data.custom_id == "first_button3" && interaction.message.id == message.id) {
                                                                                    await interaction.deferUpdate()
                                                                                    shopperReaction.push(interaction.member.id);
                                                                                    if (shopperReaction.includes(shopper.userID)) {
                                                                                        customCollector.stop()

                                                                                        if (shopper[nameCurrency] >= selectedItem.itemPrice) {
                                                                                            hueTracker.execute(message, client)
                                                                                            const hueInformation = await hueInfo.findOne({ $and: [{ name: selectedColor.name }, { hexCode: selectedColor.value }, { rgb: rgb }] })
                                                                                            const boughtHue = await hues.findOne({ $and: [{ owner: shopper.userID }, { name: selectedColor.name }, { hexCode: selectedColor.value }, { rgb: rgb }] })


                                                                                            if (hueInformation == null || hueInformation == undefined) {
                                                                                                const newData = new hueInfo({
                                                                                                    name: selectedColor.name,
                                                                                                    hexCode: selectedColor.value,
                                                                                                    rgb: rgb
                                                                                                })
                                                                                                newData.save().catch(err => console.log(err));
                                                                                            }

                                                                                            if (boughtHue == null || boughtHue == undefined) {
                                                                                                const newData = new hues({
                                                                                                    name: selectedColor.name,
                                                                                                    hexCode: selectedColor.value,
                                                                                                    rgb: rgb,
                                                                                                    owner: [shopper.userID],
                                                                                                    quantity: 1
                                                                                                })
                                                                                                newData.save().catch(err => console.log(err));
                                                                                            } else {
                                                                                                boughtHue.quantity = boughtHue.quantity + 1
                                                                                                boughtHue.save()
                                                                                            }

                                                                                            shopper[nameCurrency] = shopper[nameCurrency] - selectedItem.itemPrice
                                                                                            shopper.save()

                                                                                            foundHue.setFooter(`${member.username}#${member.discriminator} | Purchased ` + selectedColor.name, member.avatarURL, member.avatarURL)
                                                                                            message.edit({ embed: foundHue ,components: []}, hueAttachment)
                                                                                        } else {
                                                                                            foundHue.setTitle("**" + selectedColor.name.toUpperCase() + "**")
                                                                                            foundHue.setDescription(`<:exclaim:906289233814241290> Transaction unsuccessful due to insufficient ` + nameCurrency + `\n\n**Color Name**\n` + selectedColor.name + "\n**Hex Code**\n" + selectedColor.value + "\n**RGB Value**\n" + rgb)
                                                                                            foundHue.setColor(selectedColor.value)
                                                                                            foundHue.setImage("attachment://hue.png")
                                                                                            foundHue.setFooter(`${member.username}#${member.discriminator} | Purchasing Item Failed`, member.avatarURL, member.avatarURL)
                                                                                            message.edit({ embed: foundHue , components: []}, hueAttachment)
                                                                                        }
                                                                                    }
                                                                                }
                                                                            })
                                                                        })
                                                                } else {
                                                                    const invalidColor = new Eris.RichEmbed()
                                                                        .setTitle("")
                                                                        .setDescription(`<:exclaim:906289233814241290> The color given is invalid. Make sure the hex code matches to an actual color.`)
                                                                        .setColor("#9370DB")
                                                                        .setFooter(`${member.username}#${member.discriminator} | Purchasing Item Failed`, member.avatarURL, member.avatarURL)
                                                                    message.channel.createMessage({ embed: invalidColor })
                                                                }
                                                            }

                                                        }

                                                    }
                                                })
                                                client.on("interactionCreate", async (interaction) => {
                                                    const shopperReaction = []
                                                      if (interaction.data.custom_id == "first_button2" && interaction.message.id == message.id) {
                                                        await interaction.deferUpdate()
                                                        shopperReaction.push(interaction.member.id);
                                                        if (shopperReaction.includes(shopper.userID)) {
                                                            customCollector.stop()
                                                            const canceled = new Eris.RichEmbed()
                                                                .setTitle("Currently in Shop")
                                                                .setDescription(`Continue shopping by selecting another item to view and potentially purchase. To exit the shop early, type 0 and follow the prompt.`)
                                                                .setColor("#9370DB")
                                                                .setFooter(`${member.username}#${member.discriminator} | In Shop`, member.avatarURL, member.avatarURL)
                                                            message.edit({ embed: canceled , components:[], attachments: []})
                                                        }
                                                    }
                                                })

                                            })
                                        break;
                                    } case
                                    "Random Hue Bundle": {
                                        nameItem = ""
                                        const randomBundle = new Eris.RichEmbed()
                                            .setTitle("**RANDOM HUE BUNDLE**")
                                            .setDescription(`Gain a new set of five randomized hues to quickly build up your hue collection.\n\n**Cost of Item**\n` + selectedItem.itemPrice + " " + currencyEmoji + "\n\n**Purchasing Guide**\nAdd the random hue bundle to your cart and complete your purchase by pressing the credit card. To cancel buying a random hue bundle, press the x.")
                                            .setColor("#9370DB")
                                            .setImage("https://i.imgur.com/muN4zBd.png")
                                            .setFooter(`${member.username}#${member.discriminator} | Add Random Hue Bundle to Cart`, member.avatarURL, member.avatarURL)
                                        messageOutput = await message.channel.createMessage({ embed: randomBundle , components: [
                                            {
                                              type: Constants.ComponentTypes.ACTION_ROW, // You can have up to 5 action rows, and 1 select menu per action row
                                              components: [
                                                {
                                                  type: Constants.ComponentTypes.BUTTON, // https://discord.com/developers/docs/interactions/message-components#buttons
                                                  style: Constants.ButtonStyles.PRIMARY, // This is the style of the button https://discord.com/developers/docs/interactions/message-components#button-object-button-styles
                                                  custom_id: "first_button4",
                                                  emoji: {name: "💳",id: null, animated: "false"},
                                                  disabled: false, // Whether or not the button is disabled, is false by default,
                                                },
                                                {
                                                  type: Constants.ComponentTypes.BUTTON, // https://discord.com/developers/docs/interactions/message-components#buttons
                                                  style: Constants.ButtonStyles.PRIMARY, // This is the style of the button https://discord.com/developers/docs/interactions/message-components#button-object-button-styles
                                                  custom_id: "second_button4",
                                                  emoji: {name: "❌",id: null, animated: "false"},
                                                  disabled: false, // Whether or not the button is disabled, is false by default.
                                                }
                                              ]
                                            }]})
                                        messageID = Object.values(messageOutput)[0]

                                        message.channel.getMessage(messageID)
                                            .then(message => {
                                                client.on("interactionCreate", async (interaction) => {
                                                    const shopperReaction = []
                                                      if (interaction.data.custom_id == "second_button4" && interaction.message.id == message.id) {
                                                        await interaction.deferUpdate()
                                                        shopperReaction.push(interaction.member.id);
                                                        if (shopperReaction.includes(shopper.userID)) {
                                                            const canceled = new Eris.RichEmbed()
                                                                .setTitle("Currently in Shop")
                                                                .setDescription(`Continue shopping by selecting another item to view and potentially purchase. To exit the shop early, type 0.`)
                                                                .setColor("#9370DB")
                                                                .setFooter(`${member.username}#${member.discriminator} | In Shop`, member.avatarURL, member.avatarURL)
                                                            message.edit({ embed: canceled , components: [], attachments: []})
                                                        }
                                                    }
                                                    if (interaction.data.custom_id == "first_button4" && interaction.message.id == message.id) {
                                                        await interaction.deferUpdate()
                                                        shopperReaction.push(interaction.member.id);
                                                        if (shopperReaction.includes(shopper.userID)) {
                                                            message.edit({components:[]})
                                                            if (shopper[nameCurrency] >= selectedItem.itemPrice) {
                                                                const bundles = []
                                                                for (i = 0; i < 5; i++) {
                                                                    var randomColor = Math.floor(Math.random() * 16777215).toString(16);

                                                                    while (randomColor.length < 6) {
                                                                        randomColor = Math.floor(Math.random() * 16777215).toString(16);
                                                                    }

                                                                    const color = colorNames.reduce((o, { name, hex }) => Object.assign(o, { [name]: hex }), {});
                                                                    const nearest = nearestColor.from(color);
                                                                    const selectedColor = nearest('#' + randomColor);
                                                                    var rgb = Object.values(selectedColor.rgb)
                                                                    rgb = rgb.toString().replace(/,[s]*/g, ", ")
                                                                    bundles.push({ name: selectedColor.name, hexCode: selectedColor.value, rgb: rgb })
                                                                }

                                                                if (bundles.length > 0) {

                                                                    const canvas = Canvas.createCanvas(900, 190);
                                                                    const context = canvas.getContext('2d');
                                                                    const background = await Canvas.loadImage('transparent.png');
                                                                    context.drawImage(background, 0, 0, canvas.width, canvas.height);

                                                                    for (i = 0; i < bundles.length; i++) {
                                                                        context.fillStyle = bundles[i].hexCode
                                                                        context.fillRect(180 * i, 20, 150, 150)
                                                                    }

                                                                    const hueBuffer = canvas.toBuffer();
                                                                    const hueAttachment = { file: hueBuffer, name: "hue.png" };

                                                                    const huesList = []
                                                                    for (i = 0; i < bundles.length; i++) {

                                                                        hueTracker.execute(message, client)
                                                                        const hueInformation = await hueInfo.findOne({ $and: [{ name: bundles[i].name }, { hexCode: bundles[i].hexCode }, { rgb: bundles[i].rgb }] })
                                                                        const boughtHue = await hues.findOne({ $and: [{ owner: shopper.userID }, { name: bundles[i].name }, { hexCode: bundles[i].hexCode }, { rgb: bundles[i].rgb }] })


                                                                        if (hueInformation == null || hueInformation == undefined) {
                                                                            const newData = new hueInfo({
                                                                                name: bundles[i].name,
                                                                                hexCode: bundles[i].hexCode,
                                                                                rgb: bundles[i].rgb
                                                                            })
                                                                            newData.save().catch(err => console.log(err));
                                                                        }

                                                                        if (boughtHue == null || boughtHue == undefined) {
                                                                            const newData = new hues({
                                                                                name: bundles[i].name,
                                                                                hexCode: bundles[i].hexCode,
                                                                                rgb: bundles[i].rgb,
                                                                                owner: [shopper.userID],
                                                                                quantity: 1
                                                                            })
                                                                            newData.save().catch(err => console.log(err));
                                                                        } else {
                                                                            boughtHue.quantity = boughtHue.quantity + 1
                                                                            boughtHue.save()
                                                                        }

                                                                        huesList.push("**" + bundles[i].name + '** | ' + bundles[i].hexCode + '\n')

                                                                    }

                                                                    shopper[nameCurrency] = shopper[nameCurrency] - selectedItem.itemPrice
                                                                    shopper.save()

                                                                    const purchasedHue = new Eris.RichEmbed()
                                                                        .setTitle("")
                                                                        .setDescription(`**HUE BUNDLE**\n\n**Selected Colors**\n` + huesList.toString().replace(/,/g, ""))
                                                                        .setColor(bundles[0].hexCode)
                                                                        .setImage("attachment://hue.png")
                                                                        .setFooter(`${member.username}#${member.discriminator} | Purchased Hue Bundle`, member.avatarURL, member.avatarURL)
                                                                    message.channel.createMessage({ embed: purchasedHue }, hueAttachment)
                                                                }

                                                            } else {
                                                                const canceled = new Eris.RichEmbed()
                                                                    .setTitle("")
                                                                    .setDescription(`<:exclaim:906289233814241290> Transaction unsuccessful due to insufficient ` + nameCurrency)
                                                                    .setColor("#9370DB")
                                                                    .setFooter(`${member.username}#${member.discriminator} | Purchasing Item Failed`, member.avatarURL, member.avatarURL)
                                                                message.edit({ embed: canceled ,components:[]})
                                                            }
                                                        }

                                                    }
                                                })
                                            })
                                        break;

                                    } case
                                    "Themed Hue Bundle": {
                                        nameItem = ""

                                        const bundles = await hueBundles.find({})
                                        const bundleList = []

                                        var trackPage = 0
                                        var numPage = 1
                                        const foundPages = []

                                        if (bundles.length != 0) {
                                            for (i = 0; i < bundles.length; i++) {
                                                bundleList.push("**Bundle " + (i + 1) + " — **" + bundles[i].bundleName + "\n")
                                                if (i % 5 == 0) {
                                                    trackPage += 1;
                                                    foundPages.push(trackPage)
                                                }
                                            }
                                        }

                                        const themedBundle = new Eris.RichEmbed()
                                            .setTitle("**THEMED HUE BUNDLE**")
                                            .setDescription(`Select a pre-made hue bundle complete with five complementary hues to add to your collection.\n\n**Cost of Item**\n` + selectedItem.itemPrice + " " + currencyEmoji + "\n\n**Purchasing Guide**\nView a bundle and its featured colors by typing 'bundle' followed by the number given. A prompt will be provided to buy the displayed hue bundle. To cancel buying a themed hue bundle, press x.\n\n" + bundleList.slice((numPage) * 5 - 5, (numPage) * 5).toString().replace(/,/g, ""))
                                            .setColor("#9370DB")
                                            .setImage("https://i.imgur.com/2Y1THaD.png")
                                            .setFooter(`${member.username}#${member.discriminator} | Select a Themed Hue Bundle`, member.avatarURL, member.avatarURL)
                                        messageOutput = await message.channel.createMessage({ embed: themedBundle ,
                                            components: [
                                                {
                                                  type: Constants.ComponentTypes.ACTION_ROW, // You can have up to 5 action rows, and 1 select menu per action row
                                                  components: [
                                                   {
                                                      type: Constants.ComponentTypes.BUTTON, // https://discord.com/developers/docs/interactions/message-components#buttons
                                                      style: Constants.ButtonStyles.PRIMARY, // This is the style of the button https://discord.com/developers/docs/interactions/message-components#button-object-button-styles
                                                      custom_id: "first_button5",
                                                      emoji: {name: "❌",id: null, animated: "false"},
                                                      disabled: false, // Whether or not the button is disabled, is false by default.
                                                    }
                                                  ]
                                                }]})
                                        messageID = Object.values(messageOutput)[0]

                                        message.channel.getMessage(messageID)
                                            .then(message => {

                                                if (bundleCheck.has(bundleCollection)) {
                                                    bundleCollection.stop()
                                                    bundleCheck.delete(bundleCollection)
                                                }
                                                let customHueFilter = (message) => message.author.id == message.member.id
                                                const customCollector = new MessageCollector(client, message.channel, customHueFilter, { // Create our collector with our options set as the current channel, the client, filter and our time
                                                    time: 60000
                                                });

                                                customListener = customCollector.on("collect", async (message) => {
                                                    if (message.author.id == member.id) {
                                                        if (message.content.length >= 1) {
                                                            const bundleLabel = /bundle/g;
                                                            if (message.content.match(bundleLabel) && message.content.match(bundleLabel).length > 0) {
                                                                var selectedBundle;
                                                                var content = message.content.replace(/bundle/g, '')
                                                                for (i = 0; i < bundles.length; i++) {
                                                                    if (i + 1 == content) {
                                                                        selectedBundle = bundles[i]
                                                                    }
                                                                }

                                                                if (selectedBundle != null && selectedBundle != undefined) {
                                                                    bundleCheck.add(await customCollector)
                                                                    bundleCollection = await customCollector
                                                                    const canvas = Canvas.createCanvas(900, 190);
                                                                    const context = canvas.getContext('2d');
                                                                    const background = await Canvas.loadImage('transparent.png');
                                                                    context.drawImage(background, 0, 0, canvas.width, canvas.height);

                                                                    const selectedBundles = []
                                                                    for (i = 0; i < selectedBundle.names.length; i++) {
                                                                        selectedBundles.push("**" + selectedBundle.names[i] + "** | " + selectedBundle.hexCodes[i] + '\n')

                                                                        context.fillStyle = selectedBundle.hexCodes[i]
                                                                        context.fillRect(180 * i, 20, 150, 150)

                                                                    }

                                                                    const hueBuffer = canvas.toBuffer();
                                                                    const hueAttachment = { file: hueBuffer, name: "hue.png" };

                                                                    const themedBundle = new Eris.RichEmbed()
                                                                        .setTitle("")
                                                                        .setDescription(`**` + selectedBundle.bundleName + `**\n\n**Selected Colors**\n` + selectedBundles.toString().replace(/,/g, ""))
                                                                        .setColor(selectedBundle.hexCodes[0])
                                                                        .setImage("attachment://hue.png")
                                                                        .setFooter(`${member.username}#${member.discriminator} | Showing ` + selectedBundle.bundleName, member.avatarURL, member.avatarURL)
                                                                    messageOutput = await message.channel.createMessage({ embed: themedBundle , components: [
                                                                        {
                                                                          type: Constants.ComponentTypes.ACTION_ROW, // You can have up to 5 action rows, and 1 select menu per action row
                                                                          components: [
                                                                            {
                                                                              type: Constants.ComponentTypes.BUTTON, // https://discord.com/developers/docs/interactions/message-components#buttons
                                                                              style: Constants.ButtonStyles.PRIMARY, // This is the style of the button https://discord.com/developers/docs/interactions/message-components#button-object-button-styles
                                                                              custom_id: "first_button6",
                                                                              emoji: {name: "💳",id: null, animated: "false"},
                                                                              disabled: false, // Whether or not the button is disabled, is false by default,
                                                                            },
                                                                            {
                                                                              type: Constants.ComponentTypes.BUTTON, // https://discord.com/developers/docs/interactions/message-components#buttons
                                                                              style: Constants.ButtonStyles.PRIMARY, // This is the style of the button https://discord.com/developers/docs/interactions/message-components#button-object-button-styles
                                                                              custom_id: "second_button6",
                                                                              emoji: {name: "❌",id: null, animated: "false"},
                                                                              disabled: false, // Whether or not the button is disabled, is false by default.
                                                                            }
                                                                          ]
                                                                        }]}, hueAttachment)
                                                                    messageID = Object.values(messageOutput)[0]

                                                                    const completedBundle = selectedBundle
                                                                    selectedBundle = []

                                                                    message.channel.getMessage(messageID)
                                                                        .then(message => {
                                                                            client.on("interactionCreate", async (interaction) => {
                                                                                const shopperReaction = []
                                                                                  if (interaction.data.custom_id == "second_button6" && interaction.message.id == message.id) {
                                                                                    await interaction.deferUpdate()
                                                                                    shopperReaction.push(interaction.member.id);
                                                                                    if (shopperReaction.includes(shopper.userID)) {
                                                                                        const canceled = new Eris.RichEmbed()
                                                                                            .setTitle("Currently in Shop")
                                                                                            .setDescription(`Continue shopping by selecting another item to view and potentially purchase. To exit the shop early, type 0.`)
                                                                                            .setColor("#9370DB")
                                                                                            .setFooter(`${member.username}#${member.discriminator} | In Shop`, member.avatarURL, member.avatarURL)
                                                                                        message.edit({ embed: canceled, components: [], attachments: [] })
                                                                                    }
                                                                                }

                                                                                if (interaction.data.custom_id == "first_button6" && interaction.message.id == message.id) {
                                                                                    await interaction.deferUpdate()
                                                                                    shopperReaction.push(interaction.member.id);
                                                                                    if (shopperReaction.includes(shopper.userID)) {
                                                                                        if (shopper[nameCurrency] > selectedItem.itemPrice) {

                                                                                            for (i = 0; i < completedBundle.names.length; i++) {

                                                                                                hueTracker.execute(message, client)
                                                                                                const hueInformation = await hueInfo.findOne({ $and: [{ name: completedBundle.names[i] }, { hexCode: completedBundle.hexCodes[i] }, { rgb: completedBundle.rgb[i] }] })
                                                                                                const boughtHue = await hues.findOne({ $and: [{ owner: shopper.userID }, { name: completedBundle.names[i] }, { hexCode: completedBundle.hexCodes[i] }, { rgb: completedBundle.rgb[i] }] })


                                                                                                if (hueInformation == null || hueInformation == undefined) {
                                                                                                    const newData = new hueInfo({
                                                                                                        name: completedBundle.names[i],
                                                                                                        hexCode: completedBundle.hexCodes[i],
                                                                                                        rgb: completedBundle.rgb[i]
                                                                                                    })
                                                                                                    newData.save().catch(err => console.log(err));
                                                                                                }

                                                                                                if (boughtHue == null || boughtHue == undefined) {
                                                                                                    const newData = new hues({
                                                                                                        name: completedBundle.names[i],
                                                                                                        hexCode: completedBundle.hexCodes[i],
                                                                                                        rgb: completedBundle.rgb[i],
                                                                                                        owner: [shopper.userID],
                                                                                                        quantity: 1
                                                                                                    })
                                                                                                    newData.save().catch(err => console.log(err));
                                                                                                } else {
                                                                                                    boughtHue.quantity = boughtHue.quantity + 1
                                                                                                    boughtHue.save()
                                                                                                }

                                                                                            }

                                                                                            shopper[nameCurrency] = shopper[nameCurrency] - selectedItem.itemPrice
                                                                                            shopper.save()


                                                                                            themedBundle.setTitle("")
                                                                                            themedBundle.setDescription(`**` + completedBundle.bundleName + `**\n\n**Selected Colors**\n` + selectedBundles.toString().replace(/,/g, ""))
                                                                                            themedBundle.setColor(completedBundle.hexCodes[0])
                                                                                            themedBundle.setImage("attachment://hue.png")
                                                                                            themedBundle.setFooter(`${member.username}#${member.discriminator} | Purchased ` + completedBundle.bundleName, member.avatarURL, member.avatarURL)
                                                                                            message.edit({ embed: themedBundle , components:[]}, hueAttachment)
                                                                                        } else {
                                                                                            themedBundle.setTitle("")
                                                                                            themedBundle.setDescription(`**` + completedBundle.bundleName + `**\n\n<:exclaim:906289233814241290> Transaction unsuccessful due to insufficient ` + nameCurrency + `\n\n**Selected Colors**\n` + selectedBundles.toString().replace(/,/g, ""))
                                                                                            themedBundle.setColor(completedBundle.hexCodes[0])
                                                                                            themedBundle.setImage("attachment://hue.png")
                                                                                            themedBundle.setFooter(`${member.username}#${member.discriminator} | Purchased ` + completedBundle.bundleName, member.avatarURL, member.avatarURL)
                                                                                            message.edit({ embed: themedBundle , components:[]}, hueAttachment)
                                                                                        }
                                                                                    }
                                                                                }
                                                                            })
                                                                        })

                                                                }

                                                            }
                                                        }
                                                    }
                                                })

                                                client.on("interactionCreate", async (interaction) => {
                                                    const shopperReaction = []
                                                      if (interaction.data.custom_id == "first_button5" && interaction.message.id == message.id) {
                                                        await interaction.deferUpdate()
                                                        shopperReaction.push(interaction.member.id);
                                                        if (shopperReaction.includes(shopper.userID)) {
                                                            const canceled = new Eris.RichEmbed()
                                                                .setTitle("Currently in Shop")
                                                                .setDescription(`Continue shopping by selecting another item to view and potentially purchase. To exit the shop early, type 0.`)
                                                                .setColor("#9370DB")
                                                                .setFooter(`${member.username}#${member.discriminator} | In Shop`, member.avatarURL, member.avatarURL)
                                                            message.edit({ embed: canceled , components: [], attachments: []})
                                                        }
                                                    }
                                                })
                                            })
                                        break;
                                    } case
                                    "Magazine": {

                                        nameItem = ""
                                        const magazine = new Eris.RichEmbed()
                                            .setTitle("**COMING SOON: MAGAZINE**")
                                            .setDescription(`Create a magazine to showcase and hold cards of your favorite cards and artists.\n\n**Cost of Item**\n` + selectedItem.itemPrice + " " + currencyEmoji + "\n\n**Purchasing Guide**\nComing Soon")
                                            .setColor("#9370DB")
                                            .setImage("https://i.imgur.com/UUyqknf.png")
                                            .setFooter(`${member.username}#${member.discriminator} | Almost in Stock`, member.avatarURL, member.avatarURL)
                                        messageOutput = await message.channel.createMessage({ embed: magazine ,
                                            components: [
                                                {
                                                  type: Constants.ComponentTypes.ACTION_ROW, // You can have up to 5 action rows, and 1 select menu per action row
                                                  components: [
                                                   {
                                                      type: Constants.ComponentTypes.BUTTON, // https://discord.com/developers/docs/interactions/message-components#buttons
                                                      style: Constants.ButtonStyles.PRIMARY, // This is the style of the button https://discord.com/developers/docs/interactions/message-components#button-object-button-styles
                                                      custom_id: "first_button7",
                                                      emoji: {name: "❌",id: null, animated: "false"},
                                                      disabled: false, // Whether or not the button is disabled, is false by default.
                                                    }
                                                  ]
                                                }]})
                                        messageID = Object.values(messageOutput)[0]

                                        message.channel.getMessage(messageID)
                                            .then(message => {
                                                client.on("interactionCreate", async (interaction) => {
                                                    const shopperReaction = []
                                                      if (interaction.data.custom_id == "first_button7" && interaction.message.id == message.id) {
                                                        await interaction.deferUpdate()
                                                        shopperReaction.push(interaction.member.id);
                                                        if (shopperReaction.includes(shopper.userID)) {
                                                            const canceled = new Eris.RichEmbed()
                                                                .setTitle("Currently in Shop")
                                                                .setDescription(`Continue shopping by selecting another item to view and potentially purchase. To exit the shop early, type 0.`)
                                                                .setColor("#9370DB")
                                                                .setFooter(`${member.username}#${member.discriminator} | In Shop`, member.avatarURL, member.avatarURL)
                                                            message.edit({ embed: canceled , components: [], attachments: []})
                                                        }

                                                    }
                                                })
                                            })
                                        break;

                                    } case
                                    "Frame": {
                                        nameItem = ""

                                        const frames = fs.readdirSync('./img/cosmetics/frames/')
                                        const foundFrames = []
                                        const nameFrames = []
                                        for (i = 0; i < frames.length; i++) {
                                            var chosenFrame = frames[i].substring(0, frames[i].indexOf(".png"))
                                            chosenFrame = chosenFrame.replace(/_/g, " ")
                                            if (!chosenFrame.includes("Default")) {
                                                foundFrames.push(frames[i])
                                                nameFrames.push(chosenFrame)
                                            }
                                        }

                                        var trackPage = 0
                                        var numPage = 1
                                        const foundPages = []
                                        const frameList = []
                                        if (nameFrames.length != 0) {
                                            for (i = 0; i < nameFrames.length; i++) {
                                                frameList.push("**Frame " + (i + 1) + " — **" + nameFrames[i] + "\n")
                                                if (i % 5 == 0) {
                                                    trackPage += 1;
                                                    foundPages.push(trackPage)
                                                }
                                            }
                                        }
                                        const frameView = new Eris.RichEmbed()
                                            .setTitle("**FRAME**")
                                            .setDescription(`Decorative borders to customize your favorite cards.\n\n**Cost of Item**\n` + selectedItem.itemPrice + " " + currencyEmoji + "\n\n**Purchasing Guide**\nView a frame and its example by typing 'frame' followed by the number given. A prompt will be provided to buy the displayed frame. To cancel buying a frame, press x.\n\n" + frameList.slice((numPage) * 5 - 5, (numPage) * 5).toString().replace(/,/g, ""))
                                            .setColor("#9370DB")
                                            .setImage("https://i.imgur.com/dLSPcxu.png")
                                            .setFooter(`${member.username}#${member.discriminator} | Select a Frame`, member.avatarURL, member.avatarURL)
                                        messageOutput = await message.channel.createMessage({ embed: frameView ,
                                            components: [
                                                {
                                                  type: Constants.ComponentTypes.ACTION_ROW, // You can have up to 5 action rows, and 1 select menu per action row
                                                  components: [
                                                   {
                                                      type: Constants.ComponentTypes.BUTTON, // https://discord.com/developers/docs/interactions/message-components#buttons
                                                      style: Constants.ButtonStyles.PRIMARY, // This is the style of the button https://discord.com/developers/docs/interactions/message-components#button-object-button-styles
                                                      custom_id: "first_button8",
                                                      emoji: {name: "❌",id: null, animated: "false"},
                                                      disabled: false, // Whether or not the button is disabled, is false by default.
                                                    }
                                                  ]
                                                }]})
                                        messageID = Object.values(messageOutput)[0]


                                        message.channel.getMessage(messageID)
                                            .then(message => {

                                                if (frameCheck.has(frameCollection)) {
                                                    frameCollection.stop()
                                                    frameCheck.delete(frameCollection)
                                                }

                                                let customFrameFilter = (message) => message.author.id == message.member.id
                                                const frameCollector = new MessageCollector(client, message.channel, customFrameFilter, { // Create our collector with our options set as the current channel, the client, filter and our time
                                                    time: 60000
                                                });

                                                var selectedIndex = 0;
                                                var ownedFrame;
                                                var hasFrame = false;
                                                var quantity = 1
                                                var frameIndex = 0
                                                frameListener = frameCollector.on("collect", async (message) => {
                                                    if (message.author.id == member.id) {
                                                        if (message.content.length >= 1) {
                                                            const frameLabel = /frame/g;
                                                            if (message.content.match(frameLabel) && message.content.match(frameLabel).length > 0) {
                                                                var selectedFrame;
                                                                var content = message.content.replace(/frame/g, '')
                                                                for (i = 0; i < foundFrames.length; i++) {
                                                                    if (i + 1 == content) {
                                                                        selectedFrame = foundFrames[i]
                                                                        selectedIndex = i
                                                                    }
                                                                }
                                                                if (selectedFrame != null && selectedFrame != undefined) {
                                                                    frameCheck.add(await frameCollector)
                                                                    frameCollection = await frameCollector

                                                                    const userData = await user.findOne({ userID: shopper.userID })
                                                                    for (i = 0; i < userData.frames.length; i++) {
                                                                        if (userData.frames[i].name == nameFrames[selectedIndex]) {
                                                                            ownedFrame = userData.frames[i]
                                                                            quantity = userData.frames[i].quantity + 1
                                                                            frameIndex = i
                                                                            hasFrame = true

                                                                        }
                                                                    }

                                                                    const canvas = Canvas.createCanvas(600, 900);
                                                                    const context = canvas.getContext('2d');
                                                                    const background = await Canvas.loadImage('transparent.png');
                                                                    context.drawImage(background, 0, 0, canvas.width, canvas.height);

                                                                    const card = fs.readdirSync("./img/idol_cards/")
                                                                    const cardPath = "./img/idol_cards/"
                                                                    const artist = card[Math.round(Math.random() * (card.length - 1))]; // Randomizes the chosen group (Ex. BTS)
                                                                    const artistFolder = fs.readdirSync(cardPath + '' + artist + '/'); // Stores the current file path with the group name
                                                                    const era = artistFolder[Math.round(Math.random() * (artistFolder.length - 1))]
                                                                    const eraFolder = fs.readdirSync(cardPath + '' + artist + '/' + '' + era + '/'); // Stores the current file path with the group name and era name
                                                                    const idol = eraFolder[Math.round(Math.random() * (eraFolder.length - 1))]
                                                                    const name = idol.split("_")[0] // Stores the name of the idol or "Group" to be featured on the first card
                                                                    const group = idol.split("_")[1].replace(".png", "") // Stores the group name to be featured on the first card
                                                                    var eraName = ""
                                                                    if (era.includes(";")) {
                                                                        eraName = era.replace(";", ":")
                                                                    } else {
                                                                        eraName = era
                                                                    }

                                                                    const idolCard = await Canvas.loadImage(cardPath + '' + artist + '/' + era + '/' + idol);
                                                                    context.drawImage(idolCard, 30, 75, 540, 657);

                                                                    const palette = await ColorThief.getPalette(cardPath + '' + artist + '/' + era + '/' + idol, 10)
                                                                    const selectedColors = palette[Math.floor(Math.random() * palette.length)];
                                                                    const rgbToHex = (r, g, b) => '#' + [r, g, b].map(x => {
                                                                        const hex = x.toString(16)
                                                                        return hex.length === 1 ? '0' + hex : hex
                                                                    }).join('')

                                                                    const hexColor = rgbToHex(selectedColors[0], selectedColors[1], selectedColors[2]);
                                                                    const color = colorNames.reduce((o, { name, hex }) => Object.assign(o, { [name]: hex }), {});
                                                                    const nearest = nearestColor.from(color);
                                                                    const nearestHues = nearest(hexColor);
                                                                    context.fillStyle = hexColor;
                                                                    context.fillRect(0, 0, 34, 900);
                                                                    context.fillStyle = hexColor;
                                                                    context.fillRect(565, 0, 35, 900);
                                                                    context.fillStyle = hexColor;
                                                                    context.fillRect(0, 729, 600, 171);
                                                                    context.fillStyle = hexColor;
                                                                    context.fillRect(0, 0, 600, 76);

                                                                    const frameImage = await Canvas.loadImage("./img/cosmetics/frames/" + selectedFrame)
                                                                    context.drawImage(frameImage, 0, 0, 600, 900);

                                                                    const idolIcon = await Canvas.loadImage('./img/idol_icons/' + '' + artist + '/' + era + '/' + idol);
                                                                    context.drawImage(idolIcon, 34, 747.5, 138, 121);


                                                                    const cosmetics = await Canvas.loadImage("./img/cosmetics/misc/Barcode.png")
                                                                    context.drawImage(cosmetics, 477, 20, 90, 40);

                                                                    // ISSUE NUMBER: Placed on top left of the chosen card. It provides the issue number associated
                                                                    // with the card.
                                                                    context.font = '37px "Prompt"';
                                                                    context.textAlign = "left";
                                                                    context.fillStyle = "#FFFFFF";
                                                                    var issue = "#1"
                                                                    context.fillText(issue, 33, 50);

                                                                    // IDOL AND GROUP NAMES: Determines whether a card is a group card or a regular idol card and displays
                                                                    // the text accordingly. Both output two lines of text that provides accurate information about the card.
                                                                    // If it is a regular idol card, the idol's name followed by the group the idol belongs to is given. If it
                                                                    // is a group card or soloist card, the group's name followed by "group" or "soloist" is given.

                                                                    context.font = '44px "Prompt-Bold"';
                                                                    context.textAlign = "right";
                                                                    context.fillStyle = "#FFFFFF"
                                                                    var idolName = name.toUpperCase();
                                                                    context.fillText(idolName, 566, 810);

                                                                    context.font = '26px "Prompt"';
                                                                    context.textAlign = "right";
                                                                    context.fillStyle = "#FFFFFF";
                                                                    var groupName = group.toUpperCase();
                                                                    context.fillText(groupName, 566, 838);


                                                                    const buffer = canvas.toBuffer();
                                                                    const cardAttachment = { file: buffer, name: "frame.png" };

                                                                    const frameView = new Eris.RichEmbed()
                                                                        .setTitle("")
                                                                        .setDescription("**" + nameFrames[selectedIndex] + "**\n\n**" + group + "** " + name + " (" + eraName + ")\n" + nearestHues.name + " | " + nearestHues.value + "\n\nFeatured example includes the " + nameFrames[selectedIndex] + " complete with a randomized hue to match the color palette of the card. Customize the frame with hues in the visibly dyed areas.\n\nHues and frames sold separately.")
                                                                        .setColor(hexColor)
                                                                        .setImage("attachment://frame.png")
                                                                        .setFooter(`${member.username}#${member.discriminator} | Showing ` + nameFrames[selectedIndex], member.avatarURL, member.avatarURL)
                                                                    messageOutput = await message.channel.createMessage({ embed: frameView , components: [
                                                                        {
                                                                          type: Constants.ComponentTypes.ACTION_ROW, // You can have up to 5 action rows, and 1 select menu per action row
                                                                          components: [
                                                                            {
                                                                              type: Constants.ComponentTypes.BUTTON, // https://discord.com/developers/docs/interactions/message-components#buttons
                                                                              style: Constants.ButtonStyles.PRIMARY, // This is the style of the button https://discord.com/developers/docs/interactions/message-components#button-object-button-styles
                                                                              custom_id: "first_button9",
                                                                              emoji: {name: "💳",id: null, animated: "false"},
                                                                              disabled: false, // Whether or not the button is disabled, is false by default,
                                                                            },
                                                                            {
                                                                              type: Constants.ComponentTypes.BUTTON, // https://discord.com/developers/docs/interactions/message-components#buttons
                                                                              style: Constants.ButtonStyles.PRIMARY, // This is the style of the button https://discord.com/developers/docs/interactions/message-components#button-object-button-styles
                                                                              custom_id: "second_button9",
                                                                              emoji: {name: "❌",id: null, animated: "false"},
                                                                              disabled: false, // Whether or not the button is disabled, is false by default.
                                                                            }
                                                                          ]
                                                                        }]}, cardAttachment)
                                                                    messageID = Object.values(messageOutput)[0]

                                                                    message.channel.getMessage(messageID)
                                                                        .then(message => {

                                                                            client.on("interactionCreate", async (interaction) => {
                                                                                const shopperReaction = []
                                                                                  if (interaction.data.custom_id == "second_button9" && interaction.message.id == message.id) {
                                                                                    await interaction.deferUpdate()
                                                                                    shopperReaction.push(interaction.member.id);
                                                                                    if (shopperReaction.includes(shopper.userID)) {
                                                                                        const canceled = new Eris.RichEmbed()
                                                                                            .setTitle("Currently in Shop")
                                                                                            .setDescription(`Continue shopping by selecting another item to view and potentially purchase. To exit the shop early, type 0.`)
                                                                                            .setColor("#9370DB")
                                                                                            .setFooter(`${member.username}#${member.discriminator} | In Shop`, member.avatarURL, member.avatarURL)
                                                                                        message.edit({ embed: canceled , components: [], attachments: []})
                                                                                    }
                                                                                }

                                                                                if (interaction.data.custom_id == "first_button9" && interaction.message.id == message.id) {
                                                                                    await interaction.deferUpdate()
                                                                                    shopperReaction.push(interaction.member.id);
                                                                                    if (shopperReaction.includes(shopper.userID)) {
                                                                                        if (shopper[nameCurrency] >= selectedItem.itemPrice) {

                                                                                            const finalFrame = await frame.findOne({ name: nameFrames[selectedIndex] })


                                                                                            if (finalFrame == null || finalFrame == undefined) {
                                                                                                const newData = new frame({
                                                                                                    name: nameFrames[selectedIndex],
                                                                                                    image: { image: "./img/cosmetics/frames/" + selectedFrame, x: 0, y: 0, w: 600, h: 900 },
                                                                                                    purchased: 1

                                                                                                })
                                                                                                newData.save().catch(err => console.log(err));
                                                                                            } else {
                                                                                                finalFrame.purchased = finalFrame.purchased + 1
                                                                                                finalFrame.save()
                                                                                            }


                                                                                            if (hasFrame) {
                                                                                                userData.frames.splice(frameIndex, 1)
                                                                                                userData.frames.splice(frameIndex, 0, { name: nameFrames[selectedIndex], image: "./img/cosmetics/frames/" + selectedFrame, x: 0, y: 0, w: 600, h: 900, quantity: quantity })
                                                                                            } else {
                                                                                                userData.frames.push({ name: nameFrames[selectedIndex], image: "./img/cosmetics/frames/" + selectedFrame, x: 0, y: 0, w: 600, h: 900, quantity: quantity })
                                                                                            }

                                                                                            userData.save()
                                                                                            frameView.setTitle("")
                                                                                            frameView.setDescription("**" + nameFrames[selectedIndex] + "**\nSuccessfully Purchased")
                                                                                            frameView.setImage("attachment://frame.png")
                                                                                            frameView.setFooter(`${member.username}#${member.discriminator} | Purchased ` + nameFrames[selectedIndex], member.avatarURL, member.avatarURL)
                                                                                            message.edit({ embed: frameView , components: []}, cardAttachment)
                                                                                        } else {

                                                                                            frameView.setTitle("")
                                                                                            frameView.setDescription("**" + nameFrames[selectedIndex] + "\n\n**<:exclaim:906289233814241290> Transaction unsuccessful due to insufficient " + nameCurrency + "\n\n**" + group + "** " + name + " (" + eraName + ")\n" + nearestHues.name + " | " + nearestHues.value)
                                                                                            frameView.setColor("#9370DB")
                                                                                            frameView.setImage("attachment://frame.png")
                                                                                            frameView.setFooter(`${member.username}#${member.discriminator} | Purchasing Item Failed`, member.avatarURL, member.avatarURL)
                                                                                            message.edit({ embed: frameView , components: []}, cardAttachment)
                                                                                        }
                                                                                    }
                                                                                }
                                                                            })

                                                                        })

                                                                }
                                                            }
                                                        }
                                                    }
                                                })


                                                client.on("interactionCreate", async (interaction) => {
                                                    const shopperReaction = []
                                                      if (interaction.data.custom_id == "first_button8" && interaction.message.id == message.id) {
                                                        await interaction.deferUpdate()
                                                        shopperReaction.push(interaction.member.id);
                                                        if (shopperReaction.includes(shopper.userID)) {
                                                            const canceled = new Eris.RichEmbed()
                                                                .setTitle("Currently in Shop")
                                                                .setDescription(`Continue shopping by selecting another item to view and potentially purchase. To exit the shop early, type 0.`)
                                                                .setColor("#9370DB")
                                                                .setFooter(`${member.username}#${member.discriminator} | In Shop`, member.avatarURL, member.avatarURL)
                                                            message.edit({ embed: canceled , components: [], attachments: []})
                                                        }
                                                    }
                                                })
                                            })

                                        break;

                                    } case
                                    "Sticker": {

                                        nameItem = ""
                                        const sticker = new Eris.RichEmbed()
                                            .setTitle("**COMING SOON: STICKER**")
                                            .setDescription(`Customize your cards with decorative stickers tailored to fit all collections.\n\n**Cost of Item**\n` + selectedItem.itemPrice + " " + currencyEmoji + "\n\n**Purchasing Guide**\nComing Soon")
                                            .setColor("#9370DB")
                                            .setImage("https://i.imgur.com/Nl2c8FR.png")
                                            .setFooter(`${member.username}#${member.discriminator} | Almost in Stock`, member.avatarURL, member.avatarURL)
                                        messageOutput = await message.channel.createMessage({ embed: sticker ,
                                            components: [
                                                {
                                                  type: Constants.ComponentTypes.ACTION_ROW, // You can have up to 5 action rows, and 1 select menu per action row
                                                  components: [
                                                   {
                                                      type: Constants.ComponentTypes.BUTTON, // https://discord.com/developers/docs/interactions/message-components#buttons
                                                      style: Constants.ButtonStyles.PRIMARY, // This is the style of the button https://discord.com/developers/docs/interactions/message-components#button-object-button-styles
                                                      custom_id: "first_button10",
                                                      emoji: {name: "❌",id: null, animated: "false"},
                                                      disabled: false, // Whether or not the button is disabled, is false by default.
                                                    }
                                                  ]
                                                }]})
                                        messageID = Object.values(messageOutput)[0]

                                        message.channel.getMessage(messageID)
                                            .then(message => {
                                                
                                                client.on("interactionCreate", async (interaction) => {
                                                    const shopperReaction = []
                                                      if (interaction.data.custom_id == "first_button10" && interaction.message.id == message.id) {
                                                        await interaction.deferUpdate()
                                                        shopperReaction.push(interaction.member.id);
                                                        if (shopperReaction.includes(shopper.userID)) {
                                                            const canceled = new Eris.RichEmbed()
                                                                .setTitle("Currently in Shop")
                                                                .setDescription(`Continue shopping by selecting another item to view and potentially purchase. To exit the shop early, type 0.`)
                                                                .setColor("#9370DB")
                                                                .setFooter(`${member.username}#${member.discriminator} | In Shop`, member.avatarURL, member.avatarURL)
                                                            message.edit({ embed: canceled , components: []})
                                                        }

                                                    }
                                                })
                                            })
                                        break;
                                    }
                            }
                       
                    }
                }) 
            }

        }
    // }
// }

