/*---------------------------------------LOADING IN THE PACKAGES---------------------------------------*/

// EMBED REACTION HANDLER: Allows the player to interact with the embeds
const ReactionHandler = require('eris-reactions');
const { helpCommands } = require("../functions/help/helpCommands.js")

/*---------------------------------HELP COMMANDS: BEGINNING THE HELP PROCESS----------------------*/

module.exports = {
    name: 'help',
    description: "Showcases a guide of commands for players",
    aliases: [""],
    async execute(client, message, args, Eris) {

        const viewer = message.member.user;
        if (args != undefined && args != null && args.length != 0) {

            const commands = args
            var commandNames = ""

            for (i = 0; i < commands.length; i++) {
                commandNames += commands[i]
                if (i < commands.length - 1) {
                    commandNames += " "
                }
            }

            commandNames = commandNames.toLowerCase()

            const chosenCommand = await helpCommands(commandNames)

            if (typeof (chosenCommand) != "undefined") {

                const help = new Eris.RichEmbed()
                    .setTitle('<:search:905765062462046238> **OFFICIAL ICON GUIDE**')
                    .setDescription("All things Icon\n\n" + chosenCommand)
                    .setColor("#33A7FF")
                    .setAuthor(`${client.user.username}`, client.user.avatarURL, client.user.avatarURL)
                    .setFooter(`${message.member.user.username}#${message.member.user.discriminator} | ICON EST. 2021`, message.member.user.avatarURL, message.member.avatarURL)
                message.channel.createMessage({ embed: help });
            }


        } else {

            const commands = ["<:slideshow:908972644102201364> **The Basics**\n`help` | `drop` | `cooldown`\n\n",
                "<:slideshow:908972644102201364> **Cards**\n`view` | `inventory` | `lookup`\n\n",
                "<:slideshow:908972644102201364> **Currency**\n`daily` | `balance` | `pay` | `buy`\n\n",
                "<:slideshow:908972644102201364> **Card Interaction**\n`trade` | `gift` | `burn` | `upgrade`\n\n",
                "<:slideshow:908972644102201364> **Labels**\n`labels` | `createlabel` | `addlabel` | `removelabel` | `deleteLabel`\n\n",
                "<:slideshow:908972644102201364> **Profile**\n`profile` | `description` | `collects` | `color` | `badge` | `brand`\n\n",
                "<:slideshow:908972644102201364> **Shop**\n`shop` | `cardmarket`\n\n",
                "<:slideshow:908972644102201364> **Cosmetics**\n`hues` | `viewhue` | `applyhue` | `applyframe`\n\n"]

            var pageCount = 0
            var page = 1
            const pages = []

            for (i = 0; i < commands.length; i++) {
                if (i % 5 == 0) {
                    pageCount += 1;
                    pages.push(pageCount)
                }
            }

            const help = new Eris.RichEmbed()
                .setTitle("<:search:905765062462046238> **OFFICIAL ICON GUIDE**")
                .setDescription("All Things Icon\n\n**Welcome to Icon!** A K-POP card bot exclusive to Discord, Icon provides an expansive collection of K-POP cards featuring current and past artists. With a deep focus on aesthetics, customization, and variety, the bot perfectly crafts together and cultivates fresh and engaging gameplay for all styles of players.\n\n**Need More Help?**\nUsing `help [command]` will provide more details about the specified command and its usages. You may also visit the Official Icon Server at discord.gg/iconofficial to speak with an available Icon team member.\n\n" + commands.slice((page) * 5 - 5, (page) * 5).toString().replace(/,/g, ""))
                .setColor("#33A7FF")
                .setAuthor(`${client.user.username}`, client.user.avatarURL, client.user.avatarURL)
                .setFooter(`${viewer.username}#${viewer.discriminator} | ICON EST. 2021`, viewer.avatarURL, viewer.avatarURL)
            if (commands.length < 6) {
                message.channel.createMessage({ embed: help });
            } else if (commands.length >= 6) {
                message.channel.createMessage({ embed: help })
                    .then(message => {
                        message.addReaction('◀️');
                        message.addReaction('▶️')

                        const reactionListener = new ReactionHandler.continuousReactionStream(
                            message,
                            (userID) => userID != message.author.id,
                            false,
                            { max: 100, time: 60000 }
                        );
                        const viewerReaction = []
                        reactionListener.on('reacted', (event) => {
                            if (event.emoji.name == "◀️") {
                                viewerReaction.push(event.userID)
                                if (viewerReaction.includes(viewer.id)) {
                                    if (page == 1) return;
                                    page--;
                                    help.setDescription("**Need More Help?**\nUsing `help [command]` will provide more details about the specified command and its usages. You may also visit the Official Icon Server at discord.gg/iconofficial to speak with an available Icon team member.\n\n" + commands.slice((page) * 5 - 5, (page) * 5).toString().replace(/,/g, ""))
                                    help.setFooter(`${viewer.username}#${viewer.discriminator} | Viewing Help`, viewer.avatarURL, viewer.avatarURL)
                                    message.edit({ embed: help })
                                }
                            }

                            if (event.emoji.name == "▶️") {
                                viewerReaction.push(event.userID)
                                if (viewerReaction.includes(viewer.id)) {
                                    if (page == pages.length) return;
                                    page++;
                                    help.setDescription("**Need More Help?**\nUsing `help [command]` will provide more details about the specified command and its usages. You may also visit the Official Icon Server at discord.gg/iconofficial to speak with an available Icon team member.\n\n" + commands.slice((page) * 5 - 5, (page) * 5).toString().replace(/,/g, ""))
                                    help.setFooter(`${viewer.username}#${viewer.discriminator} | Viewing Help`, viewer.avatarURL, viewer.avatarURL)
                                    message.edit({ embed: help })
                                }
                            }

                        })
                    })
            }
        }
    }
}