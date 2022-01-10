const magazine = require('../models/magazine.js');
const user = require('../models/user.js');
const claimedCards = require('../models/claimedCards.js');

const ReactionHandler = require('eris-reactions');

const { MessageCollector } = require('eris-message-collector');

const Canvas = require('canvas');

const { registerFont } = require('canvas');

registerFont('./fonts/Prompt-Bold.ttf', { family: 'Prompt-Bold' })
registerFont('./fonts/Prompt-Medium.ttf', { family: 'Prompt-Medium' })
registerFont('./fonts/Prompt-Regular.ttf', { family: 'Prompt' })

module.exports = {
    name: 'subbedMagazines',
    description: "Displays a user's magazines they are subscribed to",
    aliases: ["subbed", "subbedmags", "subbedmagazines", "subs"],
    async execute(client, message, args, Eris) {
        const viewer = message.member.user;

        user.findOne({
            userID: viewer.id
        }, (err, user) => {
        }).then(user => {

            const creator = [];

            for (i = 0; i < user.subscribedMags.length; i++) {
                creator.push(user.subscribedMags[i])
            }

            magazine.find({
                $and: [{ creator: { $in: creator } }]
            }, (err, mags) => {

            }).then(mags => {


                const magsList = [];
                var pages = [];
                let pageCount = 0;

                for (i = 0; i < mags.length; i++) {

                    magsList.push("**" + (i + 1) + "** — " + mags[i].name + ` Magazine | ${mags[i].creatorName}#${mags[i].creatorDiscrim} \n`)

                    if (i % 10 === 0) {
                        pageCount += 1;
                        pages.push(pageCount)
                    }
                }

                let page = 1;

                const magazineList = new Eris.RichEmbed()
                    .setTitle("" + viewer.username.toUpperCase() + "'S **MAGAZINE SUBSCRIPTIONS**")
                    .setDescription('A collection of all the subscribed-to magazines.\n\n **Magazines**\n' + magsList.slice((page) * 10 - 10, (page) * 10).toString().replace(/,/g, ""))
                    .setColor("#33A7FF")
                    .setFooter("Select a magazine to view   |  " + magsList.length + " magazines")

                if (pages.length > 1) {
                    message.channel.createMessage({ embed: magazineList }, attachment)
                        .then(function (message) {
                            message.addReaction('⏪');
                            message.addReaction('◀️');
                            message.addReaction('▶️')
                            message.addReaction('⏩');
                        })

                    client.once('messageCreate', async (message) => {

                        // This will continuously listen for 100 incoming reactions over the course of 15 minutes
                        const reactionListener = new ReactionHandler.continuousReactionStream(
                            message,
                            (userID) => userID != message.author.id,
                            false,
                            { max: 100, time: 60000 }
                        );

                        reactionListener.on('reacted', (event) => {

                            if (event.emoji.name === "⏪") {
                                if (page === 1) return;
                                page = 1;
                                magazineList.setTitle("" + viewer.username.toUpperCase() + "'S **MAGAZINE SUBSCRIPTIONS**")
                                magazineList.setDescription('A collection of all the subscribed-to magazines.\n\n **Magazines**\n' + magsList.slice((page) * 10 - 10, (page) * 10).toString().replace(/,/g, ""))
                                magazineList.setFooter("Select a magazine to view   |  " + magsList.length + " magazines")
                                message.edit({ embed: magazineList })

                            }

                            if (event.emoji.name === "◀️") {

                                if (page === 1) return;
                                page--;
                                magazineList.setTitle("" + viewer.username.toUpperCase() + "'S **MAGAZINE SUBSCRIPTIONS**")
                                magazineList.setDescription('A collection of all the subscribed-to magazines.\n\n **Magazines**\n' + magsList.slice((page) * 10 - 10, (page) * 10).toString().replace(/,/g, ""))
                                magazineList.setFooter("Select a magazine to view   |  " + magsList.length + " magazines")
                                message.edit({ embed: magazineList })
                            }

                            if (event.emoji.name === "▶️") {
                                if (page === pages.length) return;
                                page++;
                                magazineList.setTitle("" + viewer.username.toUpperCase() + "'S **MAGAZINE SUBSCRIPTIONS**")
                                magazineList.setDescription('A collection of all the subscribed-to magazines.\n\n **Magazines**\n' + magsList.slice((page) * 10 - 10, (page) * 10).toString().replace(/,/g, ""))
                                magazineList.setFooter("Select a magazine to view   |  " + magsList.length + " magazines")
                                message.edit({ embed: magazineList })

                            }

                            if (event.emoji.name === "⏩") {
                                if (page === pages.length) return;
                                page = pages.length;
                                magazineList.setTitle("" + viewer.username.toUpperCase() + "'S **MAGAZINE SUBSCRIPTIONS**")
                                magazineList.setDescription('A collection of all the subscribed-to magazines.\n\n **Magazines**\n' + magsList.slice((page) * 10 - 10, (page) * 10).toString().replace(/,/g, ""))
                                magazineList.setFooter("Select a magazine to view   |  " + magsList.length + " magazines")
                                message.edit({ embed: magazineList })

                            }

                        });

                    })
                } else {
                    message.channel.createMessage({ embed: magazineList })

                }

                client.once("messageCreate", async (m) => {


                    let filter = (m) => m.author.id === message.member.id
                    const collector = new MessageCollector(client, message.channel, filter, { // Create our collector with our options set as the current channel, the client, filter and our time
                        time: 5000 * 5
                    });

                    collector.on("collect", async (m) => {

                        const chosenMag = []
                        for (i = 0; i < mags.length + 1; i++) {
                            if (i == m.content) {
                                chosenMag.push(mags[i - 1])
                                collector.stop()
                            }
                        }

                        if (chosenMag[0] != undefined) {

                            magazine.find({
                                creator: chosenMag[0].creator
                            }, (err, mag) => {

                            }).then(mag => {

                                var color = "";
                                if (chosenMag[0].color != "") {
                                    color += "" + chosenMag[0].color

                                } else {
                                    color += "#33A7FF"
                                }

                                var desc = "";

                                if (chosenMag[0].description != "") {
                                    desc += "" + chosenMag[0].description

                                } else {
                                    desc += ""
                                }

                                var checkUserCount = "";

                                if (chosenMag[0].numSubbed == 1) {
                                    checkUserCount += "subscriber"
                                } else {
                                    checkUserCount += "subscribers"
                                }

                                claimedCards.find({
                                    code: { $in: chosenMag[0].cards }
                                }, (err, cards) => {
                                }).then(async cards => {

                                    const indexTracker = []

                                    //fill card list array with empty in beginning
                                    const cardList = Array.from({ length: 8 }).fill("Empty")

                                    //go over cards list
                                    for (i = 0; i < cards.length; i++) {
                                        //add the cards[j] in place magazine.cards.indexOf(cards[j])
                                        cardList[mag[0].cards.indexOf(cards[i].code)] = cards[i]

                                    }

                                    var secRow = false
                                    var actualCard = false
                                    for (i = 0; i < cardList.length; i++) {
                                        if (cardList[i] != "Empty") {
                                            indexTracker.push(i)
                                            actualCard = true
                                        }
                                    }

                                    for (i = 0; i < indexTracker.length; i++) {
                                        if (indexTracker[i] >= 4) {
                                            secRow = true;
                                        }

                                    }

                                    var canvas;
                                    if (secRow) {
                                        canvas = Canvas.createCanvas(2590, 1860);
                                    } else {
                                        canvas = Canvas.createCanvas(2590, 930);

                                    }
                                    const context = canvas.getContext('2d');
                                    const background = await Canvas.loadImage('transparent.png');
                                    context.drawImage(background, 0, 0, canvas.width, canvas.height);


                                    if (actualCard) {
                                        for (i = 0; i < cardList.length; i++) {
                                            if (i >= 0 && i < 4) {

                                                if (i == 0) {
                                                    if (cardList[i] != "Empty") {
                                                        const idolIcon = await Canvas.loadImage(cardList[i].mainImage);
                                                        context.drawImage(idolIcon, 55, 90, 540, 657);

                                                        const frame = await Canvas.loadImage('./img/cosmetics/frames/default_frame.png')
                                                        context.drawImage(frame, 25, 15, 600, 900);

                                                        if (cardList[i].hueApplied) {


                                                            if (cardList[i].topHueBar.length >= 1 && cardList[i].bottomHueBar.length < 1) {
                                                                if (cardList[i].topHueBar.length > 1) {

                                                                    var gradient = context.createLinearGradient(((1 / cardList[i].topHueBar.length) * 100), 887, (600 - ((1 / cardList[i].topHueBar.length) * 100)), 887);


                                                                    context.fillStyle = "" + cardList[i].topHueBar[0];
                                                                    context.fillRect(25, 15, 6, 121);

                                                                    for (j = 0; j < cardList[i].topHueBar.length; j++) {
                                                                        gradient.addColorStop(j * (1 / (cardList[i].topHueBar.length - 1)), cardList[i].topHueBar[j]);
                                                                    }

                                                                    context.fillStyle = gradient;
                                                                    context.fillRect(25, 15, 600, 6);


                                                                    context.fillStyle = "" + cardList[i].topHueBar[cardList[i].topHueBar.length - 1];
                                                                    context.fillRect(619, 15, 6, 121);

                                                                    embedColor = "" + cardList[i].topHueBar[0];

                                                                } else {


                                                                    context.fillStyle = "" + cardList[i].topHueBar[0];
                                                                    context.fillRect(25, 15, 6, 121);
                                                                    context.fillStyle = "" + cardList[i].topHueBar[0];
                                                                    context.fillRect(25, 15, 600, 6);
                                                                    context.fillStyle = "" + cardList[i].topHueBar[0];
                                                                    context.fillRect(619, 15, 6, 121);

                                                                }
                                                            } else if (cardList[i].topHueBar.length < 1 && cardList[i].bottomHueBar.length >= 1) {

                                                                if (cardList[i].bottomHueBar.length > 1) {


                                                                    var gradient = context.createLinearGradient(((1 / cardList[i].bottomHueBar.length) * 100), 887, (600 - ((1 / cardList[i].bottomHueBar.length) * 100)), 887);

                                                                    for (j = 0; j < cardList[i].bottomHueBar.length; j++) {
                                                                        gradient.addColorStop(j * (1 / (cardList[i].bottomHueBar.length - 1)), cardList[i].bottomHueBar[j]);
                                                                    }

                                                                    context.fillStyle = gradient;
                                                                    context.fillRect(25, 902, 600, 13);


                                                                } else {

                                                                    context.fillStyle = "" + cardList[i].bottomHueBar[0];
                                                                    context.fillRect(25, 902, 600, 13);

                                                                }

                                                            } else {

                                                                if (cardList[i].topHueBar.length > 1) {

                                                                    var gradient = context.createLinearGradient(((1 / cardList[i].topHueBar.length) * 100), 887, (600 - ((1 / cardList[i].topHueBar.length) * 100)), 887);


                                                                    context.fillStyle = "" + cardList[i].topHueBar[0];
                                                                    context.fillRect(25, 15, 6, 121);

                                                                    for (j = 0; j < cardList[i].topHueBar.length; j++) {
                                                                        gradient.addColorStop(j * (1 / (cardList[i].topHueBar.length - 1)), cardList[i].topHueBar[j]);
                                                                    }

                                                                    context.fillStyle = gradient;
                                                                    context.fillRect(25, 15, 600, 6);


                                                                    context.fillStyle = "" + cardList[i].topHueBar[cardList[i].topHueBar.length - 1];
                                                                    context.fillRect(619, 15, 6, 121);

                                                                } else {


                                                                    context.fillStyle = "" + cardList[i].topHueBar[0];
                                                                    context.fillRect(25, 15, 6, 121);
                                                                    context.fillStyle = "" + cardList[i].topHueBar[0];
                                                                    context.fillRect(25, 15, 600, 6);
                                                                    context.fillStyle = "" + cardList[i].topHueBar[0];
                                                                    context.fillRect(619, 15, 6, 121);

                                                                    embedColor = "" + cardList[i].topHueBar[0];

                                                                }

                                                                if (cardList[i].bottomHueBar.length > 1) {
                                                                    var gradient = context.createLinearGradient(((1 / cardList[i].bottomHueBar.length) * 100), 887, (600 - ((1 / cardList[i].bottomHueBar.length) * 100)), 887);

                                                                    for (j = 0; j < cardList[i].bottomHueBar.length; j++) {
                                                                        gradient.addColorStop(j * (1 / (cardList[i].bottomHueBar.length - 1)), cardList[i].bottomHueBar[j]);
                                                                    }

                                                                    context.fillStyle = gradient;
                                                                    context.fillRect(25, 902, 600, 13);

                                                                } else {

                                                                    context.fillStyle = "" + cardList[i].bottomHueBar[0];
                                                                    context.fillRect(25, 902, 600, 13);

                                                                }

                                                            }
                                                        }



                                                        if (cardList[i].name == "Group") {

                                                            context.font = '50px "Prompt-Bold"';
                                                            context.textAlign = "right";
                                                            context.fillStyle = "#FFFFFF";
                                                            let groupName = (cardList[i].group).toUpperCase();
                                                            context.fillText(groupName, 590, 820);


                                                            context.font = '32px "Prompt-Medium"';
                                                            context.textAlign = "right";
                                                            context.fillStyle = "#FFFFFF";
                                                            let group = (cardList[i].name).toUpperCase();
                                                            context.fillText(group, 590, 850);



                                                        } else {

                                                            context.font = '50px "Prompt-Bold"';
                                                            context.textAlign = "right";
                                                            context.fillStyle = "#FFFFFF";
                                                            let idolName = (cardList[i].name).toUpperCase();
                                                            context.fillText(idolName, 590, 820);

                                                            context.font = '32px "Prompt-Medium"';
                                                            context.textAlign = "right";
                                                            context.fillStyle = "#FFFFFF";
                                                            let groupName = (cardList[i].group).toUpperCase();
                                                            context.fillText(groupName, 590, 850);


                                                        }

                                                        context.font = '40px "Prompt"';
                                                        context.textAlign = "left";
                                                        context.fillStyle = "#FFFFFF";
                                                        let issueNum = ("Issue " + cardList[i].issue).toUpperCase();
                                                        context.fillText(issueNum, 55, 70);

                                                        const icon = await Canvas.loadImage(cardList[i].icon);
                                                        context.drawImage(icon, 59, 762, 138, 121);

                                                        const barcode = await Canvas.loadImage('./img/cosmetics/misc/bar code.png')
                                                        context.drawImage(barcode, 502, 36, 90, 40);

                                                    }


                                                } else {
                                                    if (cardList[i] != "Empty") {
                                                        const idolIcon = await Canvas.loadImage(cardList[i].mainImage);
                                                        context.drawImage(idolIcon, (640 * i) + 55, 90, 540, 657);

                                                        const frame = await Canvas.loadImage('./img/cosmetics/frames/default_frame.png')
                                                        context.drawImage(frame, (640 * i) + 25, 15, 600, 900);

                                                        if (cardList[i].hueApplied) {


                                                            if (cardList[i].topHueBar.length >= 1 && cardList[i].bottomHueBar.length < 1) {
                                                                if (cardList[i].topHueBar.length > 1) {

                                                                    var gradient = context.createLinearGradient(((640 * i) + 25 + (1 / cardList[i].topHueBar.length) * 100), 887, (640 * i) + 25 + (600 - ((1 / cardList[i].topHueBar.length) * 100)), 887);


                                                                    context.fillStyle = "" + cardList[i].topHueBar[0];
                                                                    context.fillRect((640 * i) + 25, 15, 6, 121);

                                                                    for (j = 0; j < cardList[i].topHueBar.length; j++) {
                                                                        gradient.addColorStop(j * (1 / (cardList[i].topHueBar.length - 1)), cardList[i].topHueBar[j]);
                                                                    }

                                                                    context.fillStyle = gradient;
                                                                    context.fillRect((640 * i) + 25, 15, 600, 6);


                                                                    context.fillStyle = "" + cardList[i].topHueBar[cardList[i].topHueBar.length - 1];
                                                                    context.fillRect((640 * i) + 619, 15, 6, 121);

                                                                    embedColor = "" + cardList[i].topHueBar[0];

                                                                } else {


                                                                    context.fillStyle = "" + cardList[i].topHueBar[0];
                                                                    context.fillRect((640 * i) + 25, 15, 6, 121);
                                                                    context.fillStyle = "" + cardList[i].topHueBar[0];
                                                                    context.fillRect((640 * i) + 25, 15, 600, 6);
                                                                    context.fillStyle = "" + cardList[i].topHueBar[0];
                                                                    context.fillRect((640 * i) + 619, 15, 6, 121);

                                                                }
                                                            } else if (cardList[i].topHueBar.length < 1 && cardList[i].bottomHueBar.length >= 1) {

                                                                if (cardList[i].bottomHueBar.length > 1) {


                                                                    var gradient = context.createLinearGradient(((640 * i) + 25 + (1 / cardList[i].bottomHueBar.length) * 100), 887, (640 * i) + 25 + (600 - ((1 / cardList[i].bottomHueBar.length) * 100)), 887);

                                                                    for (j = 0; j < cardList[i].bottomHueBar.length; j++) {
                                                                        gradient.addColorStop(j * (1 / (cardList[i].bottomHueBar.length - 1)), cardList[i].bottomHueBar[j]);
                                                                    }

                                                                    context.fillStyle = gradient;
                                                                    context.fillRect((640 * i) + 25, 902, 600, 13);


                                                                } else {

                                                                    context.fillStyle = "" + cardList[i].bottomHueBar[0];
                                                                    context.fillRect((640 * i) + 25, 902, 600, 13);

                                                                }

                                                            } else {

                                                                if (cardList[i].topHueBar.length > 1) {

                                                                    var gradient = context.createLinearGradient(((640 * i) + 25 + (1 / cardList[i].topHueBar.length) * 100), 887, (640 * i) + 25 + (600 - ((1 / cardList[i].topHueBar.length) * 100)), 887);


                                                                    context.fillStyle = "" + cardList[i].topHueBar[0];
                                                                    context.fillRect((640 * i) + 25, 15, 6, 121);

                                                                    for (j = 0; j < cardList[i].topHueBar.length; j++) {
                                                                        gradient.addColorStop(j * (1 / (cardList[i].topHueBar.length - 1)), cardList[i].topHueBar[j]);
                                                                    }

                                                                    context.fillStyle = gradient;
                                                                    context.fillRect((640 * i) + 25, 15, 600, 6);


                                                                    context.fillStyle = "" + cardList[i].topHueBar[cardList[i].topHueBar.length - 1];
                                                                    context.fillRect((640 * i) + 619, 15, 6, 121);

                                                                } else {


                                                                    context.fillStyle = "" + cardList[i].topHueBar[0];
                                                                    context.fillRect((640 * i) + 25, 15, 6, 121);
                                                                    context.fillStyle = "" + cardList[i].topHueBar[0];
                                                                    context.fillRect((640 * i) + 25, 15, 600, 6);
                                                                    context.fillStyle = "" + cardList[i].topHueBar[0];
                                                                    context.fillRect((640 * i) + 619, 15, 6, 121);

                                                                }

                                                                if (cardList[i].bottomHueBar.length > 1) {
                                                                    var gradient = context.createLinearGradient(((640 * i) + 25 + (1 / cardList[i].bottomHueBar.length) * 100), 887, (640 * i) + 25 + (600 - ((1 / cardList[i].bottomHueBar.length) * 100)), 887);

                                                                    for (j = 0; j < cardList[i].bottomHueBar.length; j++) {
                                                                        gradient.addColorStop(j * (1 / (cardList[i].bottomHueBar.length - 1)), cardList[i].bottomHueBar[j]);
                                                                    }

                                                                    context.fillStyle = gradient;
                                                                    context.fillRect((640 * i) + 25, 902, 600, 13);

                                                                } else {

                                                                    context.fillStyle = "" + cardList[i].bottomHueBar[0];
                                                                    context.fillRect((640 * i) + 25, 902, 600, 13);

                                                                }

                                                            }



                                                            if (cardList[i].name == "Group") {

                                                                context.font = '50px "Prompt-Bold"';
                                                                context.textAlign = "right";
                                                                context.fillStyle = "#FFFFFF";
                                                                let groupName = (cardList[i].group).toUpperCase();
                                                                context.fillText(groupName, (640 * i) + 590, 820);


                                                                context.font = '32px "Prompt-Medium"';
                                                                context.textAlign = "right";
                                                                context.fillStyle = "#FFFFFF";
                                                                let group = (cardList[i].name).toUpperCase();
                                                                context.fillText(group, (640 * i) + 590, 850);



                                                            } else {

                                                                context.font = '50px "Prompt-Bold"';
                                                                context.textAlign = "right";
                                                                context.fillStyle = "#FFFFFF";
                                                                let idolName = (cardList[i].name).toUpperCase();
                                                                context.fillText(idolName, (640 * i) + 590, 820);

                                                                context.font = '32px "Prompt-Medium"';
                                                                context.textAlign = "right";
                                                                context.fillStyle = "#FFFFFF";
                                                                let groupName = (cardList[i].group).toUpperCase();
                                                                context.fillText(groupName, (640 * i) + 590, 850);


                                                            }

                                                            context.font = '40px "Prompt"';
                                                            context.textAlign = "left";
                                                            context.fillStyle = "#FFFFFF";
                                                            let issueNum = ("Issue " + cardList[i].issue).toUpperCase();
                                                            context.fillText(issueNum, (640 * i) + 57, 70);

                                                            const icon = await Canvas.loadImage(cardList[i].icon);
                                                            context.drawImage(icon, (640 * i) + 59, 762, 138, 121);

                                                            const barcode = await Canvas.loadImage('./img/cosmetics/misc/bar code.png')
                                                            context.drawImage(barcode, (640 * i) + 502, 36, 90, 40);

                                                        }


                                                    }
                                                }
                                            } else if (i >= 4 && i < 8) {

                                                if (i == 4) {
                                                    if (cardList[i] != "Empty") {

                                                        const idolIcon = await Canvas.loadImage(cardList[i].mainImage);
                                                        context.drawImage(idolIcon, 55, 90 + 930, 540, 657);

                                                        const frame = await Canvas.loadImage('./img/cosmetics/frames/default_frame.png')
                                                        context.drawImage(frame, 25, 15 + 930, 600, 900);

                                                        if (cardList[i].hueApplied) {


                                                            if (cardList[i].topHueBar.length >= 1 && cardList[i].bottomHueBar.length < 1) {
                                                                if (cardList[i].topHueBar.length > 1) {

                                                                    var gradient = context.createLinearGradient(((1 / cardList[i].topHueBar.length) * 100), 887 + 930, (600 - ((1 / cardList[i].topHueBar.length) * 100)), 887 + 930);


                                                                    context.fillStyle = "" + cardList[i].topHueBar[0];
                                                                    context.fillRect(25, 15 + 930, 6, 121);

                                                                    for (j = 0; j < cardList[i].topHueBar.length; j++) {
                                                                        gradient.addColorStop(j * (1 / (cardList[i].topHueBar.length - 1)), cardList[i].topHueBar[j]);
                                                                    }

                                                                    context.fillStyle = gradient;
                                                                    context.fillRect(25, 15 + 930, 600, 6);


                                                                    context.fillStyle = "" + cardList[i].topHueBar[cardList[i].topHueBar.length - 1];
                                                                    context.fillRect(619, 15 + 930, 6, 121);

                                                                    embedColor = "" + cardList[i].topHueBar[0];

                                                                } else {


                                                                    context.fillStyle = "" + cardList[i].topHueBar[0];
                                                                    context.fillRect(25, 15 + 930, 6, 121);
                                                                    context.fillStyle = "" + cardList[i].topHueBar[0];
                                                                    context.fillRect(25, 15 + 930, 600, 6);
                                                                    context.fillStyle = "" + cardList[i].topHueBar[0];
                                                                    context.fillRect(619, 15 + 930, 6, 121);

                                                                }
                                                            } else if (cardList[i].topHueBar.length < 1 && cardList[i].bottomHueBar.length >= 1) {

                                                                if (cardList[i].bottomHueBar.length > 1) {


                                                                    var gradient = context.createLinearGradient(((1 / cardList[i].bottomHueBar.length) * 100), 887 + 930, (600 - ((1 / cardList[i].bottomHueBar.length) * 100)), 887 + 930);

                                                                    for (j = 0; j < cardList[i].bottomHueBar.length; j++) {
                                                                        gradient.addColorStop(j * (1 / (cardList[i].bottomHueBar.length - 1)), cardList[i].bottomHueBar[j]);
                                                                    }

                                                                    context.fillStyle = gradient;
                                                                    context.fillRect(25, 902 + 930, 600, 13);


                                                                } else {

                                                                    context.fillStyle = "" + cardList[i].bottomHueBar[0];
                                                                    context.fillRect(25, 902 + 930, 600, 13);

                                                                }

                                                            } else {

                                                                if (cardList[i].topHueBar.length > 1) {

                                                                    var gradient = context.createLinearGradient(((1 / cardList[i].topHueBar.length) * 100), 887 + 930, (600 - ((1 / cardList[i].topHueBar.length) * 100)), 887 + 930);


                                                                    context.fillStyle = "" + cardList[i].topHueBar[0];
                                                                    context.fillRect(25, 15 + 930, 6, 121);

                                                                    for (j = 0; j < cardList[i].topHueBar.length; j++) {
                                                                        gradient.addColorStop(j * (1 / (cardList[i].topHueBar.length - 1)), cardList[i].topHueBar[j]);
                                                                    }

                                                                    context.fillStyle = gradient;
                                                                    context.fillRect(25, 15 + 930, 600, 6);


                                                                    context.fillStyle = "" + cardList[i].topHueBar[cardList[i].topHueBar.length - 1];
                                                                    context.fillRect(619, 15 + 930, 6, 121);

                                                                } else {


                                                                    context.fillStyle = "" + cardList[i].topHueBar[0];
                                                                    context.fillRect(25, 15 + 930, 6, 121);
                                                                    context.fillStyle = "" + cardList[i].topHueBar[0];
                                                                    context.fillRect(25, 15 + 930, 600, 6);
                                                                    context.fillStyle = "" + cardList[i].topHueBar[0];
                                                                    context.fillRect(619, 15 + 930, 6, 121);

                                                                    embedColor = "" + cardList[i].topHueBar[0];

                                                                }

                                                                if (cardList[i].bottomHueBar.length > 1) {
                                                                    var gradient = context.createLinearGradient(((1 / cardList[i].bottomHueBar.length) * 100), 887 + 930, (600 - ((1 / cardList[i].bottomHueBar.length) * 100)), 887 + 930);

                                                                    for (j = 0; j < cardList[i].bottomHueBar.length; j++) {
                                                                        gradient.addColorStop(j * (1 / (cardList[i].bottomHueBar.length - 1)), cardList[i].bottomHueBar[j]);
                                                                    }

                                                                    context.fillStyle = gradient;
                                                                    context.fillRect(25, 902 + 930, 600, 13);

                                                                } else {

                                                                    context.fillStyle = "" + cardList[i].bottomHueBar[0];
                                                                    context.fillRect(25, 902 + 930, 600, 13);

                                                                }

                                                            }
                                                        }

                                                        if (cardList[i].name == "Group") {

                                                            context.font = '50px "Prompt-Bold"';
                                                            context.textAlign = "right";
                                                            context.fillStyle = "#FFFFFF";
                                                            let groupName = (cardList[i].group).toUpperCase();
                                                            context.fillText(groupName, (640 * (i - 4)) + 590, 820 + 930);


                                                            context.font = '32px "Prompt-Medium"';
                                                            context.textAlign = "right";
                                                            context.fillStyle = "#FFFFFF";
                                                            let group = (cardList[i].name).toUpperCase();
                                                            context.fillText(group, (640 * (i - 4)) + 590, 850 + 930);



                                                        } else {

                                                            context.font = '50px "Prompt-Bold"';
                                                            context.textAlign = "right";
                                                            context.fillStyle = "#FFFFFF";
                                                            let idolName = (cardList[i].name).toUpperCase();
                                                            context.fillText(idolName, (640 * (i - 4)) + 590, 820 + 930);

                                                            context.font = '32px "Prompt-Medium"';
                                                            context.textAlign = "right";
                                                            context.fillStyle = "#FFFFFF";
                                                            let groupName = (cardList[i].group).toUpperCase();
                                                            context.fillText(groupName, (640 * (i - 4)) + 590, 850 + 930);


                                                        }

                                                        context.font = '40px "Prompt"';
                                                        context.textAlign = "left";
                                                        context.fillStyle = "#FFFFFF";
                                                        let issueNum = ("Issue " + cardList[i].issue).toUpperCase();
                                                        context.fillText(issueNum, (640 * (i - 4)) + 57, 70 + 930);

                                                        const icon = await Canvas.loadImage(cardList[i].icon);
                                                        context.drawImage(icon, (640 * (i - 4)) + 59, 762 + 930, 138, 121);

                                                        const barcode = await Canvas.loadImage('./img/cosmetics/misc/bar code.png')
                                                        context.drawImage(barcode, (640 * (i - 4)) + 502, 36 + 930, 90, 40);
                                                    } 
                                                } else {
                                                    if (cardList[i] != "Empty") {

                                                        const idolIcon = await Canvas.loadImage(cardList[i].mainImage);
                                                        context.drawImage(idolIcon, (640 * (i - 4)) + 55, 90 + 930, 540, 657);

                                                        const frame = await Canvas.loadImage('./img/cosmetics/frames/default_frame.png')
                                                        context.drawImage(frame, (640 * (i - 4)) + 25, 15 + 930, 600, 900);

                                                        if (cardList[i].hueApplied) {


                                                            if (cardList[i].topHueBar.length >= 1 && cardList[i].bottomHueBar.length < 1) {
                                                                if (cardList[i].topHueBar.length > 1) {

                                                                    var gradient = context.createLinearGradient(((640 * (i - 4)) + 25 + (1 / cardList[i].topHueBar.length) * 100), 887 + 930, (640 * (i - 4)) + 25 + (600 - ((1 / cardList[i].topHueBar.length) * 100)), 887 + 930);


                                                                    context.fillStyle = "" + cardList[i].topHueBar[0];
                                                                    context.fillRect((640 * (i - 4)) + 25, 15 + 930, 6, 121);

                                                                    for (j = 0; j < cardList[i].topHueBar.length; j++) {
                                                                        gradient.addColorStop(j * (1 / (cardList[i].topHueBar.length - 1)), cardList[i].topHueBar[j]);
                                                                    }

                                                                    context.fillStyle = gradient;
                                                                    context.fillRect((640 * (i - 4)) + 25, 15 + 930, 600, 6);


                                                                    context.fillStyle = "" + cardList[i].topHueBar[cardList[i].topHueBar.length - 1];
                                                                    context.fillRect((640 * (i - 4)) + 619, 15 + 930, 6, 121);

                                                                    embedColor = "" + cardList[i].topHueBar[0];

                                                                } else {


                                                                    context.fillStyle = "" + cardList[i].topHueBar[0];
                                                                    context.fillRect((640 * (i - 4)) + 25, 15 + 930, 6, 121);
                                                                    context.fillStyle = "" + cardList[i].topHueBar[0];
                                                                    context.fillRect((640 * (i - 4)) + 25, 15 + 930, 600, 6);
                                                                    context.fillStyle = "" + cardList[i].topHueBar[0];
                                                                    context.fillRect((640 * (i - 4)) + 619, 15 + 930, 6, 121);

                                                                }
                                                            } else if (cardList[i].topHueBar.length < 1 && cardList[i].bottomHueBar.length >= 1) {

                                                                if (cardList[i].bottomHueBar.length > 1) {


                                                                    var gradient = context.createLinearGradient(((640 * (i - 4)) + 25 + (1 / cardList[i].bottomHueBar.length) * 100), 887 + 930, (640 * (i - 4)) + 25 + (600 - ((1 / cardList[i].bottomHueBar.length) * 100)), 887 + 930);

                                                                    for (j = 0; j < cardList[i].bottomHueBar.length; j++) {
                                                                        gradient.addColorStop(j * (1 / (cardList[i].bottomHueBar.length - 1)), cardList[i].bottomHueBar[j]);
                                                                    }

                                                                    context.fillStyle = gradient;
                                                                    context.fillRect((640 * (i - 4)) + 25, 902 + 930, 600, 13);


                                                                } else {

                                                                    context.fillStyle = "" + cardList[i].bottomHueBar[0];
                                                                    context.fillRect((640 * (i - 4)) + 25, 902 + 930, 600, 13);

                                                                }

                                                            } else {

                                                                if (cardList[i].topHueBar.length > 1) {

                                                                    var gradient = context.createLinearGradient(((640 * (i - 4)) + 25 + (1 / cardList[i].topHueBar.length) * 100), 887 + 930, (640 * (i - 4)) + 25 + (600 - ((1 / cardList[i].topHueBar.length) * 100)), 887 + 930);


                                                                    context.fillStyle = "" + cardList[i].topHueBar[0];
                                                                    context.fillRect((640 * (i - 4)) + 25, 15 + 930, 6, 121);

                                                                    for (j = 0; j < cardList[i].topHueBar.length; j++) {
                                                                        gradient.addColorStop(j * (1 / (cardList[i].topHueBar.length - 1)), cardList[i].topHueBar[j]);
                                                                    }

                                                                    context.fillStyle = gradient;
                                                                    context.fillRect((640 * (i - 4)) + 25, 15 + 930, 600, 6);


                                                                    context.fillStyle = "" + cardList[i].topHueBar[cardList[i].topHueBar.length - 1];
                                                                    context.fillRect((640 * (i - 4)) + 619, 15 + 930, 6, 121);

                                                                } else {


                                                                    context.fillStyle = "" + cardList[i].topHueBar[0];
                                                                    context.fillRect((640 * (i - 4)) + 25, 15 + 930, 6, 121);
                                                                    context.fillStyle = "" + cardList[i].topHueBar[0];
                                                                    context.fillRect((640 * (i - 4)) + 25, 15 + 930, 600, 6);
                                                                    context.fillStyle = "" + cardList[i].topHueBar[0];
                                                                    context.fillRect((640 * (i - 4)) + 619, 15 + 930, 6, 121);

                                                                }

                                                                if (cardList[i].bottomHueBar.length > 1) {
                                                                    var gradient = context.createLinearGradient(((640 * (i - 4)) + 25 + (1 / cardList[i].bottomHueBar.length) * 100), 887 + 930, (640 * (i - 4)) + 25 + (600 - ((1 / cardList[i].bottomHueBar.length) * 100)), 887 + 930);

                                                                    for (j = 0; j < cardList[i].bottomHueBar.length; j++) {
                                                                        gradient.addColorStop(j * (1 / (cardList[i].bottomHueBar.length - 1)), cardList[i].bottomHueBar[j]);
                                                                    }

                                                                    context.fillStyle = gradient;
                                                                    context.fillRect((640 * (i - 4)) + 25, 902 + 930, 600, 13);

                                                                } else {

                                                                    context.fillStyle = "" + cardList[i].bottomHueBar[0];
                                                                    context.fillRect((640 * (i - 4)) + 25, 902 + 930, 600, 13);

                                                                }

                                                            }
                                                        }


                                                        if (cardList[i].name == "Group") {

                                                            context.font = '50px "Prompt-Bold"';
                                                            context.textAlign = "right";
                                                            context.fillStyle = "#FFFFFF";
                                                            let groupName = (cardList[i].group).toUpperCase();
                                                            context.fillText(groupName, (640 * i) + 590, 820 + 930);


                                                            context.font = '32px "Prompt-Medium"';
                                                            context.textAlign = "right";
                                                            context.fillStyle = "#FFFFFF";
                                                            let group = (cardList[i].name).toUpperCase();
                                                            context.fillText(group, (640 * (i - 4)) + 590, 850 + 930);



                                                        } else {

                                                            context.font = '50px "Prompt-Bold"';
                                                            context.textAlign = "right";
                                                            context.fillStyle = "#FFFFFF";
                                                            let idolName = (cardList[i].name).toUpperCase();
                                                            context.fillText(idolName, (640 * (i - 4)) + 590, 820 + 930);

                                                            context.font = '32px "Prompt-Medium"';
                                                            context.textAlign = "right";
                                                            context.fillStyle = "#FFFFFF";
                                                            let groupName = (cardList[i].group).toUpperCase();
                                                            context.fillText(groupName, (640 * (i - 4)) + 590, 850 + 930);


                                                        }

                                                        context.font = '40px "Prompt"';
                                                        context.textAlign = "left";
                                                        context.fillStyle = "#FFFFFF";
                                                        let issueNum = ("Issue " + cardList[i].issue).toUpperCase();
                                                        context.fillText(issueNum, (640 * (i - 4)) + 57, 70 + 930);

                                                        const icon = await Canvas.loadImage(cardList[i].icon);
                                                        context.drawImage(icon, (640 * (i - 4)) + 59, 762 + 930, 138, 121);

                                                        const barcode = await Canvas.loadImage('./img/cosmetics/misc/bar code.png')
                                                        context.drawImage(barcode, (640 * (i - 4)) + 502, 36 + 930, 90, 40);


                                                    }
                                                }
                                            }
                                        }

                                        const buffer = canvas.toBuffer();
                                        const attachment = { file: buffer, name: "cards.png" };

                                        const magazineView = new Eris.RichEmbed()
                                            .setTitle('' + chosenMag[0].name.toUpperCase() + " MAGAZINE")
                                            .setDescription(desc)
                                            .setColor(color)
                                            .setImage("attachment://cards.png")
                                            .setFooter("A digital visualization by " + chosenMag[0].creatorName + `#${chosenMag[0].creatorDiscrim} | ` + mags[0].numSubbed + " " + checkUserCount)
                                        message.channel.createMessage({ embed: magazineView }, attachment);
                                    } else {
                                        const magazineView = new Eris.RichEmbed()
                                            .setTitle('' + chosenMag[0].name.toUpperCase() + " MAGAZINE")
                                            .setDescription(desc)
                                            .setColor(color)
                                            .setFooter("A digital visualization by " + chosenMag[0].creatorName + `#${chosenMag[0].creatorDiscrim} | ` + mags[0].numSubbed + " " + checkUserCount)
                                        message.channel.createMessage({ embed: magazineView });
                                    }

                                })
                            })
                        }
                    })

                })
            })
        })
    }
}