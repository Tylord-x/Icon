/*---------------------------------------LOADING IN THE PACKAGES---------------------------------------*/
// MODELS: Gets the necessary data models from the database to complete the daily process
const user = require('../models/user.js');

// TIME: Provides the daily cooldown times and a package that formats time
const duration = require('humanize-duration')
const timeout = 8.64 * 10 ** 7;

/*--------------------------------CREATE DAILY COMMAND: BEGINNING DAILY PROCESS----------------------------------------------*/
module.exports = {
    name: 'daily',
    description: "Players can receive daily diamonds and opals",
    aliases: ["d", "r"],
    async execute(client, message, args, Eris) {

        const member = message.member.user; // Receives information about the messaging player
        const player = await user.findOne({ userID: member.id }) // Stores the data on the player

        // CURRENCY: Provides the amount of opals and diamonds a player will receive
        const dailyOpals = 250; // Stores the amount of opals
        const dailyDiamonds = 5; // Stores the amount of diamonds

        // PLAYER: Checks if the player can be found within the database. If the player is found and
        // is not on the daily cooldown, they will receive opals and diamonds. If they are on cooldown,
        // they will be provided with a message on how long until they can claim daily again.
        if (player != null && player != undefined) {
            console.log("current player")

            if (timeout - (Date.now() - player.daily) > 0) {

                const time = duration(timeout - (Date.now() - player.daily), { units: ['h', 'm', 's'], conjunction: " and ", round: true });
                const onCooldown = new Eris.RichEmbed()
                    .setTitle("")
                    .setDescription(`<:exclaim:906289233814241290> Daily has already been claimed! Try again in ${time}.`)
                    .setColor("#9370DB")
                    .setFooter(`${member.username}#${member.discriminator} | Already Claimed Daily`, member.avatarURL, member.avatarURL)
                message.channel.createMessage({ embed: onCooldown })
            } else {
                player.diamonds += dailyDiamonds; // Adds the given daily amount of diamonds to the player's diamond count
                player.opals += dailyOpals;  // Adds the given daily amount of opals to the player's opals count
                player.daily = Date.now(); // Saves the daily cooldown to begin countdown
                player.save()

                const daily = new Eris.RichEmbed()
                    .setTitle("")
                    .setDescription(`**<:cooldown:903784440403230772> Daily Claimed**\n\n**` + dailyDiamonds + `** <:diamond:898641993511628800> | **` + dailyOpals + `** <:opal:899430579831988275>`)
                    .setColor("#9370DB")
                    .setFooter(`${member.username}#${member.discriminator} | Received Daily`, member.avatarURL, member.avatarURL)
                message.channel.createMessage({ embed: daily })
            }

        } else if (player == null || player == undefined) {

            // NEW PLAYER: If the player cannot be found, a timeout of 250 miliseconds is added to wait for the database
            // to update with the information on the player, who was just created. Then the cooldown, diamonds, and opals,
            // are added.
            const newPlayer = await user.findOne({ userID: member.id })
            setTimeout(async () => {
                if (newPlayer != null && newPlayer != undefined) {
                    console.log("new player")
                    newPlayer.diamonds += dailyDiamonds; // Adds the given daily amount of diamonds to the player's diamond count
                    newPlayer.opals += dailyOpals;  // Adds the given daily amount of opals to the player's opals count
                    newPlayer.daily = Date.now(); // Saves the daily cooldown to begin countdown
                    newPlayer.save()

                    const daily = new Eris.RichEmbed()
                        .setTitle("")
                        .setDescription(`<:cooldown:903784440403230772> **Daily Claimed**\n\n**` + dailyDiamonds + `** <:diamond:898641993511628800> | **` + dailyOpals + `** <:opal:899430579831988275>`)
                        .setColor("#9370DB")
                        .setFooter(`${member.username}#${member.discriminator} | Received Daily`, member.avatarURL, member.avatarURL)
                    message.channel.createMessage({ embed: daily })
                }
            }, 250)
        }
    }
}