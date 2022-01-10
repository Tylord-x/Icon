/*---------------------------------------LOADING IN THE PACKAGES-----------------------------------*/

// MODELS: Gets the necessary data models from the database to complete the profile color process
const profiles = require('../models/profile.js');

// COLORS: Package that checks whether a provided hex code is a color
const validateColor = require("validate-color").default;
const { validateHTMLColorHex } = require("validate-color");

/*-----------------------------------------PROFILE COLOR COMMAND: BEGIN COLOR PROCESS-----------------------------*/
module.exports = {
    name: 'profileColor',
    description: "Allows players to create a profile",
    aliases: ["profileColor", "color", "profilecolor", "pcolor"],
    async execute(client, message, args, Eris) {

        const member = message.member.user; // Stores the information of the messaging player
        const profile = await profiles.findOne({ userID: member.id }) // Finds the profile corresponding to the messaging player

        // PROFILE: If a profile can be found for the messaging player, the color process will continue. Otherwise, the player
        // will be prompted to create a profile first by using the profile command.
        if (profile != undefined && profile != null) {
            if (args != undefined && args != null) {
                const content = args
                // CONTENT LENGTH: Ensures that the length of message arguments is at least one. This
                // allows the check on whether the format of the color is correct and if the color is valid.
                if (content.length >= 1) {
                    // HEX CODE FORMAT: Makes sure that the message content matches the format of a hex code. This means
                    // the player should be providing a valid hex code starting with a # (hashtag) followed by six letters and/or numbers.
                    if (content[0].startsWith("#") && content[0].length == 7) {
                        const validatedColor = await validateHTMLColorHex(content[0]) // Checks if what is messaged is a valid hex code
                        // VALIDATED COLOR: If the color is a valid hex code and matches an existing color, the color will be added 
                        // to the messaging player's profile. If the color is not valid, the player will be prompted to enter a valid color.
                        if (validatedColor) {
                            profile.color = content[0] // Saves the inputed color to the player's profile.
                            profile.save()
                            const addedColor = new Eris.RichEmbed()
                                .setTitle("")
                                .setDescription(`The color code **` + content[0] + `** has been added and will now appear within your profile`)
                                .setColor("" + content[0])
                                .setFooter(`${member.username}#${member.discriminator} | Added Color`, member.avatarURL, member.avatarURL)
                            message.channel.createMessage({ embed: addedColor })
                        } else {
                            const invalidColor = new Eris.RichEmbed()
                                .setTitle("")
                                .setDescription(`<:exclaim:906289233814241290> The color given is invalid. Make sure the hex code matches to an actual color.`)
                                .setColor("#9370DB")
                                .setFooter(`${member.username}#${member.discriminator} | Invalid Color`, member.avatarURL, member.avatarURL)
                            message.channel.createMessage({ embed: invalidColor })
                        }
                    } else {
                          const wrongFormat = new Eris.RichEmbed()
                            .setTitle("")
                            .setDescription(`<:exclaim:906289233814241290> Provide a valid hex code starting with a # (hashtag) followed by six letters and/or numbers.`)
                            .setColor("#9370DB")
                            .setFooter(`${member.username}#${member.discriminator} | Invalid Hex Code Exceeded`, member.avatarURL, member.avatarURL)
                        message.channel.createMessage({ embed: wrongFormat })
                    }
                } else {
                    const invalidFormat = new Eris.RichEmbed()
                        .setTitle("")
                        .setDescription(`<:exclaim:906289233814241290> Provide a valid hex code starting with a # (hashtag) followed by six letters and/or numbers.`)
                        .setColor("#9370DB")
                        .setFooter(`${member.username}#${member.discriminator} | Invalid Hex Code Format`, member.avatarURL, member.avatarURL)
                    message.channel.createMessage({ embed: invalidFormat })
                }
            }
        } else {
            const noProfile = new Eris.RichEmbed()
                .setTitle("")
                .setDescription('<:exclaim:906289233814241290> In order add color to your profile, a profile must be created first. Use `profile` to create your profile.')
                .setColor("#9370DB")
                .setFooter(`${member.username}#${member.discriminator} | Profile Does Not Exist`, member.avatarURL, member.avatarURL)
            message.channel.createMessage({ embed: noProfile })
        }

    }
}