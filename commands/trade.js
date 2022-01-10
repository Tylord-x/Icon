/*---------------------------------------LOADING IN THE PACKAGES---------------------------------------*/

// MODELS: Gets the necessary data models from the database to complete the upgrade process
const claimedCards = require('../models/claimedCards.js');
const user = require('../models/user.js');

// REACTION HANDLER: Allows the player to interact with the embeds
const ReactionHandler = require('eris-reactions');

// MESSAGE LISTENER: Listens for all the messages that are typed by the traders
const { MessageCollector } = require('eris-message-collector');

const Eris = require('eris');
require('pluris')(Eris);
const Constants = Eris.Constants;


/*---------------------------------TRADE COMMANDS: BEGINNING THE TRADE COMMANDS----------------------*/
module.exports = {
    name: 'trade',
    description: "Players can trade cards to one another",
    aliases: ["tr"],
    async execute(client, message, args, Eris) {
        const initiator = message.member.user; // Stores the information of the player initiating the trade
        const trader = await user.findOne({ userID: initiator.id })
        const content = args
        var receiver = ""; // Stores the ID of the co-trader if found
        var receiverInfo; // Stores the overall profile information found of the co-trader
        var receiverName = "" // Depending on the chosen player (mentioning, id, or viewer), will provide their name
        var receiverDiscriminator = "" // Depending on the chosen player (mentioning, id, or viewer), will provide their discriminator
        var receiverAvatar = "" // Depending on the chosen player (mentioning, id, or viewer), will provide their avatar url

        const tradeCooldownTime = 60000; // Sets the trade cooldowns to 1 minute

        if (content != null && content != undefined) {

            if ((content.length >= 1 && message.mentions.length < 1) || message.mentions.length >= 1) {
                // MENTIONED PLAYER: If the method of identifying the co-trader is mentioning, the resulting information 
                // provided by the guild will be saved. This includes the co-trader's name, discriminator, and avatar.
                // This information will be used later on within the trade embeds.
                if (message.mentions.length >= 1) {
                    receiver = message.channel.guild.members.get(message.mentions[0].id).user.id
                    receiverInfo = message.channel.guild.members.get(message.mentions[0].id).user
                    receiverName = message.channel.guild.members.get(message.mentions[0].id).user.username
                    receiverDiscriminator = message.channel.guild.members.get(message.mentions[0].id).user.discriminator
                    receiverAvatar = message.channel.guild.members.get(message.mentions[0].id).user.avatarURL
                } else {
                    // FINDING PLAYER BY ID: If there is no player mentioned and if the arguments length is at least 1, it will
                    // check whether the first argument matches up to a player ID. If the player can be found within the 
                    // playerbase, the player's information will be stored.
                    const checkPlayer = await user.findOne({ userID: content[0] })
                    if (checkPlayer != null && checkPlayer != undefined) {
                        receiver = checkPlayer.userID
                        receiverInfo = checkPlayer
                        receiverName = checkPlayer.name
                        receiverDiscriminator = checkPlayer.discriminator
                        receiverAvatar = checkPlayer.avatar
                    }
                    // MEMBER GUILD INFORMATION: If the player can be found within the guild, the labels process will 
                    // instead opt to use the information provided directly by Discord. This avoids any unupdated information
                    // that may have been missed. However, all necessary information should be provided by the profile
                    // found within the database.
                    const members = await message.guild.fetchMembers()
                    for (i = 0; i < members.length; i++) {
                        if (members[i].id == content[0]) {
                            receiverInfo = members[i]
                            receiverName = members[i].username
                            receiverDiscriminator = members[i].discriminator
                            receiverAvatar = members[i].avatarURL
                        }
                    }
                }

                // COTRADER: Requests information for the player acting as the co-trader in the trade from the database
                const coTrader = await user.findOne({ userID: receiver })



                // TRADER AND COTRADER: Ensures that both the trader and co-trader exist within the playerbase. If so,
                // then the trade process will begin. Otherwise, the players will be prompted that one or both players
                // do not currenty exist within the playerbase.
                if (trader != null && trader != undefined && coTrader != null && coTrader != undefined) {

                    /*---------------------------------CREATES AND TRACKS COOLDOWNS FOR TRADERS-------------------------------*/

                    // TRADE COOLDOWN FUNCTION: Checks if either of the players are on a trade cooldown. This occurs when
                    // a player initiates a trade with another player. The trade must be completed, canceled, or timeout after
                    // a minute in order for the cooldown to reset. This is to prevent trades to listen to the players in multiple
                    // trade sessions.
                    async function tradeCooldown(cooldown) {
                        var onCooldown = false
                        if (tradeCooldownTime - (Date.now() - cooldown) > 0) {
                            onCooldown = true
                        } else {
                            onCooldown = false
                        }
                        return onCooldown
                    }

                    const traderCooldown = trader.tradeCooldown // Saves the trade cooldown time for the trader
                    const coTraderCooldown = coTrader.tradeCooldown // Saves the trade cooldown time for the co-trader

                    // TRADER COOLDOWNS: If both the trader and co-trader are found not to be on cooldown, the trade request
                    // is sent. Otherwise, the players will be given a message that instructs them to finish the trade, cancel,
                    // or let the trade timeout.
                    if (!await tradeCooldown(traderCooldown) && !await tradeCooldown(coTraderCooldown)) {

                        trader.tradeCooldown = Date.now() // Saves the new cooldown time for the trader
                        coTrader.tradeCooldown = Date.now() // Saves the new cooldown time for the co-trader
                        trader.save()
                        coTrader.save()

                        var messageOutput; // Stores the created trade request message
                        var messageID = "" // Stores the message ID of the created trade request message

                        // TRADE REQUEST: Begins the trade request with a trade embed pop up. It will display the trader, co-trader,
                        // and instructions on how to process with the trade.
                        const initiatingTrade = new Eris.RichEmbed()
                            .setTitle("**Trade Request**")
                            .setDescription(`<@${trader.userID}> is requesting to trade with <@${coTrader.userID}>\n\nTo begin the trade process, both players must agree to trade by pressing the mailbox. The trade can be canceled at any point.`)
                            .setColor("#33A7FF")
                            .setAuthor(`${initiator.username}#${initiator.discriminator}`, initiator.avatarURL, initiator.avatarURL)
                            .setFooter(`${receiverName}#${receiverDiscriminator} | Receiving Trade Request`, receiverAvatar, receiverAvatar)
                        messageOutput = await message.channel.createMessage({ 
                            embed: initiatingTrade ,
                            components: [
                                {
                                  type: Constants.ComponentTypes.ACTION_ROW, // You can have up to 5 action rows, and 1 select menu per action row
                                  components: [
                                    {
                                      type: Constants.ComponentTypes.BUTTON, // https://discord.com/developers/docs/interactions/message-components#buttons
                                      style: Constants.ButtonStyles.PRIMARY, // This is the style of the button https://discord.com/developers/docs/interactions/message-components#button-object-button-styles
                                      custom_id: "first_button1",
                                      emoji: {name: "📫",id: null, animated: "false"},
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
                                }]
                        })
                        messageID = Object.values(messageOutput)[0]
                        message.channel.getMessage(messageID)
                            .then(message => {
                                const traderReaction = []

                                client.on("interactionCreate", async (interaction) => {
                                        if (interaction.message.id == message.id) {
                                          if (interaction.data.custom_id == "first_button1" && interaction.message.id == message.id) {
                                            await interaction.deferUpdate()
                                            traderReaction.push(interaction.member.id); // Adds the reactors of the "x" emoji to the array
                                        // TRADER REACTION: Checks whether the trader and the co-trader agree to continue with the trade
                                        // and present their cards. If so, the trade will be designated as in progress.
                                        if (interaction.member.id != message.author.id && traderReaction.includes(coTrader.userID) && traderReaction.includes(trader.userID)) {
                                            message.edit({ components: []})
                                            const tradeInProgress = new Eris.RichEmbed()
                                                .setTitle("**Trade In Progress**")
                                                .setDescription(`<@${trader.userID}> is currently trading with <@${coTrader.userID}>\n\n**Guide**\nMessage the codes corresponding to the cards you would like to trade. Card information will be listed in the embed in real-time. One or more cards can be traded at a time.\n**Ex. 1 2 3**\n\nPress the letter to confirm or cancel the trade at any point with the stop sign.`)
                                                .setColor("#33A7FF")
                                                .setAuthor(`${initiator.username}#${initiator.discriminator}`, initiator.avatarURL, initiator.avatarURL)
                                                .setFooter(`${receiverName}#${receiverDiscriminator} | Now Trading`, receiverAvatar, receiverAvatar)
                                            messageOutput = await message.edit({ embed: tradeInProgress , components: []})
                                            messageID = Object.values(messageOutput)[0]
                                            message.edit({components: [
                                                {
                                                    type: Constants.ComponentTypes.ACTION_ROW, // You can have up to 5 action rows, and 1 select menu per action row
                                                    components: [
                                                        {
                                                            type: Constants.ComponentTypes.BUTTON, // https://discord.com/developers/docs/interactions/message-components#buttons
                                                            style: Constants.ButtonStyles.PRIMARY, // This is the style of the button https://discord.com/developers/docs/interactions/message-components#button-object-button-styles
                                                            custom_id: "first_button2",
                                                            emoji: {name: "📩",id: null, animated: "false"},
                                                            disabled: false, // Whether or not the button is disabled, is false by default,
                                                          },
                                                          {
                                                            type: Constants.ComponentTypes.BUTTON, // https://discord.com/developers/docs/interactions/message-components#buttons
                                                            style: Constants.ButtonStyles.PRIMARY, // This is the style of the button https://discord.com/developers/docs/interactions/message-components#button-object-button-styles
                                                            custom_id: "second_button2",
                                                            emoji: {name: "❌", id: null, animated: "false"},
                                                            disabled: false, // Whether or not the button is disabled, is false by default.
                                                          }
                                                    ]
                                                }
                                            ]})


                                            const traderCards = []; // Saves the card information of the selected cards of the trader
                                            const coTraderCards = []; // Saves the card information of the selected cards of the cotrader
                                            const traderList = []; // Creates a formatted list of the trader's cards
                                            const coTraderList = []; // Creates a formatted list of the co-trader's cards

                                            // MESSAGE COLLECTOR: The collector is created to listen to the 
                                            let filter = (message) => message.author.id == trader.userID || message.author.id == coTrader.userID
                                            const collector = new MessageCollector(client, message.channel, filter, { // Create our collector with our options set as the current channel, the client, filter and our time
                                                time: 60000
                                            });

                                            var messagedCards = false // Finds whether cards have been successfully messaged
                                            const collection = collector.on("collect", async (message) => {
                                                // TRADER: Collects all the messages from the trader. If any of the messages 
                                                // contain valid card codes that can be found within the inventory of the player,
                                                // then they are saved and displayed within the embed.
                                                if (message.author.id == trader.userID) {
                                                    const traderContent = []
                                                    traderContent.push(message.content)
                                                    var prepareTrade;
                                                    const traderCodes = []
                                                    for (i = 0; i < traderContent.length; i++) {
                                                        if (traderContent[i].includes(",")) {
                                                            prepareTrade = traderContent[i].split(",")
                                                        } else if (traderContent[i].includes(" ")) {
                                                            prepareTrade = traderContent[i].split(" ")
                                                        } else {
                                                            prepareTrade = traderContent[i]
                                                        }
                                                    }

                                                    for (i = 0; i < trader.inventory.length; i++) {
                                                        if (typeof (prepareTrade) == "object") {
                                                            for (j = 0; j < prepareTrade.length; j++) {
                                                                if (trader.inventory[i] == prepareTrade[j].trim() && !(traderCodes.includes(trader.inventory[i]))) {
                                                                    traderCodes.push(trader.inventory[i])
                                                                }
                                                            }
                                                        } else {
                                                            if (prepareTrade == trader.inventory[i] && !(traderCodes.includes(trader.inventory[i]))) {
                                                                traderCodes.push(trader.inventory[i])
                                                            }
                                                        }
                                                    }

                                                    // CARDS: Received the codes that match codes within the trader's inventory and finds the corresponding
                                                    // cards. A formatted list is created with the information of each card. The overall card information is also 
                                                    // stored as a variable "traderCards"
                                                    if (traderCodes.length != 0) {
                                                        var cards = await claimedCards.find({ $and: [{ owner: trader.userID }, { code: { $in: traderCodes } }] })
                                                        for (i = 0; i < cards.length; i++) {
                                                            traderCards.push(cards[i])
                                                            if (cards[i].name == "Group") {
                                                                traderList.push("<:cards:900131721855516743> `" + cards[i].code + "` " + cards[i].stars + " **#" + cards[i].issue + " " + cards[i].group + "**\n")

                                                            } else {
                                                                traderList.push("<:cards:900131721855516743> `" + cards[i].code + "` " + cards[i].stars + " **#" + cards[i].issue + " " + cards[i].group + "** " + cards[i].name + "\n")
                                                            }
                                                        }
                                                    }

                                                } else if (message.author.id == coTrader.userID) {
                                                    // COTRADER: Collects all the messages from the co-trader. If any of the messages 
                                                    // contain valid card codes that can be found within the inventory of the player,
                                                    // then they are saved and displayed within the embed.
                                                    const coTraderContent = []
                                                    coTraderContent.push(message.content)
                                                    var prepareCoTrade;
                                                    const coTraderCodes = []

                                                    // PREPARE THE COTRADER'S CARDS: If the co-trader has messaged, 
                                                    for (i = 0; i < coTraderContent.length; i++) {
                                                        if (coTraderContent[i].includes(",")) {
                                                            prepareCoTrade = coTraderContent[i].split(",")
                                                        } else if (coTraderContent[i].includes(" ")) {
                                                            prepareCoTrade = coTraderContent[i].split(" ")
                                                        } else {
                                                            prepareCoTrade = coTraderContent[i]
                                                        }
                                                    }

                                                    for (i = 0; i < coTrader.inventory.length; i++) {
                                                        if (typeof (prepareCoTrade) == "object") {
                                                            for (j = 0; j < prepareCoTrade.length; j++) {
                                                                if (coTrader.inventory[i] == prepareCoTrade[j].trim() && !(coTraderCodes.includes(coTrader.inventory[i]))) {
                                                                    coTraderCodes.push(coTrader.inventory[i])
                                                                }
                                                            }
                                                        } else {
                                                            if (prepareCoTrade == coTrader.inventory[i] && !(coTraderCodes.includes(coTrader.inventory[i]))) {
                                                                coTraderCodes.push(coTrader.inventory[i])
                                                            }
                                                        }
                                                    }

                                                    // CARDS: Received the codes that match codes within the coTrader's inventory and finds the corresponding
                                                    // cards. A formatted list is created with the information of each card. The overall card information is also 
                                                    // stored as a variable "coTraderCards"
                                                    if (coTraderCodes.length != 0) {
                                                        var cards = await claimedCards.find({ $and: [{ owner: coTrader.userID }, { code: { $in: coTraderCodes } }] })
                                                        for (i = 0; i < cards.length; i++) {
                                                            coTraderCards.push(cards[i])
                                                            if (cards[i].name == "Group") {
                                                                coTraderList.push("<:cards:900131721855516743> `" + cards[i].code + "` " + cards[i].stars + " **#" + cards[i].issue + " " + cards[i].group + "**\n")

                                                            } else {
                                                                coTraderList.push("<:cards:900131721855516743> `" + cards[i].code + "` " + cards[i].stars + " **#" + cards[i].issue + " " + cards[i].group + "** " + cards[i].name + "\n")
                                                            }
                                                        }
                                                    }
                                                }

                                                // TRADER MESSAGED VALID CARDS: If the trader had messaged valid cards, they will pop up in real-time
                                                // in the embed. The messageCards variable will also be assigned true. 
                                                if (traderCards.length != 0 && coTraderCards.length == 0) {
                                                    message.channel.getMessage(messageID)
                                                        .then(message => {
                                                            tradeInProgress.setDescription(`<@${trader.userID}> is currently trading with <@${coTrader.userID}>\n\n**${initiator.username}#${initiator.discriminator}**\n` + traderList.toString().replace(/,/g, ""))
                                                            message.edit({ embed: tradeInProgress })
                                                            messagedCards = true
                                                        })
                                                    // COTRADER MESSAGED VALID CARDS: If the co-trader had messaged valid cards, they will pop up in real-time
                                                    // in the embed. The messageCards variable will also be assigned true. 
                                                } else if (traderCards.length == 0 && coTraderCards.length != 0) {
                                                    message.channel.getMessage(messageID)
                                                        .then(message => {
                                                            tradeInProgress.setDescription(`<@${trader.userID}> is currently trading with <@${coTrader.userID}>\n\n**${receiverName}#${receiverDiscriminator}**\n` + coTraderList.toString().replace(/,/g, ""))
                                                            message.edit({ embed: tradeInProgress })
                                                            messagedCards = true
                                                        })
                                                    // TRADER AND COTRADER MESSAGED VALID CARDS: If the trader and cotrader had messaged valid cards, they will pop up in real-time
                                                    // in the embed. The messageCards variable will also be assigned true. 
                                                } else if (traderCards.length != 0 && coTraderCards.length != 0) {
                                                    messageCards = true
                                                    collector.stop()
                                                    message.channel.getMessage(messageID)
                                                        .then(message => {
                                                            tradeInProgress.setDescription(`<@${trader.userID}> is currently trading with <@${coTrader.userID}>\n\n**${initiator.username}#${initiator.discriminator}**\n` + traderList.toString().replace(/,/g, "") + `\n**${receiverName}#${receiverDiscriminator}**\n` + coTraderList.toString().replace(/,/g, ""))
                                                            message.edit({ embed: tradeInProgress })
                                                            const finalReactions = []
                                                            messagedCards = true
                                                            

                                                            client.on("interactionCreate", async (interaction) => {
                                                                  if (interaction.data.custom_id == "first_button2" && interaction.message.id == message.id) {
                                                                    await interaction.deferUpdate()
                                                                    finalReactions.push(interaction.member.id); // Adds the reactors of the "x" emoji to the array
                                                                    // TRADER REACTION:
                                                                    if (interaction.member.id != message.author.id && finalReactions.includes(coTrader.userID) && finalReactions.includes(trader.userID)) {

                                                                        // TRADER CARDS: Cycles through all of the cards given from the trader. The co-trader will be
                                                                        // assigned as the new owner of the cards. The cards are also restored back to their default form
                                                                        // except for cosmetics, hues, and frames.
                                                                        for (i = 0; i < traderCards.length; i++) {
                                                                            // COTRADER: Pushes all of the the cards provided by the trader into 
                                                                            // the co-trader's inventory. The number of cards they received from trading
                                                                            // as well as their overall number of cards will be updated.
                                                                            coTrader.inventory.push(traderCards[i].code)
                                                                            coTrader.tradeReceived += 1
                                                                            coTrader.numCards += 1

                                                                            traderCards[i].traded = true
                                                                            traderCards[i].timesTraded += 1
                                                                            traderCards[i].labels = []
                                                                            traderCards[i].owner.push(coTrader.userID)
                                                                            traderCards[i].save()

                                                                            // TRADER: All the traded cards by the trader will now be removed from their inventory.
                                                                            // Quantitative information regarding the number of cards traded and the number of overall
                                                                            // cards will be updated.
                                                                            var cardIndex = trader.inventory.indexOf(traderCards[i].code)
                                                                            trader.inventory.splice(cardIndex, 1)
                                                                            trader.traded += 1
                                                                            trader.numCards -= 1
                                                                        }


                                                                        // COTRADER CARDS: Cycles through all of the cards given from the co-trader. The co-trader will be
                                                                        // assigned as the new owner of the cards. The cards are also restored back to their default form
                                                                        // except for cosmetics, hues, and frames.
                                                                        for (i = 0; i < coTraderCards.length; i++) {
                                                                            // TRADER: Pushes all of the the cards provided by the co-trader into 
                                                                            // the trader's inventory. The number of cards they received from trading
                                                                            // as well as their overall number of cards will be updated.
                                                                            trader.inventory.push(coTraderCards[i].code)
                                                                            trader.tradeReceived += 1
                                                                            trader.numCards += 1

                                                                            coTraderCards[i].traded = true
                                                                            coTraderCards[i].timesTraded += 1
                                                                            coTraderCards[i].labels = []
                                                                            coTraderCards[i].owner.push(trader.userID)
                                                                            coTraderCards[i].save()

                                                                            // COTRADER: All the traded cards by the co-trader will now be removed from their inventory.
                                                                            // Quantitative information regarding the number of cards traded and the number of overall
                                                                            // cards will be updated.
                                                                            var cardIndex = coTrader.inventory.indexOf(coTraderCards[i].code)
                                                                            coTrader.inventory.splice(cardIndex, 1)
                                                                            coTrader.traded += 1
                                                                            coTrader.numCards -= 1

                                                                        }

                                                                        trader.tradeCooldown = 0
                                                                        coTrader.tradeCooldown = 0
                                                                        trader.save()
                                                                        coTrader.save()

                                                                        tradeInProgress.setTitle("**Trade Successful**")
                                                                        tradeInProgress.setDescription(`<@${trader.userID}> has completed the trade with <@${coTrader.userID}>\n\n**${initiator.username}#${initiator.discriminator}**\n` + coTraderList.toString().replace(/,/g, "") + `\n**${receiverName}#${receiverDiscriminator}**\n` + traderList.toString().replace(/,/g, ""))
                                                                        tradeInProgress.setColor("#9370DB")
                                                                        tradeInProgress.setAuthor(`${initiator.username}#${initiator.discriminator}`, initiator.avatarURL, initiator.avatarURL)
                                                                        tradeInProgress.setFooter(`${receiverName}#${receiverDiscriminator} | Finished Trading`, receiverAvatar, receiverAvatar)
                                                                        message.edit({ embed: tradeInProgress , components: []})
                                                                        collection.stop()

                                                                    }
                                                                }
                                                            })
                                                        })
                                                }

                                            })

                                            const cancelReactions = []
                                            message.channel.getMessage(messageID)
                                                .then(message => {
                                                    const reactor = new ReactionHandler.continuousReactionStream(
                                                        message,
                                                        (userID) => userID !== message.author.id,
                                                        false,
                                                        // In case other players try to react, it will allot four reactions
                                                        { maxMatches: 5, time: 60000 }
                                                    );
                                                    client.on("interactionCreate", async (interaction) => {
                                                        if (interaction.data.custom_id == "second_button2" && interaction.message.id == message.id) {
                                                            await interaction.deferUpdate()
                                                            cancelReactions.push(interaction.member.id);

                                                            if (cancelReactions.includes(coTrader.userID) || cancelReactions.includes(trader.userID)) {
                                                                tradeInProgress.setTitle("**Trade Canceled**")
                                                                tradeInProgress.setDescription(`The trade between <@${trader.userID}> and <@${coTrader.userID}> has been canceled`)
                                                                tradeInProgress.setColor("#ff4d6d")
                                                                if (cancelReactions.includes(trader.userID)) {
                                                                    tradeInProgress.setFooter(`${initiator.username}#${initiator.discriminator} | Canceled Trade`, initiator.avatarURL, initiator.avatarURL)
                                                                } else if (cancelReactions.includes(trader.userID)) {
                                                                    tradeInProgress.setFooter(`${receiverName}#${receiverDiscriminator} | Canceled Trade`, receiverAvatar, receiverAvatar)
                                                                }
                                                                message.edit({ embed: tradeInProgress , components: []})

                                                                trader.tradeCooldown = 0
                                                                coTrader.tradeCooldown = 0
                                                                trader.save()
                                                                coTrader.save()
                                                                if (messagedCards) {
                                                                    collector.stop()
                                                                } else {
                                                                    collector.stop()
                                                                }
                                                            }

                                                        }

                                                    })

                                                })
                                        }



                                          } else if (interaction.data.custom_id == "second_button1" && interaction.message.id == message.id) {
                                            await interaction.deferUpdate()
                                            traderReaction.push(interaction.member.id); // Adds the reactors of the "x" emoji to the array
                                         // TRADER AND COTRADER REACTION: One of either the trader or co-trader must react with the
                                        // 'x' in order for the 
                                        if (traderReaction.includes(coTrader.userID) || traderReaction.includes(trader.userID)) {
                                            const cancelTrade = new Eris.RichEmbed()
                                                .setTitle("**Trade Canceled**")
                                                .setDescription(`The trade between <@${trader.userID}> and <@${coTrader.userID}> has been canceled`)
                                                .setColor("#ff4d6d")
                                            if (traderReaction.includes(trader.userID)) {
                                                cancelTrade.setFooter(`${initiator.username}#${initiator.discriminator} | Canceled Trade`, initiator.avatarURL, initiator.avatarURL)
                                            } else if (traderReaction.includes(coTrader.userID)) {
                                                cancelTrade.setFooter(`${receiverName}#${receiverDiscriminator} | Canceled Trade`, receiverAvatar, receiverAvatar)
                                            }
                                            message.edit({ embed: cancelTrade , components: []})

                                            trader.tradeCooldown = 0
                                            coTrader.tradeCooldown = 0
                                            trader.save()
                                            coTrader.save()
                                        }
                                          } 
                                        }
                                  
                                      
                                     
                                })
                            })
                    } else {
                        // TRADER COOLDOWNS: If a trader or co-trader is found to be on cooldown, they will be prompted with a message that reflects the 
                        // current open trade sessions or requests.  
                        if (await tradeCooldown(traderCooldown) || await tradeCooldown(coTraderCooldown)) {
                            if (await tradeCooldown(traderCooldown) && await tradeCooldown(coTraderCooldown)) {
                                message.channel.createMessage(`<:exclaim:906289233814241290> <@${initiator.id}>, you and your selected co-trader, ${receiverName}#${receiverDiscriminator}, currently have pending trade requests/sessions. Try again after completing or canceling the other trade sessions, or letting the trade sessions time out.`)
                            } else if (!await tradeCooldown(traderCooldown) && await tradeCooldown(coTraderCooldown)) {
                                message.channel.createMessage(`<:exclaim:906289233814241290> <@${initiator.id}>, your selected co-trader, ${receiverName}#${receiverDiscriminator}, currently has a pending trade request or session. Try again after their trade session has been completed, canceled, or timed out.`)
                            } else if (await tradeCooldown(traderCooldown) && !await tradeCooldown(coTraderCooldown)) {
                                message.channel.createMessage(`<:exclaim:906289233814241290> <@${initiator.id}>, you are currently in another trade request or session. Try again later after the other trade session has been completed, canceled, or timed out.`)

                            }
                        }

                    }

                } else {
                    if (coTrader == null || coTrader == undefined && trader != null && trader != undefined) {
                        const noPlayer = new Eris.RichEmbed()
                            .setTitle("")
                            .setDescription("<:exclaim:906289233814241290> No player with the given information can be traded with or found within the Icon playerbase")
                            .setColor("#9370DB")
                            .setFooter(`${initiator.username}#${initiator.discriminator} | Initiating Trade`, initiator.avatarURL, initiator.avatarURL)
                        message.channel.createMessage({ embed: noPlayer })

                    } else if (trader == null || trader == undefined && coTrader != null && coTrader != undefined) {
                        const noPlayer = new Eris.RichEmbed()
                            .setTitle("")
                            .setDescription("<:exclaim:906289233814241290> There are no cards within your inventory. Accumulate cards first through methods like dropping or claiming.")
                            .setColor("#9370DB")
                            .setFooter(`${initiator.username}#${initiator.discriminator} | Initiating Trade`, initiator.avatarURL, initiator.avatarURL)
                        message.channel.createMessage({ embed: noPlayer })
                    } else if ((trader == null || trader == undefined) && (coTrader == null || coTrader != undefined)) {
                        const noPlayer = new Eris.RichEmbed()
                            .setTitle("")
                            .setDescription("<:exclaim:906289233814241290> No player with the given information can be traded with or found within the Icon playerbase")
                            .setColor("#9370DB")
                            .setFooter(`${initiator.username}#${initiator.discriminator} | Initiating Trade`, initiator.avatarURL, initiator.avatarURL)
                        message.channel.createMessage({ embed: noPlayer })
                    }
                }
            }
        }

    }
}

