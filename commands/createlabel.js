/*---------------------------------------LOADING IN THE PACKAGES---------------------------------------*/
// MODELS: Gets the necessary data models from the database to complete the label process
const claimedCards = require('../models/claimedCards.js');
const user = require('../models/user.js');


// REACTION HANDLER: Allows the player to interact with the embeds
const ReactionHandler = require('eris-reactions');
const { continuousReactionStream } = require('eris-reactions');

/*----------------------------------------CREATE LABEL COMMAND: BEGINNING LABEL PROCESS----------------------------------------------*/
module.exports = {
    name: 'createlabel',
    description: "Allows users to create labels for their label collection",
    aliases: ["create", "cl", "createlabel"],
    async execute(client, message, args, Eris) {

        const member = message.member.user;
        const creator = await user.findOne({ userID: member.id })

        const content = args

        // CONTENT LENGTH: Checks whether the message arguments are greater than 2. This ensures that a player
        // would have to include an emoji and a label name of at least one word. If not, it prompts the player
        // with a the proper format to use.
        if (content.length >= 2) {

            // EMOJI: If the first argument of the message content contains an emoji, the player will be able
            // to more on with the labeling process. Otherwise, they will be provided a prompt that the first
            // argument needs to be a valid emoji.
            if ((/\p{Extended_Pictographic}/u.test(content[0]) == true)) {

                const label = content.slice(1, content.length) // Stores the rest of the arguments after the emoji
                const emoji = content[0] // Stores the valid emoji
                var labelContent = "" // Saves the label name inputed

                for (i = 0; i < label.length; i++) {
                    labelContent += label[i]
                    if (i < label.length - 1) {
                        labelContent += " "
                    }
                }

                var emojiExists = false // Stores whether a label with the provide emoji exists
                var nameExists = false // Stores whether a label with the provide name exists
                var labelExists = false // Stores whether a label with the same emoji and label name exists

                // CHECK ON EXISTING LABELS: Ensures the there are no duplicate labels, labels with the same emojis,
                // or labels with the same names.
                for (i = 0; i < creator.labels.length; i++) {
                    if (creator.labels[i].toLowerCase() == `${emoji.toLowerCase()} ${labelContent.toLowerCase()}`) {
                        labelExists = true
                    } else if (creator.labels[i].toLowerCase().includes(labelContent.toLowerCase())) {
                        nameExists = true
                    } else if (creator.labels[i].toLowerCase().includes(emoji.toLowerCase())) {
                        emojiExists = true
                    }
                }

                // CONTINUE PROCESS WITH LABEL CHECK: Allows the create label process to continue if there are no duplicate labels,
                // labels with the same emojis, or labels with the same label names.
                if (!labelExists && !nameExists && !emojiExists) {
                    // LABEL WORD LENGTH: Labels are limited to three words. If this is exceeded, the player will 
                    // be provided with a prompt.
                    if (label.length <= 3) {

                        // LABEL CHARACTER LENGTH: Labels are limited to 20 characters. If this is exceeded, the player will 
                        // be provided with a prompt.
                        if (labelContent.length <= 20) {
                            const createdLabel = `${emoji} ${labelContent}` // Stores the label information being created
                            // BOOSTER PERK: If the messaging member is a booster of the official Icon server, they will
                            // be given the opportunity to create nine labels instead of the default eight.
                            if (message.member.roles.includes("870535306745618454")) {
                                if (creator.labels.length < 9) {
                                    creator.labels.push(createdLabel)
                                    creator.save()
                                    const successfulLabel = new Eris.RichEmbed()
                                        .setTitle("")
                                        .setDescription(`A label titled ${emoji} **${labelContent}** has been added to your label collection`)
                                        .setColor("#9370DB")
                                        .setFooter(`${member.username}#${member.discriminator} | Created Label`, member.avatarURL, member.avatarURL)
                                    message.channel.createMessage({ embed: successfulLabel })
                                } else {
                                    // LABEL LIMIT: If the player is attempting to add a tenth label, they will be given an error prompt
                                    const limitExceeded = new Eris.RichEmbed()
                                        .setTitle("")
                                        .setDescription(`<:exclaim:906289233814241290> There can only be nine labels within your label collection`)
                                        .setColor("#9370DB")
                                        .setFooter(`${member.username}#${member.discriminator} | Label Limit Exceed`, member.avatarURL, member.avatarURL)
                                    message.channel.createMessage({ embed: limitExceeded })
                                }
                            } else {
                                // DEFAULT LABELS: The default limit for labels is eight. Players may only have eight labels at a time.
                                // If the player has less than eight labels, they will be able to successfully create a new label.
                                if (creator.labels.length < 8) {
                                    creator.labels.push(createdLabel)
                                    creator.save()
                                    const successfulLabel = new Eris.RichEmbed()
                                        .setTitle("")
                                        .setDescription(`A label titled ${emoji} **${labelContent}** has been added to your label collection`)
                                        .setColor("#9370DB")
                                        .setFooter(`${member.username}#${member.discriminator} | Created Label`, member.avatarURL, member.avatarURL)
                                    message.channel.createMessage({ embed: successfulLabel })
                                } else {
                                     // LABEL LIMIT: If the player is attempting to add a ninth label, they will be given an error prompt
                                    const limitExceeded = new Eris.RichEmbed()
                                        .setTitle("")
                                        .setDescription(`<:exclaim:906289233814241290> There can only be eight labels within your label collection`)
                                        .setColor("#9370DB")
                                        .setFooter(`${member.username}#${member.discriminator} | Label Limit Exceed`, member.avatarURL, member.avatarURL)
                                    message.channel.createMessage({ embed: limitExceeded })
                                }
                            }

                        } else {
                            const limitExceeded = new Eris.RichEmbed()
                                .setTitle("")
                                .setDescription(`<:exclaim:906289233814241290> The label name must be limited to 20 characters`)
                                .setColor("#9370DB")
                                .setFooter(`${member.username}#${member.discriminator} | Label Characters Exceed`, member.avatarURL, member.avatarURL)
                            message.channel.createMessage({ embed: limitExceeded })
                        }
                    } else {
                        const limitExceeded = new Eris.RichEmbed()
                            .setTitle("")
                            .setDescription(`<:exclaim:906289233814241290> The label name must be limited to three words`)
                            .setColor("#9370DB")
                            .setFooter(`${member.username}#${member.discriminator} | Label Words Exceed`, member.avatarURL, member.avatarURL)
                        message.channel.createMessage({ embed: limitExceeded })
                    }
                } else {
                    if (labelExists) {
                        const invalidFormat = new Eris.RichEmbed()
                            .setTitle("")
                            .setDescription(`<:exclaim:906289233814241290> A label with the given information already exists`)
                            .setColor("#9370DB")
                            .setFooter(`${member.username}#${member.discriminator} | Duplicate Label`, member.avatarURL, member.avatarURL)
                        message.channel.createMessage({ embed: invalidFormat })
                    }

                    if (nameExists) {
                        const invalidFormat = new Eris.RichEmbed()
                            .setTitle("")
                            .setDescription(`<:exclaim:906289233814241290> A label with the selected label name already exists`)
                            .setColor("#9370DB")
                            .setFooter(`${member.username}#${member.discriminator} | Label Name Exists`, member.avatarURL, member.avatarURL)
                        message.channel.createMessage({ embed: invalidFormat })
                    }

                    if (emojiExists) {
                        const invalidFormat = new Eris.RichEmbed()
                            .setTitle("")
                            .setDescription(`<:exclaim:906289233814241290> A label with the selected emoji already exists`)
                            .setColor("#9370DB")
                            .setFooter(`${member.username}#${member.discriminator} | Emoji Exists`, member.avatarURL, member.avatarURL)
                        message.channel.createMessage({ embed: invalidFormat })
                    }

                }

            } else {
                const invalidEmoji = new Eris.RichEmbed()
                    .setTitle("")
                    .setDescription(`<:exclaim:906289233814241290> A valid emoji must be given at the beginning to create a label`)
                    .setColor("#9370DB")
                    .setFooter(`${member.username}#${member.discriminator} | Invalid Emoji`, member.avatarURL, member.avatarURL)
                message.channel.createMessage({ embed: invalidEmoji })
            }
        } else {
            const invalidFormat = new Eris.RichEmbed()
                .setTitle("")
                .setDescription(`<:exclaim:906289233814241290> An emoji followed by the name of the label must be given`)
                .setColor("#9370DB")
                .setFooter(`${member.username}#${member.discriminator} | Invalid Format`, member.avatarURL, member.avatarURL)
            message.channel.createMessage({ embed: invalidFormat })
        }

    }
}