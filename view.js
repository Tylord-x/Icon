const Discord = require('discord.js');
const { registerFont } = require('canvas');
const Canvas = require('canvas');

const fs = require('fs');

registerFont('./prompt-bold.ttf', { family: 'Prompt-Bold' })
registerFont('./prompt-medium.ttf', { family: 'Prompt-Medium' })
registerFont('./prompt-regular.ttf', { family: 'Prompt' })

module.exports.run = async(message, args, Discord) => {


    const canvas = Canvas.createCanvas(600, 900);
    const context = canvas.getContext('2d');
    const background = await Canvas.loadImage('transparent.png');
    context.drawImage(background, 0, 0, canvas.width, canvas.height);



 /* Image Generation: Takes all the images in the folder and randomizes them
  */
  let card_img_folder = "img/idol_cards/";
  let icon_img_folder = "img/idol_icons/";


  var cardFolder = fs.readdirSync(card_img_folder);

  let artistFolders = [];


  for (let i = 0; i < cardFolder.length; i++) {
      artistFolders.push(cardFolder[i]);
  }

  // Chosen Artist : Chooses an artist from one of the artist folders. This then points inside one of the chosen artist folders
  // to find the era folders.

  let artistChosen = artistFolders[Math.floor(Math.random() * artistFolders.length)];
  var artistFolder = fs.readdirSync(card_img_folder + '' + artistChosen + '/');


  // Chosen Era : Puts all of the eras of an artist into an array. The eras are randomized and one is selected.
  // Points to the members of the chosen artist group within the particular era.

  let era = [];

  for (let i = 0; i < artistFolder.length; i++) {
     era.push(artistFolder[i]);
  }

  let eraRand = Math.floor(Math.random() * era.length);

  let eraChosen = era[eraRand];
  var eraFolder = fs.readdirSync(card_img_folder + '' + artistChosen + '/' + eraChosen + '/');

  // Chosen Member : Finds the members of a particular group and era. It then randomly selects one of the members.

  let idol = [];

  for (let i = 0; i < eraFolder.length; i++) {
    idol.push(eraFolder[i]);
  }

  let idolRand = Math.floor(Math.random() * idol.length);
  let idolChosen = idol[idolRand];

  // Card : Gets the needed information from the first card

  let card = idolChosen;

  let nameIdol = card.split('_')[0];
  let nameGroup = card.split('_')[1];
  nameGroup = nameGroup.replace('.png', '');

  let nameEra = eraChosen;

   /* Specifies the card a user wants
     */

  
    /*Idol Pictures: Contains the pictures of the featured artists
     */
  
    const idolCard = await Canvas.loadImage(card_img_folder + '' + nameGroup + '/' + nameEra + '/' + nameIdol + '_' + nameGroup + '.png');
    context.drawImage(idolCard, 30, 75, 540, 657);


    /* Frame: The frame of the card
     */


    const frame = await Canvas.loadImage('img/frame_two.png')
	context.drawImage(frame, 0, 0, 600, 900);

   


    if(args[3]) {

        context.fillStyle = "" + args[3];
        context.fillRect(0, 0, 3, 900);

        context.fillStyle = "" + args[3];
        context.fillRect(0, 0, 600, 3);

        context.fillStyle = "" + args[3];
        context.fillRect(0, 897, 600, 3);

        context.fillStyle = "" + args[3];
        context.fillRect(597, 0, 3, 900);

    } else {

        context.fillStyle = 0x0f0f0f;
        context.fillRect(0, 0, 2, 900);

        context.fillStyle = 0x0f0f0f;
        context.fillRect(0, 0, 600, 2);

        context.fillStyle = 0x0f0f0f;
        context.fillRect(0, 898, 600, 2);

        context.fillStyle = 0x0f0f0f;
        context.fillRect(598, 0, 2, 900);

    }

    let embedColor;

    if(args[3]) {
        embedColor = "" + args[3]
    } else {
        embedColor = 0x33A7FF;
    }


  
    /* Idol Information: Contains the information of each idol that is generated.
    */
  
  
    // First Idol: Appears at the left of the canvas
  
    context.font = '45px "Prompt-Bold"';
    context.textAlign = "right";
    context.fillStyle = "#FFFFFF";
    let idolName = (nameIdol).toUpperCase();
    context.fillText(idolName, 569, 810);
  
    context.font = '26px "Prompt-Medium"';
    context.textAlign = "right";
    context.fillStyle = "#FFFFFF";
    let groupName = (nameGroup).toUpperCase();
    context.fillText(groupName, 569, 838);

    let randIssue = Math.floor(Math.random() * (500 - 1 + 1)) + 1;
    context.font = '30px "Prompt"';
    context.textAlign = "left";
    context.fillStyle = "#FFFFFF";
    let issueNum = ("Issue " + randIssue).toUpperCase();
    context.fillText(issueNum, 35, 50);
     

    const barcode = await Canvas.loadImage('img/bar code.png')
	context.drawImage(barcode, 477, 20, 90, 40);

    /* Icon
     */

    

     const icon = await Canvas.loadImage(icon_img_folder + '' + nameGroup + '/' + nameEra + '/' + nameIdol + '_' + nameGroup + '.png');
     context.drawImage(icon, 35, 755, 138, 121);



    const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'bufferedfilename.png');

    


    const cardView = new Discord.MessageEmbed()
        .setColor(embedColor)
        .setTitle('' + nameIdol.toUpperCase())
        .addFields(
            {
                name: "Featured Artist",
                value: '' + nameIdol + ' of ' + nameGroup,
                inline: true
            },
            {
                name: "Issue number",
                value: "" + issueNum.split(" ")[1],
                inline: true
            },
            {
                name: "Era",
                value: nameEra,
            },
            {
                name: "Owner",
                value: message.author,
            }
        )
        .attachFiles(attachment)
        .setImage('attachment://bufferedfilename.png');

      

         message.channel.send({embed: cardView});

}

module.exports.config = {
    name: "view",
    aliases: [],
    usage: "-view"
}
