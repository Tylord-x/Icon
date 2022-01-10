/*----------------------------------------------------DATABASE------------------------------*/

//DB
const mongoose = require("mongoose");
require("dotenv").config();

//Connect to database
mongoose.connect(process.env.MONGODB_SRV, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to the database');
}).catch((err) => {
    console.log(err);
});

/*------------------------------------------MODELS AND CARDS--------------------------------------------------*/

const user = require('./models/user.js');
const cards = require('./gameplay/cards/cardService.js');

/*-----------------------------------------------PACKAGES----------------------------------------------------*/

const Duration = require('humanize-duration')
require("pluris");
const fs = require('fs');
const CDdata = require('quick.db');
// MESSAGE LISTENER: Listens for all the messages that are typed by the traders
const { MessageCollector } = require('eris-message-collector');

/*-------------------------------------------------PREFIX-----------------------------------------------------*/

const prefix = "."

/*-------------------------------------------------BOT----------------------------------------------------*/

const Eris = require('eris');
const client = new Eris(process.env.TOKEN, {
    intents: ["guilds", "guildMembers", "guildPresences", "guildMessages", "guildMessageReactions", "guildBans", "guildEmojis", "guildWebhooks"]
});

// COMMANDS
client.commands = new Eris.Collection();
const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}
//COOLDOWNS
const dropcdtime = 1.5 * 10 ** 6;
const shopcdtime = 40000;
const shopCooldown = new Set();
const lookupCooldown = new Set();

client.on("ready", () => {
    console.log("Icon is ready to go!");
    client.editStatus('online', { name: "the server", type: 3 });
})

