/*---------------------------------------LOADING IN THE PACKAGES---------------------------------------*/
// MODELS: Gets the necessary data models from the database to complete the burn process
const claimedCards = require('../models/claimedCards.js');
const user = require('../models/user.js');

// FUNCTIONS: Uses a helper function with repetitive actions
const { inventory } = require('../functions/inventory/inventory.js');
const { filters } = require('../functions/inventory/inventoryFilters.js');

// REACTION HANDLER: Allows the player to interact with the embeds
const ReactionHandler = require('eris-reactions');

/*-----------------------------------INVENTORY COMMAND: BEGINNING INVENTORY PROCESS------------------------------------*/
module.exports = {
    name: 'inventory',
    description: "Displays the cards within the inventory of a player",
    aliases: ["inv", "i"],
    async execute(client, message, args, Eris) {

        const viewer = message.member.user;

        /*---------------------------------MENTION OR PLAYER ID------------------------------------*/
        if (message.mentions.length >= 1 || message.mentions.length < 1 && args.length >= 1) {
            const search = args
            var player = "";
            var playerInfo;
            var playerName = ""
            var playerDiscriminator = ""
            var playerAvatar = ""
            var filter = await filters(search)
            if (message.mentions.length >= 1) {
                player = message.channel.guild.members.get(message.mentions[0].id).user.id
                playerInfo = message.channel.guild.members.get(message.mentions[0].id).user
                playerName = message.channel.guild.members.get(message.mentions[0].id).username
                playerDiscriminator = message.channel.guild.members.get(message.mentions[0].id).discriminator
                playerAvatar = message.channel.guild.members.get(message.mentions[0].id).avatarURL
            } else {
                const checkPlayer = await user.findOne({ userID: search[0] })
                if (checkPlayer != null && checkPlayer != undefined) {
                    player = checkPlayer.userID
                    playerInfo = checkPlayer
                    playerName = checkPlayer.name
                    playerDiscriminator = checkPlayer.discriminator
                    playerAvatar = checkPlayer.avatarURL
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
            var owner = ""
            if(player!=""){
            var playerDB = await user.findOne({ userID: player })

            // OWNERSHIP CHECK: Performs various checks to see how the owner should be viewed on the card.
                    // If a card is currently in play and not burned, it will appear with an "Owned By" statement. 
                    // If the owner is private, it will state "Owned by Private". If the owner is not private, the
                    // card will appear with the user's name, which can be clicked on to view their profile. If
                    // a card is currently burned, the card will have no "Owned By" statement until it is back in
                    // the position of a player.
            if (playerDB.private) {
                if (playerDB.userID == viewer.id) {
                    owner = `Viewable`
                } else {
                    owner = `Private`

                    //embed telling user that the other user is privated
                    const private = new Eris.RichEmbed()
                        .setTitle("")
                        .setDescription("<:exclaim:906289233814241290> This inventory is currently set to private")
                        .setColor("#9370DB")
                        .setFooter(`${viewer.username}#${viewer.discriminator} | Privated Inventory`, viewer.avatarURL, viewer.avatarURL)
                    message.channel.createMessage({ embed: private })

                }
            } else {
                owner = `Viewable`
            }
            }
        
            if(owner!=`Private`){
                if (player != "") {
                    if (search[0] == player || search[0] == "<@!" + message.channel.guild.members.get(message.mentions[0].id).user.id + ">" || search[0] == "<@" + message.channel.guild.members.get(message.mentions[0].id).user.id + ">") {
                        search.shift()
                    }
                } else if (player == "" && filter != undefined && filter != undefined) {
                    player = viewer.id
                    playerInfo = viewer
                    playerName = viewer.username
                    playerDiscriminator = viewer.discriminator
                    playerAvatar = viewer.avatarURL
                }
    
                if (filter != undefined && filter != null) {
                    if (filter.length != 0) {
                        inventory(viewer, player, playerName, playerDiscriminator, playerAvatar, search, filter, user, claimedCards, ReactionHandler, Eris, message)
                    }
                } else {
                    const filters = []
                    inventory(viewer, player, playerName, playerDiscriminator, playerAvatar, search, filters, user, claimedCards, ReactionHandler, Eris, message)
                }
            }      
            
            } else {
                /*--------------------------------------INVENTORY OF THE MESSAGING PLAYER------------------------------*/
                const search = []
                const filters = []
                player = viewer.id
                playerInfo = viewer
                playerName = viewer.username
                playerDiscriminator = viewer.discriminator
                playerAvatar = viewer.avatarURL
    
                inventory(viewer, viewer.id, playerName, playerDiscriminator, playerAvatar, search, filters, user, claimedCards, ReactionHandler, Eris, message)
            }
    }
}
