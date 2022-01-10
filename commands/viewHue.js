/*---------------------------------------------LOADING IN PACKAGES-------------------------------------*/

// MODELS: Gets the necessary data models from the database to complete the hue process

const hues = require('../models/ownedHues.js')

// CANVAS: Provides all the necessary components of Canvas and its related packages. 
const Canvas = require('canvas');

/*-------------------------------------------VIEW HUE COMMAND: BEGIN VIEW HUE COMMAND------------------------------------------------*/

module.exports = {
    name: 'viewHue',
    description: "viewing player-owned hues",
    aliases: ['vh', 'viewhue'],
    async execute(client, message, args, Eris) {
        const viewer = message.member.user;
        const content = args

        if (content.length >= 1) {

            const ownedHues = await hues.find({})

            var selectedHue;
            for (i = 0; i < content.length; i++) {
                for (j = 0; j < ownedHues.length; j++) {
                    if (content[i].toLowerCase() == ownedHues[j].code) {
                        console.log("should go in here")
                        selectedHue = ownedHues[j]
                    }
                }
            }

            if (selectedHue != undefined && selectedHue != null) {
                const canvas = Canvas.createCanvas(150, 150);
                const context = canvas.getContext('2d');
                const background = await Canvas.loadImage('transparent.png');
                context.drawImage(background, 0, 0, canvas.width, canvas.height);


                context.fillStyle = "" + selectedHue.hexCode
                context.fillRect(0, 0, canvas.width, canvas.height);

                const hueBuffer = canvas.toBuffer();
                const hueAttachment = { file: hueBuffer, name: "hue.png" };


                const hueEmbed = new Eris.RichEmbed()
                    .setTitle("**" + selectedHue.name.toUpperCase() + "**")
                    .setDescription(`Owned by <@${selectedHue.owner[selectedHue.owner.length - 1]}>\n\n` + "**Name**\n" + selectedHue.name + "\n**Hex Code**\n" + selectedHue.hexCode + "\n**RGB**\n" + selectedHue.rgb)
                    .setColor("" + selectedHue.hexCode)
                    .setImage("attachment://hue.png")
                message.channel.createMessage({ embed: hueEmbed }, hueAttachment)
            }

        } else {

            const ownedHues = await hues.find({ owner: viewer.id })
            const verified = []
            for (i = 0; i < ownedHues.length; i++) {
                if (ownedHues[i].owner[ownedHues[i].owner.length - 1] == viewer.id) {
                    verified.push(ownedHues[i])
                }
            }

            if (verified.length != 0) {


                const selectedHue = verified[verified.length - 1]

                if (selectedHue != undefined && selectedHue != null) {
                    const canvas = Canvas.createCanvas(150, 150);
                    const context = canvas.getContext('2d');
                    const background = await Canvas.loadImage('transparent.png');
                    context.drawImage(background, 0, 0, canvas.width, canvas.height);


                    context.fillStyle = "" + selectedHue.hexCode
                    context.fillRect(0, 0, canvas.width, canvas.height);

                    const hueBuffer = canvas.toBuffer();
                    const hueAttachment = { file: hueBuffer, name: "hue.png" };


                    const hueEmbed = new Eris.RichEmbed()
                        .setTitle("**" + selectedHue.name.toUpperCase() + "**")
                        .setDescription(`Owned by <@${selectedHue.owner[selectedHue.owner.length - 1]}>\n\n` + "**Name**\n" + selectedHue.name + "\n**Hex Code**\n" + selectedHue.hexCode + "\n**RGB**\n" + selectedHue.rgb)
                        .setColor("" + selectedHue.hexCode)
                        .setImage("attachment://hue.png")
                    message.channel.createMessage({ embed: hueEmbed }, hueAttachment)
                }
            }

        }
    }
}