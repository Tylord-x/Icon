const Eris = require('eris');

const colorNames = require('color-name-list')
const nearestColor = require('nearest-color')

const Canvas = require('canvas');

const hueTracker = require('../gameplay/hues/hueTracker.js');

const hueInfo = require('../models/hueInfo.js');
const ownedHues = require('../models/ownedHues.js');
const hueBundle = require('../models/hueBundle.js');

const ReactionHandler = require('eris-reactions');


module.exports = {
    name: 'addHueBundle',
    description: "Creates a buyable hue pack",
    aliases: ["ahb", "addhuebundle", "addhuepack", "ahp"],
    async execute(client, message, args, Eris) {

        if (message.member.user.id == "729810040395137125" || message.member.user.id == "665806267020738562" || message.member.user.id == "641811094918397963") {


            if (args != undefined) {

                const chosenColors = []
                var hexCodesIndex = 0;
                var nameIndex = 0;
                var hues;
                var hueBundleName = "";
                const colorList = [];
                const hueReaction = [];

                const adder = message.member.user.id;

                for (i = 0; i < args.length; i++) {
                    if (args[i].includes("#")) {
                        hexCodesIndex = i;
                    } else {
                        nameIndex = i;
                    }

                }

                for (i = 0; i < args.length; i++) {

                    if (args[i].includes("#")) {


                        const colors = colorNames.reduce((o, { name, hex }) => Object.assign(o, { [name]: hex }), {});

                        const nearest = nearestColor.from(colors);

                        const chosenColorName = nearest(args[i]);

                        var rgbColor = Object.values(chosenColorName.rgb)
                        rgbColor = rgbColor.toString()
                        rgbColor = rgbColor.replace(/,[s]*/g, ", ")
                        chosenColorName.rgb = rgbColor

                        chosenColors.push(chosenColorName)
                    } else {

                        if (i > hexCodesIndex) {

                            hueBundleName += args[i]

                            if (i < args.length - 1) {
                                hueBundleName += " "
                            }
                        }
                    }
                }

                if (chosenColors[0] !== undefined) {

                    const canvas = Canvas.createCanvas(900, 200);
                    const context = canvas.getContext('2d');
                    const background = await Canvas.loadImage('transparent.png');
                    context.drawImage(background, 0, 0, canvas.width, canvas.height);

                    for (i = 0; i < chosenColors.length; i++) {

                        colorList.push("" + chosenColors[i].name + " | " + chosenColors[i].value + " | " + chosenColors[i].rgb + '\n')

                        context.fillStyle = "" + chosenColors[i].value

                        if (i >= 0 && i <= 4) {
                            context.fillRect(180 * i, 20, 150, 150)
                        }
                    }

                    var finalColorList = colorList.toString().replace(/,/g, "")

                    var hueBuffer = canvas.toBuffer();
                    var hueAttachment = { file: hueBuffer, name: "hue.png" };

                    const addHueBundle = new Eris.RichEmbed()
                        .setTitle("**ADD HUE BUNDLE**")
                        .setDescription("**Hue Bundle Information**\n\n **Name**\n" + hueBundleName + "\n\n**Hues**\n" + finalColorList)
                        .setColor("" + chosenColors[0].value)
                        .setImage("attachment://hue.png")
                    message.channel.createMessage({ embed: addHueBundle }, hueAttachment)
                        .then(message => {
                            message.addReaction('☑️');
                        })


                    client.once('messageCreate', async (message) => {

                        const reactionListener = new ReactionHandler.continuousReactionStream(
                            message,
                            (userID) => userID !== message.author.id,
                            false,
                            // in case other players try to react, it will allot four reactions
                            { maxMatches: 4, time: 60000 }
                        );
                        reactionListener.on('reacted', (event) => {

                            // if the check mark reaction is clicked, the process continues
                            if (event.emoji.name === "☑️") {

                                hueReaction.push(event.userID); // stores the reactions

                                if (chosenColors != undefined) {

                                    if (hueReaction.includes(adder) && chosenColors.length >= 1) {

                                        const colorNames = []
                                        const colorHex = []
                                        const colorRGB = []

                                        for (i = 0; i < chosenColors.length; i++) {
                                            colorNames.push(chosenColors[i].name)
                                            colorHex.push(chosenColors[i].value)
                                            colorRGB.push(chosenColors[i].rgb)
                                        }

                                        hueBundle.find({
                                            $and: [{ bundleName: hueBundleName }, { names: colorNames }, { hexColors: colorHex }, { rgb: colorRGB }]
                                        }, (err, hues) => {

                                            const newData = new hueBundle({
                                                bundleName: hueBundleName,
                                                names: colorNames,
                                                hexCodes: colorHex,
                                                rgb: colorRGB
                                            })
                                            newData.save().catch(err => console.log(err));

                                        })


                                        for (j = 0; j < chosenColors.length; j++) {

                                            const newData = new hueInfo({
                                                name: chosenColors[j].name,
                                                hexCode: chosenColors[j].value,
                                                rgb: chosenColors[j].rgb
                                            })
                                            newData.save().catch(err => console.log(err));
                                        }

                                    }
                                }
                            }
                        })
                    })
                }
            }
        }

    }
}