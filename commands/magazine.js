const magazine = require('../models/magazine.js');
const user = require('../models/user.js');
const claimedCards = require('../models/claimedCards.js');

const Canvas = require('canvas');

const { registerFont } = require('canvas');

registerFont('./fonts/Prompt-Bold.ttf', { family: 'Prompt-Bold' })
registerFont('./fonts/Prompt-Medium.ttf', { family: 'Prompt-Medium' })
registerFont('./fonts/Prompt-Regular.ttf', { family: 'Prompt' })

module.exports = {
    name: 'magazine',
    description: "Displays a user's magazine",
    aliases: ["m", "magazine", "mag"],
    async execute(client, message, args, Eris) {

        const creator = message.member.user;

        var color = "";
        var desc = "";

        var actualCard = false;



        magazine.findOne({
            creator: creator.id
        }, (err, mag) => {

            if (mag != undefined && mag != null) {

                if (mag.creatorDiscrim != creator.discriminator) {
                    mag.creatorDiscrim = creator.discriminator
                } else if (mag.creatorName != creator.username) {
                    mag.creatorName = creator.username
                }

                mag.save()
            }

        }).then(magazine => {

            if (magazine != undefined) {


                var checkUserCount = "";


                if (magazine.numSubbed == 1) {
                    checkUserCount += "subscriber"
                } else {
                    checkUserCount += "subscribers"
                }

                if (magazine.color != "") {
                    color += "" + magazine.color

                } else {
                    color += "#33A7FF"
                }

                if (magazine.description != "") {
                    desc += "" + magazine.description

                } else {
                    desc += ""
                }

                if (magazine.cards != undefined) {

                    if (magazine.cards.length >= 1) {


                        claimedCards.find({
                            code: { $in: magazine.cards }
                        }, (err, cards) => {
                        }).then(async cards => {

                            if (cards != undefined) {

                                //fill card list array with empty in beginning
                                const cardList = Array.from({ length: 8 }).fill("Empty")
                                const indexTracker = []
                                var secRow = false

                                //go over cards list
                                for (i = 0; i < cards.length; i++) {
                                    //add the cards[j] in place magazine.cards.indexOf(cards[j])
                                    cardList[magazine.cards.indexOf(cards[i].code)] = cards[i]

                                }


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

                                    if (desc != "" && actualCard && magazine.name != "") {

                                        const magazineView = new Eris.RichEmbed()
                                            .setTitle('' + magazine.name.toUpperCase() + " MAGAZINE")
                                            .setDescription(desc)
                                            .setColor(color)
                                            .setImage("attachment://cards.png")
                                            .setFooter("A digital visualization by " + creator.username + `#${creator.discriminator} | ` + magazine.numSubbed + " " + checkUserCount)
                                        message.channel.createMessage({ embed: magazineView }, attachment);

                                    } else if (desc == "" && actualCard && magazine.name != "") {
                                        const magazineView = new Eris.RichEmbed()
                                            .setTitle('' + magazine.name.toUpperCase() + " MAGAZINE")
                                            .setDescription("Add a description with the magdesc command.")
                                            .setColor(color)
                                            .setImage("attachment://cards.png")
                                            .setFooter("A digital visualization by " + creator.username + `#${creator.discriminator} | ` + magazine.numSubbed + " " + checkUserCount)
                                        message.channel.createMessage({ embed: magazineView }, attachment);

                                    } else if (desc == "" && actualCard && magazine.name == "") {
                                        const magazineView = new Eris.RichEmbed()
                                            .setTitle('' + magazine.name.toUpperCase() + " MAGAZINE")
                                            .setDescription("Name your magazine with the magname command.\nAdd a description with the magdesc command. \n")
                                            .setColor(color)
                                            .setImage("attachment://cards.png")
                                            .setFooter("A digital visualization by " + creator.username + `#${creator.discriminator} | ` + magazine.numSubbed + " " + checkUserCount)
                                        message.channel.createMessage({ embed: magazineView }, attachment);


                                    } else if (desc != "" && actualCard && magazine.name != "") {

                                        const magazineView = new Eris.RichEmbed()
                                            .setTitle('' + magazine.name.toUpperCase() + " MAGAZINE")
                                            .setDescription(desc + "\n\nName your magazine with the magname command.")
                                            .setColor(color)
                                            .setImage("attachment://cards.png")
                                            .setFooter("A digital visualization by " + creator.username + `#${creator.discriminator} | ` + magazine.numSubbed + " " + checkUserCount)
                                        message.channel.createMessage({ embed: magazineView }, attachment);

                                    }

                                } else {

                                    if (desc != "" && magazine.name != "") {
                                        const magazineView = new Eris.RichEmbed()
                                            .setTitle('' + magazine.name.toUpperCase() + " MAGAZINE")
                                            .setDescription('' + desc + '\n\nAdd cards to the magazine with the addcard [slot] [card code] command.')
                                            .setColor(color)
                                            .setFooter("A digital visualization by " + creator.username + `#${creator.discriminator} | ` + magazine.numSubbed + " " + checkUserCount)
                                        message.channel.createMessage({ embed: magazineView });
                                    } else if (desc == "" && magazine.name == "") {
                                        const magazineView = new Eris.RichEmbed()
                                            .setTitle('' + magazine.name.toUpperCase() + " MAGAZINE")
                                            .setDescription('Name your magazine with the magname command.\nAdd a description with the magdesc command. \nAdd cards to the magazine with the addcard [slot] [card code] command.')
                                            .setColor(color)
                                            .setFooter("A digital visualization by " + creator.username + `#${creator.discriminator} | ` + magazine.numSubbed + " " + checkUserCount)
                                        message.channel.createMessage({ embed: magazineView });

                                    } else if (desc != "" && magazine.name == "") {
                                        const magazineView = new Eris.RichEmbed()
                                            .setTitle('' + magazine.name.toUpperCase() + " MAGAZINE")
                                            .setDescription(desc + '\n\nName your magazine with the magname command.\nAdd cards to the magazine with the addcard [slot] [card code] command.')
                                            .setColor(color)
                                            .setFooter("A digital visualization by " + creator.username + `#${creator.discriminator} | ` + magazine.numSubbed + " " + checkUserCount)
                                        message.channel.createMessage({ embed: magazineView });
                                    } else if (desc == "" && magazine.name != "") {
                                        const magazineView = new Eris.RichEmbed()
                                            .setTitle('' + magazine.name.toUpperCase() + " MAGAZINE")
                                            .setDescription('Add a description with the magdesc command.\n')
                                            .setColor(color)
                                            .setFooter("A digital visualization by " + creator.username + `#${creator.discriminator} | ` + magazine.numSubbed + " " + checkUserCount)
                                        message.channel.createMessage({ embed: magazineView });
                                    }

                                }
                            }
                        })

                    } else {
                        if (desc != "" && magazine.name != "") {
                            const magazineView = new Eris.RichEmbed()
                                .setTitle('' + magazine.name.toUpperCase() + " MAGAZINE")
                                .setDescription(desc + '\n\nAdd cards to the magazine with the addtomag / addcard [slot] [card code] command.')
                                .setColor(color)
                                .setFooter("A digital visualization by " + creator.username + `#${creator.discriminator} | ` + magazine.numSubbed + " " + checkUserCount)
                            message.channel.createMessage({ embed: magazineView });
                        } else if (desc == "" && magazine.name == "") {
                            const magazineView = new Eris.RichEmbed()
                                .setTitle('' + magazine.name.toUpperCase() + " MAGAZINE")
                                .setDescription('Name your magazine with the magname command.\nAdd a description with the magdesc command. \nAdd cards to the magazine with the addtomag / addcard [slot] [card code] command.')
                                .setColor(color)
                                .setFooter("A digital visualization by " + creator.username + `#${creator.discriminator} | ` + magazine.numSubbed + " " + checkUserCount)
                            message.channel.createMessage({ embed: magazineView });

                        } else if (desc != "" && magazine.name == "") {
                            const magazineView = new Eris.RichEmbed()
                                .setTitle('' + magazine.name.toUpperCase() + " MAGAZINE")
                                .setDescription('Name your magazine with the magname command.\nAdd a description with the magdesc command. \nAdd cards to the magazine with the addtomag / addcard [slot] [card code] command.')
                                .setColor(color)
                                .setFooter("A digital visualization by " + creator.username + `#${creator.discriminator} | ` + magazine.numSubbed + " " + checkUserCount)
                            message.channel.createMessage({ embed: magazineView });
                        } else if (desc == "" && magazine.name != "") {
                            const magazineView = new Eris.RichEmbed()
                                .setTitle('' + magazine.name.toUpperCase() + " MAGAZINE")
                                .setDescription('Add a description with the magdesc command. \nAdd cards to the magazine with the addtomag / addcard [slot] [card code] command.')
                                .setColor(color)
                                .setFooter("A digital visualization by " + creator.username + `#${creator.discriminator} | ` + magazine.numSubbed + " " + checkUserCount)
                            message.channel.createMessage({ embed: magazineView });
                        }

                    }
                }
            } else {

                const magazineView = new Eris.RichEmbed()
                    .setTitle("")
                    .setDescription('You must purchase a magazine from the shop first.')
                message.channel.createMessage({ embed: magazineView });

            }
        })
    }
}

