const claimedCards = require('../models/claimedCards.js');

const { registerFont } = require('canvas');
const Canvas = require('canvas');

registerFont('./fonts/Prompt-Bold.ttf', { family: 'Prompt-Bold' })
registerFont('./fonts/Prompt-Medium.ttf', { family: 'Prompt-Medium' })
registerFont('./fonts/Prompt-Regular.ttf', { family: 'Prompt' })

module.exports = {
    name: 'cardinspect',
    description: "displays all of the dyes within the game",
    aliases: ["ci"],
    async execute(client, message, args, Eris) {

        if (message.member.roles.includes("873295232668688406") || message.member.roles.includes("873296833672273971") || message.member.roles("873304692002795530")) {
            if (args.length != 0) {

                const card = await claimedCards.findOne({ code: args[0] })

                if (card.length != 0) {

                    const canvas = Canvas.createCanvas(600, 900);
                    const context = canvas.getContext('2d');
                    const background = await Canvas.loadImage('transparent.png');
                    context.drawImage(background, 0, 0, canvas.width, canvas.height);


                    const idolCard = await Canvas.loadImage(card.mainImage);
                    context.drawImage(idolCard, 30, 75, 540, 657);


                    /* Frame: The frame of the card
                     */


                    const frame = await Canvas.loadImage('./img/cosmetics/frames/Default_Frame.png')
                    context.drawImage(frame, 0, 0, 600, 900);

                    var groupOne = ""
                    var groupName = ""
                    var idolName = ""

                    if (card.name == "Group") {

                        context.font = '45px "Prompt-Bold"';
                        context.textAlign = "right";
                        context.fillStyle = "#FFFFFF";
                        let groupName = (card.group).toUpperCase();
                        context.fillText(groupName, 566, 810);

                        context.font = '26px "Prompt-Medium"';
                        context.textAlign = "right";
                        context.fillStyle = "#FFFFFF";
                        let groupOne = (card.name).toUpperCase();
                        context.fillText(groupOne, 566, 838);

                    } else {

                        context.font = '45px "Prompt-Bold"';
                        context.textAlign = "right";
                        context.fillStyle = "#FFFFFF";
                        idolName = (card.name).toUpperCase();
                        context.fillText(idolName, 566, 810);

                        context.font = '26px "Prompt-Medium"';
                        context.textAlign = "right";
                        context.fillStyle = "#FFFFFF";
                        groupName = (card.group).toUpperCase();
                        context.fillText(groupName, 566, 838);

                    }
                    context.font = '30px "Prompt"';
                    context.textAlign = "left";
                    context.fillStyle = "#FFFFFF";
                    let issueNum = ("Issue #" + card.issue).toUpperCase();
                    context.fillText(issueNum, 35, 50);

                    const barcode = await Canvas.loadImage('./img/cosmetics/misc/Barcode.png')
                    context.drawImage(barcode, 477, 20, 90, 40);


                    const icon = await Canvas.loadImage(card.icon);
                    context.drawImage(icon, 34, 747.5, 138, 121);

                    const buffer = canvas.toBuffer();
                    const attachment = { file: buffer, name: "cardinspect.png" };

                    var pages = [];
                    let pageCount = 0;

                    var cardOwners = []

                    for (i = 0; i < card.owner.length; i++) {

                        const getOwners = message.channel.guild.members.get(card.owner[i])
                        cardOwners.push("" + getOwners.username + "#" + getOwners.discriminator + " | " + getOwners.id + "\n")

                        if (i % 6 === 0) {
                            pageCount += 1;
                            pages.push(pageCount)
                        }

                    }


                    cardOwners = cardOwners.reverse()

                    var page = 1

                    var owners = cardOwners.slice((page) * 6 - 6, (page) * 6);

                    var cardPhrase = ""

                    if (cardOwners.length == 1) {
                        cardPhrase = "Owner"
                    } else {
                        cardPhrase = "Owners"
                    }

                    if (card.name == "Group") {

                        const inspect = new Eris.RichEmbed()
                            .setTitle('`' + card.code + '` ' + card.group.toUpperCase())
                            .setColor(0x33A7FF)
                            .setDescription("**BASIC CARD INFORMATION**\n**Name**\n" + card.name + "\n**Group**\n" + card.group + "\n**Era**\n" + card.era + "\n**Condition**\n" + card.stars + "(" + card.nameCondition + ") \n**Issue**\n#" + card.issue + "\n**Worth**\n" + card.worth + " Opals\n\n**INTERACTIONS**\n**Times Traded**\n" + card.timesTraded + "\n**Times Gifted**\n" + card.timesGifted + "\n**Times Burned**\n" + card.timesBurned + "\n**Times Upgraded**\n" + card.timesUpgraded + "\n\n**OWNERS**\n*" + cardOwners.length + " Total " + cardPhrase + " ➛ Ordered from Current to First Owner*\n" + cardOwners.slice((page) * 6 - 6, (page) * 6).toString().replace(/,/g, ""))
                            .setAuthor(`${message.member.user.username}#${message.member.user.discriminator} | Inspecting Card`, message.member.user.avatarURL, message.member.user.avatarURL)
                            .setImage('attachment://cardinspect.png')
                        return message.channel.createMessage({ embed: inspect }, attachment)

                    } else {

                        if (cardOwners.length < 7) {
                            const embed = new Eris.RichEmbed()
                                .setTitle('`' + card.code + '` ' + card.name.toUpperCase())
                                .setDescription("**BASIC CARD INFORMATION**\n**Name**\n" + card.name + "\n**Group**\n" + card.group + "\n**Era**\n" + card.era + "\n**Condition**\n" + card.stars + "(" + card.nameCondition + ") \n**Issue**\n#" + card.issue + "\n**Worth**\n" + card.worth + " Opals\n\n**INTERACTIONS**\n**Times Traded**\n" + card.timesTraded + "\n**Times Gifted**\n" + card.timesGifted + "\n**Times Burned**\n" + card.timesBurned + "\n**Times Upgraded**\n" + card.timesUpgraded + "\n\n**OWNERS**\n*" + cardOwners.length + " Total " + cardPhrase + " ➛ Ordered from Current to First Owner*\n" + cardOwners.slice((page) * 6 - 6, (page) * 6).toString().replace(/,/g, ""))
                                .setColor(0x33A7FF)
                                .setAuthor(`${message.member.user.username}#${message.member.user.discriminator} | Inspecting Card`, message.member.user.avatarURL, message.member.user.avatarURL)
                                .setImage('attachment://cardinspect.png')
                            return message.channel.createMessage({ embed: embed }, attachment)
                        } else if (cardOwners.length >= 7) {
                            const embed = new Eris.RichEmbed()
                                .setTitle('`' + card.code + '` ' + card.name.toUpperCase())
                                .setDescription("**BASIC CARD INFORMATION**\n**Name**\n" + card.name + "\n**Group**\n" + card.group + "\n**Era**\n" + card.era + "\n**Condition**\n" + card.stars + "(" + card.nameCondition + ") \n**Issue**\n#" + card.issue + "\n**Worth**\n" + card.worth + " Opals\n\n**INTERACTIONS**\n**Times Traded**\n" + card.timesTraded + "\n**Times Gifted**\n" + card.timesGifted + "\n**Times Burned**\n" + card.timesBurned + "\n**Times Upgraded**\n" + card.timesUpgraded + "\n\n**OWNERS**\n*" + cardOwners.length + " Total " + cardPhrase + " ➛ Ordered from Current to First Owner*\n" + cardOwners.slice((page) * 6 - 6, (page) * 6).toString().replace(/,/g, ""))
                                .setColor(0x33A7FF)
                                .setAuthor(`${message.member.user.username}#${message.member.user.discriminator} | Inspecting Card`, message.member.user.avatarURL, message.member.user.avatarURL)
                                .setImage('attachment://cardinspect.png')
                            message.channel.createMessage({ embed: embed })
                                .then(function (message) {
                                    message.addReaction('⏪');
                                    message.addReaction('◀️');
                                    message.addReaction('▶️')
                                    message.addReaction('⏩');
                                })

                            client.once('messageCreate', async (message) => {

                                // This will continuously listen for 100 incoming reactions over the course of 15 minutes
                                const reactionListener = new ReactionHandler.continuousReactionStream(
                                    message,
                                    (userID) => userID != message.author.id,
                                    false,
                                    { max: 100, time: 60000 }
                                );

                                reactionListener.on('reacted', (event) => {

                                    if (event.emoji.name === "⏪") {
                                        if (page === 1) return;
                                        page = 1;
                                        embed.setTitle('`' + card.code + '` ' + card.name.toUpperCase())
                                        embed.setDescription("**BASIC CARD INFORMATION**\n**Name**\n" + card.name + "\n**Group**\n" + card.group + "\n**Era**\n" + card.era + "\n**Condition**\n" + card.stars + "(" + card.nameCondition + ") \n**Issue**\n#" + card.issue + "\n**Worth**\n" + card.worth + " Opals\n\n**INTERACTIONS**\n**Times Traded**\n" + card.timesTraded + "\n**Times Gifted**\n" + card.timesGifted + "\n**Times Burned**\n" + card.timesBurned + "\n**Times Upgraded**\n" + card.timesUpgraded + "\n\n**OWNERS**\n*" + cardOwners.length + " Total " + cardPhrase + " ➛ Ordered from Current to First Owner*\n" + cardOwners.slice((page) * 6 - 6, (page) * 6).toString().replace(/,/g, ""))
                                        embed.setColor(0x33A7FF)
                                        embed.setAuthor(`${message.member.user.username}#${message.member.user.discriminator} | Inspecting Card`, message.member.user.avatarURL, message.member.user.avatarURL)
                                        embed.setImage('attachment://cardinspect.png')
                                        message.edit({ embed: embed })

                                    }

                                    if (event.emoji.name === "◀️") {

                                        if (page === 1) return;
                                        page--;
                                        embed.setTitle('`' + card.code + '` ' + card.name.toUpperCase())
                                        embed.setDescription("**BASIC CARD INFORMATION**\n**Name**\n" + card.name + "\n**Group**\n" + card.group + "\n**Era**\n" + card.era + "\n**Condition**\n" + card.stars + "(" + card.nameCondition + ") \n**Issue**\n#" + card.issue + "\n**Worth**\n" + card.worth + " Opals\n\n**INTERACTIONS**\n**Times Traded**\n" + card.timesTraded + "\n**Times Gifted**\n" + card.timesGifted + "\n**Times Burned**\n" + card.timesBurned + "\n**Times Upgraded**\n" + card.timesUpgraded + "\n\n**OWNERS**\n*" + cardOwners.length + " Total " + cardPhrase + " ➛ Ordered from Current to First Owner*\n" + cardOwners.slice((page) * 6 - 6, (page) * 6).toString().replace(/,/g, ""))
                                        embed.setColor(0x33A7FF)
                                        embed.setAuthor(`${message.member.user.username}#${message.member.user.discriminator} | Inspecting Card`, message.member.user.avatarURL, message.member.user.avatarURL)
                                        embed.setImage('attachment://cardinspect.png')
                                        message.edit({ embed: embed })
                                    }

                                    if (event.emoji.name === "▶️") {
                                        if (page === pages.length) return;
                                        page++;
                                        embed.setTitle('`' + card.code + '` ' + card.name.toUpperCase())
                                        embed.setDescription("**BASIC CARD INFORMATION**\n**Name**\n" + card.name + "\n**Group**\n" + card.group + "\n**Era**\n" + card.era + "\n**Condition**\n" + card.stars + "(" + card.nameCondition + ") \n**Issue**\n#" + card.issue + "\n**Worth**\n" + card.worth + " Opals\n\n**INTERACTIONS**\n**Times Traded**\n" + card.timesTraded + "\n**Times Gifted**\n" + card.timesGifted + "\n**Times Burned**\n" + card.timesBurned + "\n**Times Upgraded**\n" + card.timesUpgraded + "\n\n**OWNERS**\n*" + cardOwners.length + " Total " + cardPhrase + " ➛ Ordered from Current to First Owner*\n" + cardOwners.slice((page) * 6 - 6, (page) * 6).toString().replace(/,/g, ""))
                                        embed.setColor(0x33A7FF)
                                        embed.setAuthor(`${message.member.user.username}#${message.member.user.discriminator} | Inspecting Card`, message.member.user.avatarURL, message.member.user.avatarURL)
                                        embed.setImage('attachment://cardinspect.png')
                                        message.edit({ embed: embed })

                                    }

                                    if (event.emoji.name === "⏩") {
                                        if (page === pages.length) return;
                                        page = pages.length;
                                        embed.setTitle('`' + card.code + '` ' + card.name.toUpperCase())
                                        embed.setDescription("**BASIC CARD INFORMATION**\n**Name**\n" + card.name + "\n**Group**\n" + card.group + "\n**Era**\n" + card.era + "\n**Condition**\n" + card.stars + "(" + card.nameCondition + ") \n**Issue**\n#" + card.issue + "\n**Worth**\n" + card.worth + " Opals\n\n**INTERACTIONS**\n**Times Traded**\n" + card.timesTraded + "\n**Times Gifted**\n" + card.timesGifted + "\n**Times Burned**\n" + card.timesBurned + "\n**Times Upgraded**\n" + card.timesUpgraded + "\n\n**OWNERS**\n*" + cardOwners.length + " Total " + cardPhrase + " ➛ Ordered from Current to First Owner*\n" + cardOwners.slice((page) * 6 - 6, (page) * 6).toString().replace(/,/g, ""))
                                        embed.setColor(0x33A7FF)
                                        embed.setAuthor(`${message.member.user.username}#${message.member.user.discriminator} | Inspecting Card`, message.member.user.avatarURL, message.member.user.avatarURL)
                                        embed.setImage('attachment://cardinspect.png')
                                        message.edit({ embed: embed })

                                    }
                                })
                            })
                        }
                    }

                } else {
                    const embed = new Eris.RichEmbed()
                    embed.setColor("#9370DB")
                    embed.setDescription(`<:exclaim:906289233814241290> This card does not exist`)
                    .setFooter(`${message.member.user.username}#${message.member.user.username.discriminator} | Inspecting Card`, member.avatarURL, member.avatarURL)
                    message.channel.createMessage({ embed: embed })

                }

            }
        }

    }
}