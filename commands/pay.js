/*---------------------------------------LOADING IN THE PACKAGES-----------------------------------*/

// MODELS: Gets the necessary data models from the database to complete the burn process
const claimedCards = require('../models/claimedCards.js');
const user = require('../models/user.js');

// REACTION HANDLER: Allows the player to interact with the embeds
const ReactionHandler = require('eris-reactions');

/*-----------------------------------------PAY COMMAND: BEGIN PAY PROCESS-----------------------------*/
module.exports = {
    name: 'pay',
    description: "Gives players the opportunity to pay other players in opals or diamonds",
    aliases: [],
    async execute(client, message, args, Eris) {
        const member = message.member.user;
        const payer = await user.findOne({ userID: member.id })

        if (message.mentions.length >= 1 || message.mentions.length < 1 && args.length >= 1) {
            const search = args
            var player = "";
            var playerInfo;
            var playerName = ""
            var playerDiscriminator = ""
            var playerAvatar = ""

            if (message.mentions.length >= 1) {
                player = message.channel.guild.members.get(message.mentions[0].id).user.id
                playerInfo = message.channel.guild.members.get(message.mentions[0].id).user
                playerName =  message.channel.guild.members.get(message.mentions[0].id).user.username
                playerDiscriminator = message.channel.guild.members.get(message.mentions[0].id).user.discriminator
                playerAvatar = message.channel.guild.members.get(message.mentions[0].id).user.avatarURL
            } else {
                const checkPlayer = await user.findOne({ userID: search[0] })
                if (checkPlayer != null && checkPlayer != undefined) {
                    player = checkPlayer.userID
                    playerInfo = checkPlayer
                    playerName = checkPlayer.name
                    playerDiscriminator = checkPlayer.discriminator
                    playerAvatar = checkPlayer.avatar
                }
                const members = await message.guild.fetchMembers()
                for (i = 0; i < members.length; i++) {
                    if (members[i].id == search[0]) {
                        playerInfo = members[i]
                        playerName = members[i].username
                        playerDiscriminator = members[i].discriminator
                        playerAvatar = members[i].avatarURL
                    }
                }
            }

            if (player != "") {
                if (search[0] == player || search[0] == "<@!" + message.channel.guild.members.get(message.mentions[0].id).user.id + ">" || search[0] == "<@" + message.channel.guild.members.get(message.mentions[0].id).user.id + ">") {
                    search.shift()
                }
            }

            const receiver = await user.findOne({ userID: player })

            if (receiver != null && receiver != undefined) {

                if (search.length >= 1) {

                    const amount = Number(search[0])
                    var currency = ""
                    var currencyEmoji = ""

                    for (i = 0; i < search.length; i++) {
                        if (search[i] == "diamonds" || search[i] == "Diamonds" || search[i] == "diamond" || search[i] == "Diamond" || search[i] == "D" || search[i] == "d") {
                            currency = "diamonds"
                            currencyEmoji = "<:diamond:898641993511628800>"
                        } else if (search[i] == "opals" || search[i] == "Opals" || search[i] == "opal" || search[i] == "Opal" || search[i] == "O" || search[i] == "o") {
                            currency = "opals"
                            currencyEmoji = "<:opal:899430579831988275>"
                        }

                    }

                    if (currency != "") {

                        const payment = new Eris.RichEmbed()
                            .setTitle("")
                            .setDescription(`**Pay ${playerName}#${playerDiscriminator}?**\nAmount of **` + amount + '** ' + currencyEmoji + ' will be given')
                            .setColor("#33A7FF")
                            .setFooter(`${member.username}#${member.discriminator} | Paying ${playerName}#${playerDiscriminator}`, member.avatarURL, member.avatarURL)
                        message.channel.createMessage({ embed: payment })
                            .then(message => {
                                message.addReaction('💳');
                                message.addReaction('❌');

                                const reactionListener = new ReactionHandler.continuousReactionStream(
                                    message,
                                    (userID) => userID !== message.author.id,
                                    false,
                                    // In case other players try to react, it will allot four reactions
                                    { maxMatches: 4, time: 60000 }
                                );
                                reactionListener.on('reacted', (event) => {
                                    const payerReaction = []
                                    if (event.emoji.name == "❌") {
                                        payerReaction.push(event.userID)
                                        if (payerReaction.includes(payer.userID)) {
                                            const payment = new Eris.RichEmbed()
                                                .setTitle("**Payment Canceled**")
                                                .setDescription(`The payment process involving ${playerName}#${playerDiscriminator} has stopped`)
                                                .setColor("#ff4d6d")
                                                .setFooter(`${member.username}#${member.discriminator} | Payment canceled`, member.avatarURL, member.avatarURL)
                                            message.edit({ embed: payment })
                                            message.removeReactions('💳');
                                            message.removeReactions('❌');
                                        }
                                    }

                                    if (event.emoji.name == '💳') {
                                        payerReaction.push(event.userID)
                                        if (payerReaction.includes(payer.userID)) {
                                            if (payer[currency] >= amount) {
                                                payer[currency] -= amount
                                                receiver[currency] += amount

                                                payer.save()
                                                receiver.save()

                                                const payment = new Eris.RichEmbed()
                                                    .setTitle("**Payment Successful**")
                                                    .setDescription(`${playerName}#${playerDiscriminator} has received **` + amount + `** ` + currencyEmoji)
                                                    .setColor("#9370DB")
                                                    .setFooter(`${member.username}#${member.discriminator} | Payment Complete`, member.avatarURL, member.avatarURL)
                                                message.edit({ embed: payment })
                                                message.removeReactions('💳');
                                                message.removeReactions('❌');

                                            } else {
                                                if (currency == "diamonds") {
                                                    const insufficientDiamonds = new Eris.RichEmbed()
                                                        .setTitle("")
                                                        .setDescription(`<:exclaim:906289233814241290> Payment to ${playerName}#${playerDiscriminator} has failed due to insufficient diamonds`)
                                                        .setColor("#9370DB")
                                                        .setFooter(`${member.username}#${member.discriminator} | Insufficient Diamonds`, member.avatarURL, member.avatarURL)
                                                    message.edit({ embed: insufficientDiamonds })
                                                    message.removeReactions('💳');
                                                    message.removeReactions('❌');
                                                } else if (currency == "opals") {
                                                    const insufficientOpals = new Eris.RichEmbed()
                                                        .setTitle("")
                                                        .setDescription(`<:exclaim:906289233814241290> Payment to ${playerName}#${playerDiscriminator} has failed due to insufficient opals`)
                                                        .setColor("#9370DB")
                                                        .setFooter(`${member.username}#${member.discriminator} | Insufficient Opals`, member.avatarURL, member.avatarURL)
                                                    message.edit({ embed: insufficientOpals })
                                                    message.removeReactions('💳');
                                                    message.removeReactions('❌');
                                                }
                                            }
                                        }
                                    }
                                })
                            })
                    } else {
                        const wrongFormat = new Eris.RichEmbed()
                        .setTitle("")
                        .setDescription(`<:exclaim:906289233814241290> A currency must be provided in order for the payment process to be completed`)
                        .setColor("#9370DB")
                        .setFooter(`${member.username}#${member.discriminator} | Paying ${playerName}#${playerDiscriminator}`, member.avatarURL, member.avatarURL)
                    message.channel.createMessage({ embed: wrongFormat })
                    }
                } else {
                    const wrongFormat = new Eris.RichEmbed()
                        .setTitle("")
                        .setDescription(`<:exclaim:906289233814241290> Pay another player by providing both the amount and currency`)
                        .setColor("#9370DB")
                        .setFooter(`${member.username}#${member.discriminator} | Paying ${playerName}#${playerDiscriminator}`, member.avatarURL, member.avatarURL)
                    message.channel.createMessage({ embed: wrongFormat })
                }
            } else {
                const nonExistentPlayer = new Eris.RichEmbed()
                    .setTitle("")
                    .setDescription(`<:exclaim:906289233814241290> A player with the given information cannot be found within the Icon playerbase`)
                    .setColor("#9370DB")
                    .setFooter(`${member.username}#${member.discriminator} | Profile Does Not Exist`, member.avatarURL, member.avatarURL)
                message.channel.createMessage({ embed: nonExistentPlayer })
            }
        }
    }
}