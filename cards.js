const Eris = require("eris");
const { registerFont } = require('canvas');
const Canvas = require('canvas');
const { MessageEmbed } = require(`helperis`);
const ReactionHandler = require('eris-reactions');

const fs = require('fs');
const { Console } = require("console");

const claimedCards = require('./models/claimedCards.js');
const cardInfo = require('./models/cardInfo.js');
var code = require('./cardCode.js');

registerFont('./Prompt-Bold.ttf', { family: 'Prompt-Bold' })
registerFont('./Prompt-Medium.ttf', { family: 'Prompt-Medium' })
registerFont('./Prompt-Regular.ttf', { family: 'Prompt' })

module.exports.execute = async (message, client) => {


  /*--------------------------------Generates the drop canvas and cards--------------------------------------------
  */



  const dropper = message.author.id;

  const canvas = Canvas.createCanvas(900, 430);
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

  /* First Card Generation
  */

  // First Chosen Artist : Chooses an artist from one of the artist folders. This then points inside one of the chosen artist folders
  // to find the era folders.

  let firstArtistChosen = artistFolders[Math.floor(Math.random() * artistFolders.length)];
  var firstArtistFolder = fs.readdirSync(card_img_folder + '' + firstArtistChosen + '/');


  // First Chosen Era : Puts all of the eras of an artist into an array. The eras are randomized and one is selected.
  // Points to the members of the chosen artist group within the particular era.

  let firstEra = [];

  for (let i = 0; i < firstArtistFolder.length; i++) {
    firstEra.push(firstArtistFolder[i]);
  }

  let firstEraRand = Math.floor(Math.random() * firstEra.length);

  let firstEraChosen = firstEra[firstEraRand];
  var firstEraFolder = fs.readdirSync(card_img_folder + '' + firstArtistChosen + '/' + firstEraChosen + '/');

  // First Chosen Member : Finds the members of a particular group and era. It then randomly selects one of the members.

  let firstIdol = [];

  for (let i = 0; i < firstEraFolder.length; i++) {
    firstIdol.push(firstEraFolder[i]);
  }

  let firstIdolRand = Math.floor(Math.random() * firstIdol.length);
  let firstIdolChosen = firstIdol[firstIdolRand];

  // First Card : Gets the needed information from the first card

  let firstCard = firstIdolChosen;

  let nameFirstIdol = firstCard.split('_')[0];
  let nameFirstGroup = firstCard.split('_')[1];
  nameFirstGroup = nameFirstGroup.replace('.png', '');

  let nameFirstEra = firstEraChosen;

  /* Second Card Generation
  */

  // Second Chosen Artist : Chooses an artist from one of the artist folders. This then points inside one of the chosen artist folders
  // to find the era folders.

  let secondArtistChosen = artistFolders[Math.floor(Math.random() * artistFolders.length)];
  var secondArtistFolder = fs.readdirSync(card_img_folder + '' + secondArtistChosen + '/');


  // Second Chosen Era : Puts all of the eras of an artist into an array. The eras are randomized and one is selected.
  // Points to the members of the chosen artist group within the particular era.

  let secondEra = [];

  for (let i = 0; i < secondArtistFolder.length; i++) {
    secondEra.push(secondArtistFolder[i]);
  }

  let secondEraRand = Math.floor(Math.random() * secondEra.length);

  let secondEraChosen = secondEra[secondEraRand];
  var secondEraFolder = fs.readdirSync(card_img_folder + '' + secondArtistChosen + '/' + secondEraChosen + '/');

  // Second Chosen Member : Finds the members of a particular group and era. It then randomly selects one of the members.

  let secondIdol = [];

  for (let i = 0; i < secondEraFolder.length; i++) {
    secondIdol.push(secondEraFolder[i]);
  }

  let secondIdolRand = Math.floor(Math.random() * secondIdol.length);
  let secondIdolChosen = secondIdol[secondIdolRand];

  // Interval: If a same member in the same folder is selected twice, it re-randomizes so that there isn't the same member of 
  // same group in the same drop

  while ((card_img_folder + '' + firstArtistChosen + '/' + firstEraChosen + '/' + firstIdolChosen) == (card_img_folder + '' + secondArtistChosen + '/' + secondEraChosen + '/' + secondIdolChosen)) {
    secondIdolRand = Math.floor(Math.random() * secondEra.length);
    secondIdolChosen = secondIdol[secondIdolRand];
  }


  // Second Card : Gets the needed information from the second card

  let secondCard = secondIdolChosen;

  let nameSecondIdol = secondCard.split('_')[0];
  let nameSecondGroup = secondCard.split('_')[1];
  nameSecondGroup = nameSecondGroup.replace('.png', '');

  let nameSecondEra = secondEraChosen;



  /* Third Card Generation
  */

  // Third Chosen Artist : Chooses an artist from one of the artist folders. This then points inside one of the chosen artist folders
  // to find the era folders.

  let thirdArtistChosen = artistFolders[Math.floor(Math.random() * artistFolders.length)];
  var thirdArtistFolder = fs.readdirSync(card_img_folder + '' + thirdArtistChosen + '/');


  // Third Chosen Era : Puts all of the eras of an artist into an array. The eras are randomized and one is selected.
  // Points to the members of the chosen artist group within the particular era.

  let thirdEra = [];

  for (let i = 0; i < thirdArtistFolder.length; i++) {
    thirdEra.push(thirdArtistFolder[i]);
  }

  let thirdEraRand = Math.floor(Math.random() * thirdEra.length);

  let thirdEraChosen = thirdEra[thirdEraRand];
  var thirdEraFolder = fs.readdirSync(card_img_folder + '' + thirdArtistChosen + '/' + thirdEraChosen + '/');

  // Third Chosen Member : Finds the members of a particular group and era. It then randomly selects one of the members.

  let thirdIdol = [];

  for (let i = 0; i < thirdEraFolder.length; i++) {
    thirdIdol.push(thirdEraFolder[i]);
  }

  let thirdIdolRand = Math.floor(Math.random() * thirdIdol.length);
  let thirdIdolChosen = thirdIdol[thirdIdolRand];

  // Interval: If a same member in the same folder is selected twice, it re-randomizes so that there isn't the same member of 
  // same group in the same drop

  while ((card_img_folder + '' + secondArtistChosen + '/' + secondEraChosen + '/' + secondIdolChosen) == (card_img_folder + '' + thirdArtistChosen + '/' + thirdEraChosen + '/' + thirdIdolChosen)
    || (card_img_folder + '' + firstArtistChosen + '/' + firstEraChosen + '/' + firstIdolChosen) == (card_img_folder + '' + thirdArtistChosen + '/' + thirdEraChosen + '/' + thirdIdolChosen)) {
    thirdIdolRand = Math.floor(Math.random() * thirdEra.length);
    thirdIdolChosen = thirdIdol[thirdIdolRand];
  }


  // Third Card : Gets the needed information from the first card

  let thirdCard = thirdIdolChosen;

  let nameThirdIdol = thirdCard.split('_')[0];
  let nameThirdGroup = thirdCard.split('_')[1];
  nameThirdGroup = nameThirdGroup.replace('.png', '');

  let nameThirdEra = thirdEraChosen;

  /*Idol Pictures: Contains the pictures of the featured artists
   */

  const firstIdolCard = await Canvas.loadImage(card_img_folder + '' + firstArtistChosen + '/' + firstEraChosen + '/' + nameFirstIdol + '_' + firstArtistChosen + '.png');
  context.drawImage(firstIdolCard, 15, 36, 256, 312);
  const secondIdolCard = await Canvas.loadImage(card_img_folder + '' + secondArtistChosen + '/' + secondEraChosen + '/' + nameSecondIdol + '_' + secondArtistChosen + '.png')
  context.drawImage(secondIdolCard, 317, 36, 256, 312);
  const thirdIdolCard = await Canvas.loadImage(card_img_folder + '' + thirdArtistChosen + '/' + thirdEraChosen + '/' + nameThirdIdol + '_' + thirdArtistChosen + '.png')
  context.drawImage(thirdIdolCard, 619, 36, 256, 312);


  /*Frames: Static frames that will contain generated card code.
   */
  const firstFrame = await Canvas.loadImage('img/frame_two.png')
  context.drawImage(firstFrame, 0, 0, 287, 430);
  const secondFrame = await Canvas.loadImage('img/frame_two.png')
  context.drawImage(secondFrame, 302, 0, 287, 430);
  const thirdFrame = await Canvas.loadImage('img/frame_two.png')
  context.drawImage(thirdFrame, 604, 0, 287, 430);

  /* Idol Information: Contains the information of each idol that is generated.
  */


  // First Idol: Appears at the left of the canvas

  context.font = '27px "Prompt-Bold"';
  context.textAlign = "right";
  context.fillStyle = "#FFFFFF";
  let firstIdolName = (nameFirstIdol).toUpperCase();
  context.fillText(firstIdolName, 272, 385);

  context.font = '16px "Prompt-Medium"';
  context.textAlign = "right";
  context.fillStyle = "#FFFFFF";
  let firstGroupName = (firstArtistChosen).toUpperCase();
  context.fillText(firstGroupName, 272, 403);


  // Second Idol: Appears in the center of the canvas

  context.font = '27px "Prompt-Bold"';
  context.textAlign = "right";
  context.fillStyle = "#FFFFFF";
  let secondIdolName = (nameSecondIdol).toUpperCase();
  context.fillText(secondIdolName, 574, 385);

  context.font = '16px "Prompt-Medium"';
  context.textAlign = "right";
  context.fillStyle = "#FFFFFF";
  let secondGroupName = (secondArtistChosen).toUpperCase();
  context.fillText(secondGroupName, 574, 403);

  // Third Idol: Appears on the far right of the canvas

  context.font = '27px "Prompt-Bold"';
  context.textAlign = "right";
  context.fillStyle = "#FFFFFF";
  let thirdIdolName = (nameThirdIdol).toUpperCase();
  context.fillText(thirdIdolName, 876, 385);

  context.font = '16px "Prompt-Medium"';
  context.textAlign = "right";
  context.fillStyle = "#FFFFFF";
  let thirdGroupName = (thirdArtistChosen).toUpperCase();
  context.fillText(thirdGroupName, 876, 403);

  /* Issue: Showcases the number of cards claimed
  */



  var firstIssue = 1;
  context.font = '19px "Prompt"';
  context.textAlign = "left";
  context.fillStyle = "#FFFFFF";
  let firstIssueNum = ("Issue " + firstIssue).toUpperCase();
  context.fillText(firstIssueNum, 15, 25);



  var secondIssue = 1;
  context.font = '19px "Prompt"';
  context.textAlign = "left";
  context.fillStyle = "#FFFFFF";
  let secondIssueNum = ("Issue " + secondIssue).toUpperCase();
  context.fillText(secondIssueNum, 317, 25);

  var thirdIssue = 1;
  context.font = '19px "Prompt"';
  context.textAlign = "left";
  context.fillStyle = "#FFFFFF";
  let thirdIssueNum = ("Issue " + thirdIssue).toUpperCase();
  context.fillText(thirdIssueNum, 619, 25);

  /* Card Code: Generates the card code for each card
  */

  var cardCode = 1;
  var finalCardCode;



  /* Bar Code: Provides the bar code image on the card
   */

  const barcodeOne = await Canvas.loadImage('img/bar code.png')
  context.drawImage(barcodeOne, 225, 10, 45, 15);
  const barcodeTwo = await Canvas.loadImage('img/bar code.png')
  context.drawImage(barcodeTwo, 528, 10, 45, 15);
  const barcodeThree = await Canvas.loadImage('img/bar code.png')
  context.drawImage(barcodeThree, 830, 10, 45, 15);


  /* Icons : The icons at the bottom left of the card
   */

  // First Icon

  const firstIcon = await Canvas.loadImage(icon_img_folder + '' + firstArtistChosen + '/' + firstEraChosen + '/' + nameFirstIdol + '_' + firstArtistChosen + '.png');
  context.drawImage(firstIcon, 16, 362.5, 58.4, 51);


  // Second Icon

  const secondIcon = await Canvas.loadImage(icon_img_folder + '' + secondArtistChosen + '/' + secondEraChosen + '/' + nameSecondIdol + '_' + secondArtistChosen + '.png');
  context.drawImage(secondIcon, 318, 362.5, 58.4, 51);

  // Third Icon

  const thirdIcon = await Canvas.loadImage(icon_img_folder + '' + thirdArtistChosen + '/' + thirdEraChosen + '/' + nameThirdIdol + '_' + thirdArtistChosen + '.png');
  context.drawImage(thirdIcon, 620, 362.5, 58.4, 51);

  const buffer = canvas.toBuffer("image/png");
  const embedColor = "#33A7FF";


  let attachment = { file: buffer, name: "dropcard.png" };



  /*---------------------Message Timeout, Claim Winners, and Saving Claimed Cards to Database--------------------------------------------
  */

  var firstWinner;
  var secondWinner;
  var thirdWinner;

  let drop = message.channel.createMessage(`<@${message.author.id}> is dropping cards!`, attachment)
  drop.then(function (message) {
    message.addReaction('1️⃣');
    message.addReaction('2️⃣');
    message.addReaction('3️⃣');
    ID = message.id;
  })
  drop.then(message => {
    setTimeout(() => {

      
    //now, check dropper claim
    if(dropper in claims1)
    {
      dropClaimed = 1;
      delete claims1[dropper];
    }
    if(dropper in claims2)
    {
      dropClaimed = 2;
      delete claims2[dropper];
    }
    if(dropper in claims3)
    {
      dropClaimed = 3;
      delete claims3[dropper];
    }
    
    console.log(dropClaimed);
      
    for (var key in claims1) {
      if (claims1.hasOwnProperty(key)) {
          claimOne.push(key);
      }
    }
    for (var key in claims2) {
      if (claims2.hasOwnProperty(key)) {
          claimTwo.push(key);
      }
    }
    for (var key in claims3) {
      if (claims3.hasOwnProperty(key)) {
          claimThree.push(key);
      }
    }
    
      //dropper claimed drop 1
      if(dropClaimed == 1){
        firstWinner = dropper;
        if(claimTwo.length != 0)
          secondWinner = claimTwo[Math.floor(Math.random() * claimTwo.length)];
        else
          secondWinner= "No one";
        if(claimThree.length != 0)
          thirdWinner = claimThree[Math.floor(Math.random() * claimThree.length)];
        else  
          thirdWinner = "No one";
      }
      //dropper claimed drop 2
      else if (dropClaimed == 2){
        if(claimOne.length != 0)
          firstWinner = claimOne[Math.floor(Math.random() * claimOne.length)];
        else
          firstWinner = "No one";
        secondWinner = dropper;
        if(claimThree.length != 0)
          thirdWinner = claimThree[Math.floor(Math.random() * claimThree.length)];
        else
          thirdWinner = "No one";
    
      }
      //dropper claimed drop 3
      else if (dropClaimed == 3){
        if(claimOne.length != 0)
          firstWinner = claimOne[Math.floor(Math.random() * claimOne.length)];
        else
          firstWinner = "No one";
        if(claimTwo.length != 0)
          secondWinner = claimTwo[Math.floor(Math.random() * claimTwo.length)];
        else
          secondWinner = "No one";
        thirdWinner = dropper;
      }
      //dropper hasn't claimed any
      else 
      {
        if(claimOne.length != 0)
          firstWinner = claimOne[Math.floor(Math.random() * claimOne.length)];
        else
          firstWinner = "No one";
        if (claimTwo.length != 0)
          secondWinner = claimTwo[Math.floor(Math.random() * claimTwo.length)];
        else
          secondWinner = "No one";
        if (claimThree.length != 0)
          thirdWinner = claimThree[Math.floor(Math.random() * claimThree.length)];
        else
          thirdWinner = "No one";
      }
      console.log(firstWinner);
      console.log(secondWinner);
      console.log(thirdWinner);

      let firstWinnerName;
      let secondWinnerName;
      let thirdWinnerName;

      if (firstWinner == undefined) {
        firstWinner = "No one"
      }

      if (secondWinner == undefined) {
        secondWinner = "No one"
      }

      if (thirdWinner == undefined) {
        thirdWinner = "No one"
      }


      if (firstWinner.length >= 1 && firstWinner != "No one") {
        firstWinnerName = `<@${firstWinner}>`
      } else {
        firstWinnerName = "No one"
      }



      if (secondWinner.length >= 1 && secondWinner != "No one") {
        secondWinnerName = `<@${secondWinner}>`
      } else {
        secondWinnerName = "No one"
      }

      if (thirdWinner.length >= 1 && thirdWinner != "No one") {
        thirdWinnerName = `<@${thirdWinner}>`
      } else {
        thirdWinnerName = "No one"
      }

      /* Saves the information of the first claimed card
       * in the database upon official timeout and chosen winner
      */

      if (firstWinner != "No one") {
        finalCardCode = code.generatedCode(cardCode)

        claimedCards.findOne({
          code: finalCardCode
        }, (err, data) => {
          if (err) console.log(err);

          if (!data) {
            const newData = new claimedCards({
              code: finalCardCode,
              issue: firstIssue,
              name: nameFirstIdol,
              group: nameFirstGroup,
              era: nameFirstEra,
              mainImage: card_img_folder + '' + firstArtistChosen + '/' + firstEraChosen + '/' + nameFirstIdol + '_' + firstArtistChosen + '.png',
              icon: icon_img_folder + '' + firstArtistChosen + '/' + firstEraChosen + '/' + nameFirstIdol + '_' + firstArtistChosen + '.png',
              generated: Date.now(),
              claimed: Date.now(),
              owner: [firstWinner]
            })
            newData.save().catch(err => console.log(err));
          } else {
          }

        })

        cardInfo.find({
          $and: [{ name: nameFirstIdol }, { group: nameFirstGroup }, { era: nameFirstEra }]
        }, (err, data) => {
          if (err) {
            console.log(err)
          } else {
            data[0].issue += 1;
            data[0].numClaimed += 1;
            data[0].save()
            firstIssue = data[0].issue
            return data, firstIssue
          }
        })
      }

      /* Saves the information of the second claimed card
       * in the database upon official timeout and chosen winner
      */

      if (secondWinner != "No one") {

        finalCardCode = code.generatedCode(cardCode)

        claimedCards.findOne({
          code: finalCardCode
        }, (err, data) => {
          if (err) console.log(err);

          if (!data) {
            const newData = new claimedCards({
              code: finalCardCode,
              issue: secondIssue,
              name: nameSecondIdol,
              group: nameSecondGroup,
              era: nameSecondEra,
              mainImage: card_img_folder + '' + secondArtistChosen + '/' + secondEraChosen + '/' + nameSecondIdol + '_' + secondArtistChosen + '.png',
              icon: icon_img_folder + '' + secondArtistChosen + '/' + secondEraChosen + '/' + nameSecondIdol + '_' + secondArtistChosen + '.png',
              generated: Date.now(),
              claimed: Date.now(),
              owner: [secondWinner]
            })
            newData.save().catch(err => console.log(err));
          } else {
          }

        })

        cardInfo.find({
          $and: [{ name: nameSecondIdol }, { group: nameSecondGroup }, { era: nameSecondEra }]
        }, (err, data) => {
          if (err) {
            console.log(err)
          } else {
            data[0].issue += 1;
            data[0].numClaimed += 1;
            data[0].save()
            secondIssue = data[0].issue
            return data, secondIssue
          }

        })
      }


      /* Saves the information of the third claimed card
      * in the database upon official timeout and chosen winner
      */

      if (thirdWinner != "No one") {

        finalCardCode = code.generatedCode(cardCode)

        claimedCards.findOne({
          code: finalCardCode
        }, (err, data) => {
          if (err) console.log(err);

          if (!data) {
            const newData = new claimedCards({
              code: finalCardCode,
              issue: thirdIssue,
              name: nameThirdIdol,
              group: nameThirdGroup,
              era: nameThirdEra,
              mainImage: card_img_folder + '' + thirdArtistChosen + '/' + thirdEraChosen + '/' + nameThirdIdol + '_' + thirdArtistChosen + '.png',
              icon: icon_img_folder + '' + thirdArtistChosen + '/' + thirdEraChosen + '/' + nameThirdIdol + '_' + thirdArtistChosen + '.png',
              generated: Date.now(),
              claimed: Date.now(),
              owner: [thirdWinner]
            })
            newData.save().catch(err => console.log(err));
          } else {
          }

        })

        cardInfo.find({
          $and: [{ name: nameThirdIdol }, { group: nameThirdGroup }, { era: nameThirdEra }]
        }, (err, data) => {
          if (err) {
            console.log(err)
          } else {
            data[0].issue += 1;
            data[0].numClaimed += 1;
            data[0].save()
            thirdIssue = data[0].issue
            return data, thirdIssue
          }

        })
      }


      let messageAttachment = message.attachments;
      messageAttachment = [];

      message.edit(
        { content: `` + firstWinnerName + ` collected Issue #` + firstIssue + ` **${nameFirstGroup}** **${nameFirstIdol}**\n` + secondWinnerName + ` collected Issue #` + secondIssue + ` **${nameSecondGroup}** **${nameSecondIdol}**\n` + thirdWinnerName + ` collected Issue #` + thirdIssue + ` **${nameThirdGroup}** **${nameThirdIdol}**`, attachments: [] });
      message.removeReactions('1️⃣');
      message.removeReactions('2️⃣');
      message.removeReactions('3️⃣');


    }, 15000)
  });




  /*--------------------------------Saves card info of each generated card--------------------------------------------
  */

  cardInfo.find({
    $and: [{ name: nameFirstIdol }, { group: nameFirstGroup }, { era: nameFirstEra }]
  }, (err, data) => {
    if (err) {
      console.log(err)
    } else {
      if (data[0] == undefined) {
        const newData = new cardInfo({
          issue: 1,
          name: nameFirstIdol,
          group: nameFirstGroup,
          era: nameFirstEra,
          mainImage: card_img_folder + '' + firstArtistChosen + '/' + firstEraChosen + '/' + nameFirstIdol + '_' + firstArtistChosen + '.png',
          icon: icon_img_folder + '' + firstArtistChosen + '/' + firstEraChosen + '/' + nameFirstIdol + '_' + firstArtistChosen + '.png',
          firstGenerated: Date.now(),
          numGenerated: 1,
          numClaimed: 0
        })
        newData.save().catch(err => console.log(err));
        return newData
      } else {

        data[0].numGenerated += 1;
        data[0].save()
        return data
      }
    }
  })

  cardInfo.find({
    $and: [{ name: nameSecondIdol }, { group: nameSecondGroup }, { era: nameSecondEra }]
  }, (err, data) => {
    if (err) {
      console.log(err)
    } else {
      if (data[0] == undefined) {
        const newData = new cardInfo({
          issue: 1,
          name: nameSecondIdol,
          group: nameSecondGroup,
          era: nameSecondEra,
          mainImage: card_img_folder + '' + secondArtistChosen + '/' + secondEraChosen + '/' + nameSecondIdol + '_' + secondArtistChosen + '.png',
          icon: icon_img_folder + '' + secondArtistChosen + '/' + secondEraChosen + '/' + nameSecondIdol + '_' + secondArtistChosen + '.png',
          firstGenerated: Date.now(),
          numGenerated: 1,
          numClaimed: 0
        })
        newData.save().catch(err => console.log(err));
      } else {
        data[0].issue += 1;
        data[0].numGenerated += 1;
        data[0].save()
        secondIssue = data[0].issue
      }
    }

  })

  cardInfo.find({
    $and: [{ name: nameThirdIdol }, { group: nameThirdGroup }, { era: nameThirdEra }]
  }, (err, data) => {
    if (err) {
      console.log(err)
    } else {
      if (data[0] == undefined) {
        const newData = new cardInfo({
          issue: 1,
          name: nameThirdIdol,
          group: nameThirdGroup,
          era: nameThirdEra,
          mainImage: card_img_folder + '' + thirdArtistChosen + '/' + thirdEraChosen + '/' + nameThirdIdol + '_' + thirdArtistChosen + '.png',
          icon: icon_img_folder + '' + thirdArtistChosen + '/' + thirdEraChosen + '/' + nameThirdIdol + '_' + thirdArtistChosen + '.png',
          firstGenerated: Date.now(),
          numGenerated: 1,
          numClaimed: 0
        })
        newData.save().catch(err => console.log(err));
      } else {
        data[0].issue += 1;
        data[0].numGenerated += 1;
        data[0].save()
        thirdIssue = data[0].issue
      }
    }

  })


  /*--------------------------------Claiming System for cards--------------------------------------------
  */


  var claims1 = {};
  var claims2 = {};
  var claims3 = {};

  var dropClaimed = -1;
  
  var claimOne = [];
  var claimTwo = [];
  var claimThree = [];
  
  client.once('messageCreate', async (message, client) => {
        // This will continuously listen for 100 incoming reactions over the course of 30 seconds
        const reactionListener = new ReactionHandler.continuousReactionStream(
            message, 
            (userID) => userID != message.author.id, 
            false, 
            { maxMatches: 100, time: 15000 }
        );
      
  
        reactionListener.on('reacted', async (event) => {

          if(message.author.id == "865337188539433001"){
            if(event.userID != message.author.id && event.emoji.name === "1️⃣") {
              if(!(event.userID in claims1)){
                claims1[event.userID] = 1;
              }
              if(event.userID in claims2)
                delete claims2[event.userID];
              if(event.userID in claims3)
                delete claims3[event.userID];
          }
            if(event.userID != message.author.id && event.emoji.name === "2️⃣") {
              if(!(event.userID in claims2)){
                claims2[event.userID] = 1;
              }
              if(event.userID in claims1)
                delete claims1[event.userID];
              if(event.userID in claims3)
                delete claims3[event.userID];
            }
            if(event.userID != message.author.id && event.emoji.name === "3️⃣") {
              if(!(event.userID in claims3)){
                claims3[event.userID] = 1;
              }
              if(event.userID in claims1)
                delete claims1[event.userID];
              if(event.userID in claims2)
                delete claims2[event.userID];
            }
          }
        });
  });
  }

module.exports.config = {
  name: "drop",
  aliases: [],
  usage: "-drop"
}










