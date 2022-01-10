/*---------------------------------------LOADING IN THE PACKAGES-----------------------------------*/

// MODELS: Gets the necessary data models from the database to complete the profile collection list process
const profiles = require('../models/profile.js');

/*-----------------------------------------PROFILE COLLECTS COMMAND: BEGIN COLLECTION LIST PROCESS-----------------------------*/
module.exports = {
    name: 'profileCollects',
    description: "Allows players to add a description to their profile",
    aliases: ["pcollects", "collects", "profilecollection", "collection", "profilecollects"],
    async execute(client, message, args, Eris) {

        const member = message.member.user; // Stores the information of the messaging player
        const profile = await profiles.findOne({ userID: member.id }) // Receives the profile database information of the player

        // PROFILE: Ensures that the player has a profile before continuing with the collection list process. If the profile exists,
        // the collection list will eventually be added to the profile. If the profile does not exist, the player will be prompted
        // to create a profile first.
        if (profile != undefined && profile != null) {
            if (args != undefined && args != null) {
                const content = args

                // CONTENT LENGTH: If the content of the message has a length of at least 1, adding the collection list can continue.
                // There must be some content provided by the player in order for it to be added to the profile. As it is freeform,
                // there are not many more formatting checks.
                if (content.length >= 1) {

                    var collection = "" // Creates a string of the messaged collection list content
                    for (i = 0; i < content.length; i++) {
                        collection += content[i]
                        if (i < content.length - 1) {
                            collection += " "
                        }
                    }
                    // COLLECTION LIST LENGTH: In order for the collection list to be saved, the collection list must be limited to
                    // 1010 characters. An embed description can contain up to 2048 characters. Paired with the potential length of
                    // the description, which is limited to 1010 characters, the profile embed can be 2020 characters.
                    if (collection.length <= 1010) {
                        profile.collects = collection // Stores the collection list in the profile
                        profile.save()
                        const addedColor = new Eris.RichEmbed()
                            .setTitle("")
                            .setDescription(`The collection list has been added and will now appear within your profile`)
                            .setColor("#9370DB")
                            .setFooter(`${member.username}#${member.discriminator} | Added Collection List`, member.avatarURL, member.avatarURL)
                        message.channel.createMessage({ embed: addedColor })
                    } else {
                        const wrongFormat = new Eris.RichEmbed()
                            .setTitle("")
                            .setDescription(`<:exclaim:906289233814241290> The collection list must be less than 1010 characters`)
                            .setColor("#9370DB")
                            .setFooter(`${member.username}#${member.discriminator} | Collection Length Exceeded`, member.avatarURL, member.avatarURL)
                        message.channel.createMessage({ embed: wrongFormat })
                    }
                } else {
                    const wrongFormat = new Eris.RichEmbed()
                        .setTitle("")
                        .setDescription(`<:exclaim:906289233814241290> No collection list has been given. In order to set the collects section of the profile, provide content.`)
                        .setColor("#9370DB")
                        .setFooter(`${member.username}#${member.discriminator} | No Collection List`, member.avatarURL, member.avatarURL)
                    message.channel.createMessage({ embed: wrongFormat })
                }
            }
        } else {
            const noProfile = new Eris.RichEmbed()
                .setTitle("")
                .setDescription('<:exclaim:906289233814241290> In order add a collection list to your profile, a profile must be created first. Use `profile` to create your profile.')
                .setColor("#9370DB")
                .setFooter(`${member.username}#${member.discriminator} | Profile Does Not Exist`, member.avatarURL, member.avatarURL)
            message.channel.createMessage({ embed: noProfile })
        }

    }
}