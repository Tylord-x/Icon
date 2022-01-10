

const Canvas = require('canvas');

const ownedHues = require('../models/ownedHues.js');

const ReactionHandler = require('eris-reactions');


module.exports = {
    name: 'latesthues',
    description: "receives a color",
    aliases: ["lh", "lathue"],
    async execute(client, message, args, Eris) {

        var messageID;

        ownedHues.find()
            .then(async hues => {

                var pages = [];
                let pageCount = 0;
                let page = 1;

                var hexColor = []
                for (i = 0; i < hues.length; i++) {
                    hexColor.push(hues[i].hexCode)

                    if (i % 15 === 0) {
                        pageCount += 1;
                        pages.push(pageCount)
                    }
                }

                const canvas = Canvas.createCanvas(900, 600);
                const context = canvas.getContext('2d');
                const background = await Canvas.loadImage('transparent.png');
                context.drawImage(background, 0, 0, canvas.width, canvas.height);



                var hueList = hexColor.slice(hexColor.length - 15, hexColor.length);


                for (i = 0; i < hueList.length; i++) {

                    context.fillStyle = "" + hueList[i]

                    if (i >= 0 && i <= 4) {
                        context.fillRect(180 * i, 20, 150, 150)
                    } else if (i >= 5 && i < 11) {
                        context.fillRect((180 * (i - 6)), 225, 150, 150)
                    } else if (i >= 12 && i <= 18) {
                        context.fillRect((180 * (i - 12)), 430, 150, 150)
                    }

                }

                var hueBuffer = canvas.toBuffer();
                var hueAttachment = { file: hueBuffer, name: "hue.png" };

                const latestHues = new Eris.RichEmbed()
                    .setTitle("** LATEST HUES **")
                    .setDescription("A lookbook of all the latest hues.")
                    .setColor("#33A7FF")
                    .setImage("attachment://hue.png")
                
                    message.channel.createMessage({ embed: latestHues }, hueAttachment)

            })
    }
}