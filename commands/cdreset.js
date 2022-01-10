const user = require('../models/user.js');
let authorizedUsers = ['665806267020738562', '729810040395137125', '881301440071618600', '641811094918397963'];

module.exports = {
    name: 'cdreset',
    description: "allows testers to reset cds",
    async execute(client, message, args, Eris, CDdata) {

        if ((authorizedUsers.includes(message.member.user.id) || message.member.roles.includes("873296833672273971") || message.member.roles.includes("873304692002795530"))) {
            //message author is an authorized user(tester). they can reset the cd for themselves
            // //CDdata.set(message.author.id,{drop: null, claim: null})
            // CDdata.delete(message.author.id)

            const member = message.member.user;
            const player = await user.findOne({ userID: member.id })

            if (player == null || player == undefined) {
                const newData = new user({
                    name: member.username,
                    userID: member.id,
                    discriminator: member.discriminator,
                    avatar: member.avatarURL,
                    diamonds: 0,
                    opals: 0,
                    daily: 0,
                    inventory: [],
                    hues: [],
                    labels: [],
                    subscribedMags: [],
                    dropCooldown: 0,
                    claimCooldown: 0,
                    tradeCooldown: 0,
                    dateCreated: message.member.createdAt,
                    dateJoined: message.member.joinedAt,
                    startedPlaying: Date.now(),
                    numCards: 0,
                    numClaimed: 0,
                    traded: 0,
                    tradeReceived: 0,
                    numBurned: 0,
                    gifted: 0,
                    giftsReceived: 0,
                    banned: false,
                    blacklisted: fa
                })
                newData.save().catch(err => console.log(err));
            }
            else {
                player.dropCooldown = 0
                player.claimCooldown = 0
                player.daily = 0
                player.save().catch(err => console.log(err));

            }
        }
        else
        {
        //do nothing
        return
        }
    }
}