client.on('messageCreate', async message => {

    if (message.author.bot || !message.channel.guild) return;
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName) || client.commands.find(alias => alias.aliases && alias.aliases.includes(commandName))

    function dropcooldown(cooldownTime) {
        var cooldown;
        if (dropcdtime - (Date.now() - cooldownTime) > 0) {
            cooldown = true
        }
        else {
            cooldown = false
        }
        return cooldown
    }

    const lookupCheck = new Set()
    var lookupCollection;

    /*-------------------------------------CREATING HICON------------------------------------*/

    const hicon = await user.findOne({ userID: "881301440071618600" })

    if (hicon == null || hicon == undefined) {

        var hiconInfo;
        const members = await message.guild.fetchMembers()
        for (i = 0; i < members.length; i++) {
            if (members[i].id == "881301440071618600") {
                hiconInfo = members[i]
            }
        }
        const newData = new user({
            name: "hicon",
            userID: "881301440071618600",
            discriminator: "3407",
            avatar: hiconInfo.avatarURL,
            diamonds: 0,
            opals: 0,
            daily: 0,
            inventory: [],
            hues: [],
            labels: [],
            magazines: [],
            subscribedMags: [],
            dropCooldown: 0,
            claimCooldown: 0,
            tradeCooldown: 0,
            dateCreated: hiconInfo.createdAt,
            dateJoined: hiconInfo.joinedAt,
            startedPlaying: Date.now(),
            numCards: 0,
            numClaimed: 0,
            traded: 0,
            tradeReceived: 0,
            numBurned: 0,
            gifted: 0,
            giftsReceived: 0,
            banned: false,
            blacklisted: false,
            private: false
        })
        newData.save().catch(err => console.log(err));
    }


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
            magazines: [],
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
            blacklisted: false,
            private: false
        })
        newData.save().catch(err => console.log(err));

        setTimeout(async () => {
            const newPlayer = await user.findOne({ userID: member.id })
            if (newPlayer != null && newPlayer != undefined) {
                if (commandName == "drop") {
                    if (dropcooldown(newPlayer.dropCooldown)) {
                        var timeLeft = Duration(dropcdtime - (Date.now() - newPlayer.dropCooldown), { units: ['h', 'm', 's'], conjunction: " and ", round: true });
                        message.channel.createMessage(`<:cooldown:903784440403230772> <@${member.id}> you cannot drop for another ${timeLeft}`)
                    } else {
                        cards.execute(client, message, args, Eris, CDdata)
                        if (newPlayer != null && newPlayer != undefined) {
                            newPlayer.dropCooldown = Date.now()
                            newPlayer.save()
                        }
                    }
                } else if (commandName == "shop") {
                    if (shopCooldown.has(message.author.id)) {
                        const shop = new Eris.RichEmbed()
                            .setTitle("")
                            .setColor("#9370DB")
                            .setDescription("<:exclaim:906289233814241290> A shop session is already open. Continue shopping or exit by messaging 0.")
                            .setFooter(`${member.username}#${member.discriminator} | Viewing Shop `, member.avatarURL, member.avatarURL)
                        message.channel.createMessage({ embed: shop })
                    } else {
                        shopCooldown.add(member.id)
                        command.execute(client, message, args, Eris, shopCooldown)
                        setTimeout(() => {
                            shopCooldown.delete(member.id)
                        }, 60000)
                    }
                } else if (command && command.name != "drop" && command.name != "shop") {
                    command.execute(client, message, args, Eris, CDdata);
                }
            }
        }, 10)

    } else {
        if (player != null && player != undefined) {
            if (member.username != player.name) {
                player.name == member.username
            } else if (member.discriminator != player.discriminator) {
                player.discriminator == member.discriminator
            } else if (member.avatarURL != player.avatar) {
                player.avatar == member.avatarURL
            } else if(player.diamonds < 0) {
                player.diamonds = 0
            } else if(player.opals < 0) {
                player.opals = 0
            }

            if (!player.banned && !player.blacklisted) {
                if (commandName == "drop") {
                    if (dropcooldown(player.dropCooldown)) {
                        var timeLeft = Duration(dropcdtime - (Date.now() - player.dropCooldown), { units: ['h', 'm', 's'], conjunction: " and ", round: true });
                        message.channel.createMessage(`<:cooldown:903784440403230772> <@${member.id}> you cannot drop for another ${timeLeft}`)
                    } else {
                        cards.execute(client, message, args, Eris, CDdata)
                        player.dropCooldown = Date.now()
                        player.save()
                    }
                } else if (commandName == "shop") {
                    if (shopCooldown.has(member.id)) {
                        const shop = new Eris.RichEmbed()
                            .setTitle("")
                            .setColor("#9370DB")
                            .setDescription("<:exclaim:906289233814241290> A shop session is already open. Continue shopping or exit by messaging 0.")
                            .setFooter(`${member.username}#${member.discriminator} | Viewing Shop `, member.avatarURL, member.avatarURL)
                        message.channel.createMessage({ embed: shop })
                    } else {
                        shopCooldown.add(member.id)
                        command.execute(client, message, args, Eris, shopCooldown)
                        setTimeout(() => {
                            shopCooldown.delete(member.id)
                        }, 60000)
                    }
                    player.save()
                } else if (commandName == "lookup" || commandName == "lu") {
                    if (lookupCooldown.has(member.id)) {
                        const lookup = new Eris.RichEmbed()
                            .setTitle("")
                            .setColor("#9370DB")
                            .setDescription("<:exclaim:906289233814241290> A lookup session is already open. Continue viewing the searched artists or leave the session by pressing the x on the main lookup embed or letting the session timeout.")
                            .setFooter(`${member.username}#${member.discriminator} | Viewing Lookup `, member.avatarURL, member.avatarURL)
                        message.channel.createMessage({ embed: lookup })
                    } else {
                        lookupCooldown.add(member.id)
                        command.execute(client, message, args, Eris, lookupCooldown)
                        setTimeout(() => {
                            lookupCooldown.delete(member.id)
                        }, 60000)
                    }
                    player.save()
                } else if (command && command.name != "drop" && command.name != "shop" && command.name != "lookup" && command.name != "lu") {
                    command.execute(client, message, args, Eris, CDdata);
                    player.save()
                }

            } else if (player.banned || player.blacklisted) {
                if (player.banned) {
                    const banned = new Eris.RichEmbed()
                        .setTitle("")
                        .setDescription("<:exclaim:906289233814241290> You have been banned from using Icon. In order to proceed with an appeal and to speak with an Icon team member, please visit the official Icon server at discord.gg/iconofficial.")
                        .setColor("#9370DB")
                        .setFooter(`${member.username}#${member.discriminator} | Banned Notification`, member.avatarURL, member.avatarURL)
                    message.channel.createMessage({ embed: banned })
                } else if (player.blacklisted) {
                    const blacklisted = new Eris.RichEmbed()
                        .setTitle("")
                        .setDescription("<:exclaim:906289233814241290> You have been blacklisted from using Icon. You will no longer be able to participate in the bot.")
                        .setColor("#9370DB")
                        .setFooter(`${member.username}#${member.discriminator} | Blacklisted Notification`, member.avatarURL, member.avatarURL)
                    message.channel.createMessage({ embed: blacklisted })
                }
            }
        }
    }

})

client.on("error", err => {
    console.log(`error here: ${err}`)
});

client.connect();
