/*---------------------------------------LOADING IN THE PACKAGES-----------------------------------*/

// MODELS: Gets the necessary data models from the database to complete the profile color process
const profiles = require('../models/profile.js');

/*-----------------------------------------PROFILE DESCRIPTION COMMAND: BEGIN DESCRIPTION PROCESS-----------------------------*/
module.exports = {
    name: 'profileDesc',
    description: "Allows players to add a description to their profile",
    aliases: ["pdesc", "desc", "profiledescription", "profiledesc"],
    async execute(client, message, args, Eris) {

        const member = message.member.user; // Stores the information of the messaging player
        const profile = await profiles.findOne({ userID: member.id }) // Receives the profile information of the messaging player

        // PROFILE: If a profile can be found for the messaging player, the description process will continue. Otherwise, the player
        // will be prompted to create a profile first by using the profile command.
        if (profile != undefined && profile != null) {
            if (args != undefined && args != null) {
                const content = args

                // CONTENT LENGTH: If the content of the message has a length of at least 1, adding the description can continue.
                // There must be some content provided by the player in order for it to be added to the profile. As it is freeform,
                // there are not many more formatting checks.
                if (content.length >= 1) {

                    var description = "" // Creates a string of the description content
                    for (i = 0; i < content.length; i++) {
                        description += content[i]
                        if (i < content.length - 1) {
                            description += " "
                        }
                    }

                    // DESCRIPTION LIST LENGTH: In order for the description to be saved, the description must be limited to
                    // 1010 characters. An embed description can contain up to 2048 characters. Paired with the potential length of
                    // the collection list, which is limited to 1010 characters, the profile embed can be 2020 characters.
                    if (description.length <= 1010) {
                        profile.description = description // Stores the description in the profile
                        profile.save()
                        const addedColor = new Eris.RichEmbed()
                            .setTitle("")
                            .setDescription(`The description has been added and will now appear within your profile`)
                            .setColor("#9370DB")
                            .setFooter(`${member.username}#${member.discriminator} | Added Profile Description`, member.avatarURL, member.avatarURL)
                        message.channel.createMessage({ embed: addedColor })
                    } else {
                        const wrongFormat = new Eris.RichEmbed()
                            .setTitle("")
                            .setDescription(`<:exclaim:906289233814241290> The description must be less than 1010 characters`)
                            .setColor("#9370DB")
                            .setFooter(`${member.username}#${member.discriminator} | Description Length Exceeded`, member.avatarURL, member.avatarURL)
                        message.channel.createMessage({ embed: wrongFormat })
                    }
                } else {
                    const wrongFormat = new Eris.RichEmbed()
                        .setTitle("")
                        .setDescription(`<:exclaim:906289233814241290> No description has been given. In order to set the description section of the profile, provide content.`)
                        .setColor("#9370DB")
                        .setFooter(`${member.username}#${member.discriminator} | No Given Description`, member.avatarURL, member.avatarURL)
                    message.channel.createMessage({ embed: wrongFormat })
                }
            }
        } else {
            const noProfile = new Eris.RichEmbed()
                .setTitle("")
                .setDescription('<:exclaim:906289233814241290> In order add a description to your profile, a profile must be created first. Use `profile` to create your profile.')
                .setColor("#9370DB")
                .setFooter(`${member.username}#${member.discriminator} | Profile Does Not Exist`, member.avatarURL, member.avatarURL)
            message.channel.createMessage({ embed: noProfile })
        }

    }
}