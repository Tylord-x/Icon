/*--------------------------------------------------------LOADING IN THE PACKAGES--------------------------------------------------*/

// CANVAS: Provides the visibly drawn canvas and all the components of the cards, including fonts
const Canvas = require('canvas');
const { registerFont } = require('canvas');
registerFont('./fonts/Prompt-Bold.ttf', { family: 'Prompt-Bold' })
registerFont('./fonts/Prompt-Medium.ttf', { family: 'Prompt-Medium' })
registerFont('./fonts/Prompt-Regular.ttf', { family: 'Prompt' })

// FOLDERS: Searches and pulls folders and file paths. This is important
// especially to pull and use the card images.
const fs = require('fs');

// MODELS: The data models relevant to card generation. Card and User Data
// will be inserted or updated throughout the process.

const claimedCards = require('../../models/claimedCards.js');
const cardInfo = require('../../models/cardInfo.js');
const genCards = require('../../models/overallCards.js');
const cardTracker = require('../cards/cardTracker.js');
const user = require('../../models/user.js');

// REACTION HANDLER: Gets data from the reactions on the message to use for claiming
const ReactionHandler = require('eris-reactions');

const { Interaction } = require('Eris')

const claimTime = 600000;

/*-------------------------------------------DROP COMMAND: BEGINNING THE DROP PROCESS----------------------------------*/

module.exports.execute = async (client, message, args, Eris, CDdata) => {

  const dropper = message.member.user.id // Gets the id of the dropper, who is the player that initiated the drop
  const bot = client.user.id // Gets the id of the bot
  cardTracker.execute(message, client); // Tracks the card generation number and card code

  const Constants = Eris.Constants;
  /*---------------------------------------------INITIALIZATION OF COOLDOWN---------------------------------------------*/

  async function isClaimCooldown(id) {
    const userData = await user.findOne({ userID: id })
    var onCooldown = false
    if (userData == null || userData == undefined) {
      onCooldown = false
    } else {
      let cooldownTime = userData.claimCooldown;
      if (claimTime - (Date.now() - cooldownTime) > 0) {
        onCooldown = true
      }
      else {
        onCooldown = false
      }
    }
    return onCooldown
  }

  /*---------------------------------------BEGINNING OF CARD GENERATION-------------------------------*/

  // CANVAS INITIALIZATION: Draws the initial transparent canvas, which will later display the generated cards
  const canvas = Canvas.createCanvas(900, 430);
  const context = canvas.getContext('2d');
  const background = await Canvas.loadImage('transparent.png');
  context.drawImage(background, 0, 0, canvas.width, canvas.height);

  // STARTING FOLDERS: The four image folders that contain components of both regular idol cards and group cards
  const idolCards = "./img/idol_cards/";
  const idolIcons = "./img/idol_icons/";
  const groupCards = "./img/group_cards/";
  const groupIcons = "./img/group_icons/";

  // GROUP CHANCE: Determines whether a group card or regular idol card will drop. There is a 1% chance for group cards 
  // to drop. This means that if the chance lands on 1 (out of 100), a group card will be generated.
  const firstGroupChance = Math.round(Math.random() * 100) + 1
  const secondGroupChance = Math.round(Math.random() * 100) + 1
  const thirdGroupChance = Math.round(Math.random() * 100) + 1

  var firstCard = "" // Stores the main image folder for the first card
  var firstIcon = "" // Stores the matching icon folder for the first card
  var secondCard = "" // Stores the main image folder for the second card 
  var secondIcon = "" // Stores the matching icon folder for the second card
  var thirdCard = "" // Stores the main image folder for the third card 
  var thirdIcon = "" // Stores the matching icon folder for the third card
  var firstCardFolder = "" // Stores the main image folder for the first card
  var firstIconFolder = "" // Stores the matching icon folder for the first card
  var secondCardFolder = "" // Stores the main image folder for the second card 
  var secondIconFolder = "" // Stores the matching icon folder for the second card
  var thirdCardFolder = "" // Stores the main image folder for the third card 
  var thirdIconFolder = "" // Stores the matching icon folder for the third card
  if (firstGroupChance == 1) {
    firstCard = fs.readdirSync(groupCards)
    firstIcon = fs.readdirSync(groupIcons)
    firstCardFolder = groupCards
    firstIconFolder = groupIcons
  } else {
    firstCard = fs.readdirSync(idolCards)
    firstIcon = fs.readdirSync(idolIcons)
    firstCardFolder = idolCards
    firstIconFolder = idolIcons
  }
  if (secondGroupChance == 1) {
    secondCard = fs.readdirSync(groupCards)
    secondIcon = fs.readdirSync(groupIcons)
    secondCardFolder = groupCards
    secondIconFolder = groupIcons
  } else {
    secondCard = fs.readdirSync(idolCards)
    secondIcon = fs.readdirSync(idolIcons)
    secondCardFolder = idolCards
    secondIconFolder = idolIcons
  }
  if (thirdGroupChance == 1) {
    thirdCard = fs.readdirSync(groupCards)
    thirdIcon = fs.readdirSync(groupIcons)
    thirdCardFolder = groupCards
    thirdIconFolder = groupIcons
  } else {
    thirdCard = fs.readdirSync(idolCards)
    thirdIcon = fs.readdirSync(idolIcons)
    thirdCardFolder = idolCards
    thirdIconFolder = idolIcons
  }

  /*----------------------------------------------------CARD GENERATION------------------------------------------------------------*/

  /*--------------------------------------------------FIRST GENERATED CARD--------------------------------------------------*/

  var firstArtist = firstCard[Math.round(Math.random() * (firstCard.length - 1))]; // Randomizes the chosen group (Ex. BTS)
  var firstArtistFolder = fs.readdirSync(firstCardFolder + '' + firstArtist + '/'); // Stores the current file path with the group name
  var firstEra = firstArtistFolder[Math.round(Math.random() * (firstArtistFolder.length - 1))]
  var firstEraFolder = fs.readdirSync(firstCardFolder + '' + firstArtist + '/' + '' + firstEra + '/'); // Stores the current file path with the group name and era name
  var firstChosen = firstEraFolder[Math.round(Math.random() * (firstEraFolder.length - 1))]
  var firstName = firstChosen.split("_")[0] // Stores the name of the idol or "Group" to be featured on the first card
  var firstGroup = firstChosen.split("_")[1].replace(".png", "") // Stores the group name to be featured on the first card
  var firstEraName = ""
  if (firstEra.includes(";")) {
    firstEraName = firstEra.replace(";", ":")
  } else {
    firstEraName = firstEra
  }

  var firstImages = firstCardFolder + '' + firstArtist + '/' + firstEra + '/' + firstChosen
  var firstIcons = firstIconFolder + '' + firstArtist + '/' + firstEra + '/' + firstChosen

  var firstCards = await cardInfo.findOne({ $and: [{ name: firstName }, { group: firstGroup }, { era: firstEraName }] })
  if (firstCards != null && firstCards != undefined) {
    if (firstCards.archived) {
      while (firstCards.archived && firstCards != null && firstCards != undefined) {
        firstArtist = firstCard[Math.round(Math.random() * (firstCard.length - 1))]; // Randomizes the chosen group (Ex. BTS)
        firstArtistFolder = fs.readdirSync(firstCardFolder + '' + firstArtist + '/'); // Stores the current file path with the group name
        firstEra = firstArtistFolder[Math.round(Math.random() * (firstArtistFolder.length - 1))]
        firstEraFolder = fs.readdirSync(firstCardFolder + '' + firstArtist + '/' + '' + firstEra + '/'); // Stores the current file path with the group name and era name
        firstChosen = firstEraFolder[Math.round(Math.random() * (firstEraFolder.length - 1))]
        firstName = firstChosen.split("_")[0] // Stores the name of the idol or "Group" to be featured on the first card
        firstGroup = firstChosen.split("_")[1].replace(".png", "") // Stores the group name to be featured on the first card
        firstEraName = ""
        if (firstEra.includes(";")) {
          firstEraName = firstEra.replace(";", ":")
        } else {
          firstEraName = firstEra
        }
        firstImages = firstCardFolder + '' + firstArtist + '/' + firstEra + '/' + firstChosen
        firstIcons = firstIconFolder + '' + firstArtist + '/' + firstEra + '/' + firstChosen
        firstCards = await cardInfo.findOne({ $and: [{ name: firstName }, { group: firstGroup }, { era: firstEraName }] })
      }
    }
  }


  // FIRST CONDITION: Chooses a condition based on randomization (1-100). Each condition has a different
  // likelihood of being picked. Poor has a 15% chance of being picked, Bad has a 30% chance of being picked,
  // Fine has a 25% chance, Good has a 15% chance, Excellent has a 10% chance, and Pristine has a 5% chance.

  const firstConditionChance = Math.round(Math.random() * 100) + 1
  var firstCondition = 0
  var firstConditionName = ""
  var firstStars = ""
  var firstConditionWorth = 0
  if (firstConditionChance >= 1 && firstConditionChance <= 15) {
    firstCondition = 0
    firstConditionWorth = 0
    firstConditionName = "Poor"
    firstStars = "◇◇◇◇◇"
  } else if (firstConditionChance >= 16 && firstConditionChance <= 45) {
    firstCondition = 1
    firstConditionWorth = 10
    firstConditionName = "Bad"
    firstStars = "◆◇◇◇◇"
  } else if (firstConditionChance >= 46 && firstConditionChance <= 70) {
    firstCondition = 2
    firstConditionWorth = 20
    firstConditionName = "Fine"
    firstStars = "◆◆◇◇◇"
  } else if (firstConditionChance >= 71 && firstConditionChance <= 85) {
    firstCondition = 3
    firstConditionWorth = 40
    firstConditionName = "Good"
    firstStars = "◆◆◆◇◇"
  } else if (firstConditionChance >= 86 && firstConditionChance <= 95) {
    firstCondition = 4
    firstConditionWorth = 60
    firstConditionName = "Excellent"
    firstStars = "◆◆◆◆◇"
  } else if (firstConditionChance >= 96) {
    firstCondition = 5
    firstConditionWorth = 80
    firstConditionName = "Pristine"
    firstStars = "◆◆◆◆◆"
  }

  if (firstCards != null) {
    firstCards.numGenerated += 1
    firstCards.save()
  } else {
    const newData = new cardInfo({
      issue: 1,
      name: firstName,
      group: firstGroup,
      era: firstEraName,
      mainImage: firstImages,
      icon: firstIcons,
      generated: Date.now(),
      numGenerated: 1,
      numClaimed: 0,
      archived: false
    })
    newData.save().catch(err => console.log(err));
  }
  firstCards = await cardInfo.findOne({ $and: [{ name: firstName }, { group: firstGroup }, { era: firstEraName }] })

  var firstIssue = 1
  if (firstCards != null && firstCards != undefined) {
    firstIssue = firstCards.issue
  } else {
    firstIssue = 1
  }

  var firstFrame = "./img/cosmetics/frames/Default_Frame.png"
  var firstCosmetic = "./img/cosmetics/misc/Barcode.png"

  /*--------------------------------------------------SECOND GENERATED CARD--------------------------------------------------*/

  var secondArtist = secondCard[Math.round(Math.random() * (secondCard.length - 1))]; // Randomizes the chosen group (Ex. BTS)
  var secondArtistFolder = fs.readdirSync(secondCardFolder + '' + secondArtist + '/'); // Stores the current file path with the group name
  var secondEra = secondArtistFolder[Math.round(Math.random() * (secondArtistFolder.length - 1))]
  var secondEraFolder = fs.readdirSync(secondCardFolder + '' + secondArtist + '/' + '' + secondEra + '/'); // Stores the current file path with the group name and era name
  var secondChosen = secondEraFolder[Math.round(Math.random() * (secondEraFolder.length - 1))]
  var secondName = secondChosen.split("_")[0] // Stores the name of the idol or "Group" to be featured on the first card
  var secondGroup = secondChosen.split("_")[1].replace(".png", "") // Stores the group name to be featured on the first card
  var secondEraName = ""
  if (secondEra.includes(";")) {
    secondEraName = secondEra.replace(";", ":")
  } else {
    secondEraName = secondEra
  }
  var secondImages = secondCardFolder + '' + secondArtist + '/' + secondEra + '/' + secondChosen
  var secondIcons = secondIconFolder + '' + secondArtist + '/' + secondEra + '/' + secondChosen


  while (firstImages == secondImages) {
    secondArtist = secondCard[Math.round(Math.random() * (secondCard.length - 1))]; // Randomizes the chosen group (Ex. BTS)
    secondArtistFolder = fs.readdirSync(secondCardFolder + '' + secondArtist + '/'); // Stores the current file path with the group name
    secondEra = secondArtistFolder[Math.round(Math.random() * (secondArtistFolder.length - 1))]
    secondEraFolder = fs.readdirSync(secondCardFolder + '' + secondArtist + '/' + '' + secondEra + '/'); // Stores the current file path with the group name and era name
    secondChosen = secondEraFolder[Math.round(Math.random() * (secondEraFolder.length - 1))]
    secondName = secondChosen.split("_")[0] // Stores the name of the idol or "Group" to be featured on the first card
    secondGroup = secondChosen.split("_")[1].replace(".png", "") // Stores the group name to be featured on the first card
    secondEraName = ""
    if (secondEra.includes(";")) {
      secondEraName = secondEra.replace(";", ":")
    } else {
      secondEraName = secondEra
    }
    secondImages = secondCardFolder + '' + secondArtist + '/' + secondEra + '/' + secondChosen
    secondIcons = secondIconFolder + '' + secondArtist + '/' + secondEra + '/' + secondChosen
  }

  // SECOND CONDITION: Chooses a condition based on randomization (1-100). Each condition has a different
  // likelihood of being picked. Poor has a 15% chance of being picked, Bad has a 30% chance of being picked,
  // Fine has a 25% chance, Good has a 15% chance, Excellent has a 10% chance, and Pristine has a 5% chance.

  const secondConditionChance = Math.round(Math.random() * 100) + 1
  var secondCondition = 0
  var secondConditionName = ""
  var secondStars = ""
  var secondConditionWorth = 0
  if (secondConditionChance >= 1 && secondConditionChance <= 15) {
    secondCondition = 0
    secondConditionWorth = 0
    secondConditionName = "Poor"
    secondStars = "◇◇◇◇◇"
  } else if (secondConditionChance >= 16 && secondConditionChance <= 45) {
    secondCondition = 1
    secondConditionWorth = 10
    secondConditionName = "Bad"
    secondStars = "◆◇◇◇◇"
  } else if (secondConditionChance >= 46 && secondConditionChance <= 70) {
    secondCondition = 2
    secondConditionWorth = 20
    secondConditionName = "Fine"
    secondStars = "◆◆◇◇◇"
  } else if (secondConditionChance >= 71 && secondConditionChance <= 85) {
    secondCondition = 3
    secondConditionWorth = 40
    secondConditionName = "Good"
    secondStars = "◆◆◆◇◇"
  } else if (secondConditionChance >= 86 && secondConditionChance <= 95) {
    secondCondition = 4
    secondConditionWorth = 60
    secondConditionName = "Excellent"
    secondStars = "◆◆◆◆◇"
  } else if (secondConditionChance >= 96) {
    secondCondition = 5
    secondConditionWorth = 80
    secondConditionName = "Pristine"
    secondStars = "◆◆◆◆◆"
  }

  var secondCards = await cardInfo.findOne({ $and: [{ name: secondName }, { group: secondGroup }, { era: secondEraName }] })

  if (secondCards != null && secondCard != undefined) {
    secondCards.numGenerated += 1
    secondCards.save()
  } else {
    const newData = new cardInfo({
      issue: 1,
      name: secondName,
      group: secondGroup,
      era: secondEraName,
      mainImage: secondImages,
      icon: secondIcons,
      generated: Date.now(),
      numGenerated: 1,
      numClaimed: 0,
      archived: false
    })
    newData.save().catch(err => console.log(err));
  }
  secondCards = await cardInfo.findOne({ $and: [{ name: secondName }, { group: secondGroup }, { era: secondEraName }] })

  var secondIssue = 1
  if (secondCards != null && secondCards != undefined) {
    secondIssue = secondCards.issue
  } else {
    secondIssue = 1
  }
  var secondFrame = "./img/cosmetics/frames/Default_Frame.png"
  var secondCosmetic = "./img/cosmetics/misc/Barcode.png"
  /*--------------------------------------------------THIRD GENERATED CARD--------------------------------------------------*/

  var thirdArtist = thirdCard[Math.round(Math.random() * (thirdCard.length - 1))]; // Randomizes the chosen group (Ex. BTS)
  var thirdArtistFolder = fs.readdirSync(thirdCardFolder + '' + thirdArtist + '/'); // Stores the current file path with the group name
  var thirdEra = thirdArtistFolder[Math.round(Math.random() * (thirdArtistFolder.length - 1))]
  var thirdEraFolder = fs.readdirSync(thirdCardFolder + '' + thirdArtist + '/' + '' + thirdEra + '/'); // Stores the current file path with the group name and era name
  var thirdChosen = thirdEraFolder[Math.round(Math.random() * (thirdEraFolder.length - 1))]
  var thirdName = thirdChosen.split("_")[0] // Stores the name of the idol or "Group" to be featured on the third card
  var thirdGroup = thirdChosen.split("_")[1].replace(".png", "") // Stores the group name to be featured on the third card
  var thirdEraName = ""
  if (thirdEra.includes(";")) {
    thirdEraName = thirdEra.replace(";", ":")
  } else {
    thirdEraName = thirdEra
  }
  var thirdImages = thirdCardFolder + '' + thirdArtist + '/' + thirdEra + '/' + thirdChosen
  var thirdIcons = thirdIconFolder + '' + thirdArtist + '/' + thirdEra + '/' + thirdChosen

  while (((secondImages) == (thirdImages)) || ((firstImages) == (thirdImages))) {
    thirdArtist = thirdCard[Math.round(Math.random() * (thirdCard.length - 1))]; // Randomizes the chosen group (Ex. BTS)
    thirdArtistFolder = fs.readdirSync(thirdCardFolder + '' + thirdArtist + '/'); // Stores the current file path with the group name
    thirdEra = thirdArtistFolder[Math.round(Math.random() * (thirdArtistFolder.length - 1))]
    thirdEraFolder = fs.readdirSync(thirdCardFolder + '' + thirdArtist + '/' + '' + thirdEra + '/'); // Stores the current file path with the group name and era name
    thirdChosen = thirdEraFolder[Math.round(Math.random() * (thirdEraFolder.length - 1))]
    thirdName = thirdChosen.split("_")[0] // Stores the name of the idol or "Group" to be featured on the third card
    thirdGroup = thirdChosen.split("_")[1].replace(".png", "") // Stores the group name to be featured on the third card
    thirdEraName = ""
    if (thirdEra.includes(";")) {
      thirdEraName = thirdEra.replace(";", ":")
    } else {
      thirdEraName = thirdEra
    }
    thirdImages = thirdCardFolder + '' + thirdArtist + '/' + thirdEra + '/' + thirdChosen
    thirdIcons = thirdIconFolder + '' + thirdArtist + '/' + thirdEra + '/' + thirdChosen
  }

  // THIRD CONDITION: Chooses a condition based on randomization (1-100). Each condition has a different
  // likelihood of being picked. Poor has a 15% chance of being picked, Bad has a 30% chance of being picked,
  // Fine has a 25% chance, Good has a 15% chance, Excellent has a 10% chance, and Pristine has a 5% chance.

  const thirdConditionChance = Math.round(Math.random() * 100) + 1
  var thirdCondition = 0
  var thirdConditionName = ""
  var thirdStars = ""
  var thirdConditionWorth = 0
  if (thirdConditionChance >= 1 && thirdConditionChance <= 15) {
    thirdCondition = 0
    thirdConditionWorth = 0
    thirdConditionName = "Poor"
    thirdStars = "◇◇◇◇◇"
  } else if (thirdConditionChance >= 16 && thirdConditionChance <= 45) {
    thirdCondition = 1
    thirdConditionWorth = 10
    thirdConditionName = "Bad"
    thirdStars = "◆◇◇◇◇"
  } else if (thirdConditionChance >= 46 && thirdConditionChance <= 70) {
    thirdCondition = 2
    thirdConditionWorth = 20
    thirdConditionName = "Fine"
    thirdStars = "◆◆◇◇◇"
  } else if (thirdConditionChance >= 71 && thirdConditionChance <= 85) {
    thirdCondition = 3
    thirdConditionWorth = 40
    thirdConditionName = "Good"
    thirdStars = "◆◆◆◇◇"
  } else if (thirdConditionChance >= 86 && thirdConditionChance <= 95) {
    thirdCondition = 4
    thirdConditionWorth = 60
    thirdConditionName = "Excellent"
    thirdStars = "◆◆◆◆◇"
  } else if (thirdConditionChance >= 96) {
    thirdCondition = 5
    thirdConditionWorth = 80
    thirdConditionName = "Pristine"
    thirdStars = "◆◆◆◆◆"
  }

  var thirdCards = await cardInfo.findOne({ $and: [{ name: thirdName }, { group: thirdGroup }, { era: thirdEraName }] })

  if (thirdCards != null && thirdCard != undefined) {
    thirdCards.numGenerated += 1
    thirdCards.save()
  } else {
    // NEW THIRD CARD DATA: If the information of the card has not been previously generated, it will be inserted into
    // the "cardInfo" data collection.
    const newData = new cardInfo({
      issue: 1,
      name: thirdName,
      group: thirdGroup,
      era: thirdEraName,
      mainImage: thirdImages,
      icon: thirdIcons,
      generated: Date.now(),
      numGenerated: 1,
      numClaimed: 0,
      archived: false
    })
    newData.save().catch(err => console.log(err));
  }

  thirdCards = await cardInfo.findOne({ $and: [{ name: thirdName }, { group: thirdGroup }, { era: thirdEraName }] })

  var thirdIssue = 1
  if (thirdCards != null && thirdCards != undefined) {
    thirdIssue = thirdCards.issue
  } else {
    thirdIssue = 1
  }

  var thirdFrame = "./img/cosmetics/frames/Default_Frame.png"
  var thirdCosmetic = "./img/cosmetics/misc/Barcode.png"
  /*---------------------------------------------DISPLAYING INFORMATION ON CANVAS-------------------------------------------*/

  // MAIN IMAGES: Generates the three main images that will be displayed. These images feature either groups or idols.

  const mainImages = [firstImages, secondImages, thirdImages]
  for (i = 0; i < mainImages.length; i++) {
    const mainImage = await Canvas.loadImage(mainImages[i]);
    context.drawImage(mainImage, (i * 302) + 15, 36, 256, 312);
  }

  // FRAMES: Positions three frames to encase the three main images

  const frames = [firstFrame, secondFrame, thirdFrame]
  for (i = 0; i < frames.length; i++) {
    const frame = await Canvas.loadImage(frames[i])
    context.drawImage(frame, i * 302, 0, 287, 430);
  }

  // ISSUE NUMBER: Places issue numbers on their respective cards 

  const issueNumbers = [firstIssue, secondIssue, thirdIssue]
  for (i = 0; i < issueNumbers.length; i++) {
    context.font = '19px "Prompt"';
    context.textAlign = "left";
    context.fillStyle = "#FFFFFF";
    let issue = ("#" + issueNumbers[i]).toUpperCase();
    context.fillText(issue, (i * 302) + 15, 25);
  }

  // COSMETICS: Decorates with the chosen cosmetic on their respective cards. The default is the barcode.
  const cosmetics = [firstCosmetic, secondCosmetic, thirdCosmetic]
  for (i = 0; i < cosmetics.length; i++) {
    const cosmetic = await Canvas.loadImage(cosmetics[i]);
    context.drawImage(cosmetic, (i * 302) + 226.5, 10, 45, 15);
  }

  // ICONS: Positions the three icons on their correct cards
  const mainIcons = [firstIcons, secondIcons, thirdIcons]
  for (i = 0; i < mainIcons.length; i++) {
    const iconImg = await Canvas.loadImage(mainIcons[i]);
    context.drawImage(iconImg, (i * 302) + 16, 362.5, 59, 51);
  }

  // IDENTIFICATION: Showcases the group or idol names as text on the cards
  const identification = [{ name: firstName, group: firstGroup }, { name: secondName, group: secondGroup }, { name: thirdName, group: thirdGroup }]
  for (i = 0; i < identification.length; i++) {
    if (identification[i].name == "Group") {
      context.font = '22px "Prompt-Bold"';
      context.textAlign = "right";
      context.fillStyle = "#FFFFFF";
      let groupName = (identification[i].group).toUpperCase();
      context.fillText(groupName, (i * 302) + 272, 385);
      context.font = '16px "Prompt-Medium"';
      context.textAlign = "right";
      context.fillStyle = "#FFFFFF";
      let groupLabel = (identification[i].name).toUpperCase();
      context.fillText(groupLabel, (i * 302) + 272, 403);
    } else {
      context.font = '27px "Prompt-Bold"';
      context.textAlign = "right";
      context.fillStyle = "#FFFFFF";
      let idolName = (identification[i].name).toUpperCase();
      context.fillText(idolName, (i * 302) + 272, 385);
      context.font = '16px "Prompt-Medium"';
      context.textAlign = "right";
      context.fillStyle = "#FFFFFF";
      let groupName = (identification[i].group).toUpperCase();
      context.fillText(groupName, (i * 302) + 272, 403);
    }
  }

  // BUFFER AND ATTACHMENT: Attaches the generated card images to the message
  const buffer = canvas.toBuffer("image/png");
  const cardAttachment = { file: buffer, name: "dropCard.png" };

  var messageID = ""
  const firstClaim = []
  const secondClaim = []
  const thirdClaim = []

  var finalFirstWinner = {}
  var finalSecondWinner = {}
  var finalThirdWinner = {}



  const drop = message.channel.createMessage({
    content: `<:starsparkles:900875332159168562> <@${message.author.id}> is dropping cards`,
    components: [
      {
        type: Constants.ComponentTypes.ACTION_ROW, // You can have up to 5 action rows, and 1 select menu per action row
        components: [
          {
            type: Constants.ComponentTypes.BUTTON, // https://discord.com/developers/docs/interactions/message-components#buttons
            style: Constants.ButtonStyles.PRIMARY, // This is the style of the button https://discord.com/developers/docs/interactions/message-components#button-object-button-styles
            custom_id: "first_button",
            label: firstName,
            disabled: false, // Whether or not the button is disabled, is false by default,
          },
          {
            type: Constants.ComponentTypes.BUTTON, // https://discord.com/developers/docs/interactions/message-components#buttons
            style: Constants.ButtonStyles.PRIMARY, // This is the style of the button https://discord.com/developers/docs/interactions/message-components#button-object-button-styles
            custom_id: "second_button",
            label: secondName,
            disabled: false, // Whether or not the button is disabled, is false by default.
          },
          {
            type: Constants.ComponentTypes.BUTTON, // https://discord.com/developers/docs/interactions/message-components#buttons
            style: Constants.ButtonStyles.PRIMARY, // This is the style of the button https://discord.com/developers/docs/interactions/message-components#button-object-button-styles
            custom_id: "third_button",
            label: thirdName,
            disabled: false, // Whether or not the button is disabled, is false by default
          }
        ]
      }]
  }, cardAttachment
  )


  drop.then(async message => {

    client.on("interactionCreate", async (interaction) => {
      if (interaction.message.id == message.id) {
        if (interaction.data.custom_id == "first_button" && interaction.message.id == message.id) {
          await interaction.deferUpdate()
          if (!firstClaim.includes(interaction.member.id) && interaction.message.id == message.id) {
            firstClaim.push(interaction.member.id)
          } if (secondClaim.includes(interaction.member.id) && interaction.message.id == message.id) {
            var playerIndex = secondClaim.indexOf(interaction.member.id)
            secondClaim.splice(playerIndex, 1)
          } if (thirdClaim.includes(interaction.member.id) && interaction.message.id == message.id) {
            var playerIndex = thirdClaim.indexOf(interaction.member.id)
            thirdClaim.splice(playerIndex, 1)
          }
        } else if (interaction.data.custom_id == "second_button" && interaction.message.id == message.id) {
          await interaction.deferUpdate()
          if (!secondClaim.includes(interaction.member.id) && interaction.message.id == message.id) {
            secondClaim.push(interaction.member.id)
          } if (firstClaim.includes(interaction.member.id) && interaction.message.id == message.id) {
            var playerIndex = firstClaim.indexOf(interaction.member.id)
            firstClaim.splice(playerIndex, 1)
          } if (thirdClaim.includes(interaction.member.id) && interaction.message.id == message.id) {
            var playerIndex = thirdClaim.indexOf(interaction.member.id)
            thirdClaim.splice(playerIndex, 1)
          }

        } else if (interaction.data.custom_id == "third_button" && interaction.message.id == message.id) {
          await interaction.deferUpdate()
          if (!thirdClaim.includes(interaction.member.id) && interaction.message.id == message.id) {
            thirdClaim.push(interaction.member.id)
          } if (firstClaim.includes(interaction.member.id) && interaction.message.id == message.id) {
            var playerIndex = firstClaim.indexOf(interaction.member.id)
            firstClaim.splice(playerIndex, 1)
          } if (secondClaim.includes(interaction.member.id) && interaction.message.id == message.id) {
            var playerIndex = secondClaim.indexOf(interaction.member.id)
            secondClaim.splice(playerIndex, 1)
          }
        }
      }

    })

    setTimeout(async () => {
      //now, check dropper claim
      if (firstClaim.length != 0) {
        if (firstClaim.includes(dropper)) {
          var dropPlayer = await user.findOne({ userID: dropper })
          if (dropPlayer != null && dropPlayer != undefined) {
            if (!(await isClaimCooldown(dropper))) {
              firstWinner = dropper
              dropPlayer.claimCooldown = Date.now()
              dropPlayer.save()
              finalFirstWinner = { id: dropper }
            } else if (await isClaimCooldown(dropper)) {
              var playerIndex = firstClaim.indexOf(dropper)
              firstClaim.splice(playerIndex, 1)
              if (firstClaim.length != 0 && !firstClaim.includes(dropper)) {
                var winnerOne = firstClaim[Math.floor(Math.random() * (firstClaim.length))]
                var firstWinner = winnerOne
                var claimer = await user.findOne({ userID: winnerOne })
                while (await isClaimCooldown(winnerOne) && firstClaim.length != 0) {
                  winnerOne = firstClaim[Math.floor(Math.random() * (firstClaim.length))]
                  claimer = await user.findOne({ userID: winnerOne })
                  firstWinner = winnerOne
                  if (await isClaimCooldown(winnerOne)) {
                    var playerIndex = firstClaim.indexOf(winnerOne)
                    firstClaim.splice(playerIndex, 1)
                  }
                }
                if (firstClaim.length != 0 && !(await isClaimCooldown(winnerOne))) {
                  firstWinner = winnerOne
                  finalFirstWinner = { id: firstWinner }
                }
              }
            }
          } else if (dropPlayer == null || dropPlayer == undefined && !(await isClaimCooldown(dropper))) {
            firstWinner = dropper
            finalFirstWinner = { id: dropper }
          }
        } else if (!firstClaim.includes(dropper)) {
          var winnerOne = firstClaim[Math.floor(Math.random() * (firstClaim.length))]
          var firstWinner = winnerOne
          var claimer = await user.findOne({ userID: winnerOne })
          while (await isClaimCooldown(winnerOne) && firstClaim.length != 0) {
            winnerOne = firstClaim[Math.floor(Math.random() * (firstClaim.length))]
            claimer = await user.findOne({ userID: winnerOne })
            firstWinner = winnerOne
            if (await isClaimCooldown(winnerOne)) {
              var playerIndex = firstClaim.indexOf(winnerOne)
              firstClaim.splice(playerIndex, 1)
            }
          }
          if (firstClaim.length != 0 && !(await isClaimCooldown(winnerOne))) {
            firstWinner = winnerOne
            finalFirstWinner = { id: firstWinner }
          }
        }
      }


      if (secondClaim.length != 0) {
        if (secondClaim.includes(dropper)) {
          var dropPlayer = await user.findOne({ userID: dropper })
          if (dropPlayer != null && dropPlayer != undefined) {
            if ((claimTime - (Date.now() - dropPlayer.claimCooldown)) <= 0) {
              secondWinner = dropper
              dropPlayer.claimCooldown = Date.now()
              dropPlayer.save()
              finalSecondWinner = { id: dropper }
            } else if ((claimTime - (Date.now() - dropPlayer.claimCooldown)) > 0) {
              var playerIndex = secondClaim.indexOf(dropper)
              secondClaim.splice(playerIndex, 1)
              if (secondClaim.length != 0 && !secondClaim.includes(dropper)) {
                var winnerTwo = secondClaim[Math.floor(Math.random() * (secondClaim.length))]
                var claimer = await user.findOne({ userID: winnerTwo })
                while (await isClaimCooldown(winnerTwo) && secondClaim.length != 0) {
                  winnerTwo = secondClaim[Math.floor(Math.random() * (secondClaim.length))]
                  claimer = await user.findOne({ userID: winnerTwo })
                  secondWinner = winnerTwo
                  if (await isClaimCooldown(winnerTwo)) {
                    var playerIndex = secondClaim.indexOf(winnerTwo)
                    secondClaim.splice(playerIndex, 1)
                  }
                }
                if (secondClaim.length != 0 && !(await isClaimCooldown(winnerTwo))) {
                  secondWinner = winnerTwo
                  finalSecondWinner = { id: secondWinner }
                }
              }
            }
          } else if (dropPlayer == null || dropPlayer == undefined && !(await isClaimCooldown(winnerTwo))) {
            secondWinner = dropper
            finalSecondWinner = { id: dropper }

          }
        } else if (!secondClaim.includes(dropper)) {
          var winnerTwo = secondClaim[Math.floor(Math.random() * (secondClaim.length))]
          var secondWinner = winnerTwo
          var claimer = await user.findOne({ userID: winnerTwo })
          while (await isClaimCooldown(winnerTwo) && secondClaim.length != 0) {
            winnerTwo = secondClaim[Math.floor((Math.random() * (secondClaim.length)))]
            claimer = await user.findOne({ userID: winnerTwo })
            secondWinner = winnerTwo
            if (await isClaimCooldown(winnerTwo)) {
              var playerIndex = secondClaim.indexOf(winnerTwo)
              secondClaim.splice(playerIndex, 1)
            }
          }
          if (secondClaim.length != 0 && !(await isClaimCooldown(winnerTwo))) {
            secondWinner = winnerTwo
            finalSecondWinner = { id: secondWinner }
          }
        }

      }

      if (thirdClaim.length != 0) {
        if (thirdClaim.includes(dropper)) {
          var dropPlayer = await user.findOne({ userID: dropper })
          if (dropPlayer != null && dropPlayer != undefined) {
            if ((claimTime - (Date.now() - dropPlayer.claimCooldown)) <= 0) {
              thirdWinner = dropper
              dropPlayer.claimCooldown = Date.now()
              dropPlayer.save()
              finalThirdWinner = { id: dropper }
            } else if ((claimTime - (Date.now() - dropPlayer.claimCooldown)) > 0) {
              var playerIndex = thirdClaim.indexOf(dropper)
              thirdClaim.splice(playerIndex, 1)
              if (thirdClaim.length != 0 && !thirdClaim.includes(dropper)) {
                var winnerThree = thirdClaim[Math.floor(Math.random() * (thirdClaim.length))]
                var thirdWinner = winnerThree
                while (await isClaimCooldown(winnerThree) && thirdClaim.length != 0) {
                  winnerThree = thirdClaim[Math.floor(Math.random() * (thirdClaim.length))]
                  thirdWinner = winnerThree
                  if (await isClaimCooldown(winnerThree)) {
                    var playerIndex = thirdClaim.indexOf(winnerThree)
                    thirdClaim.splice(playerIndex, 1)
                  }
                }
                if (thirdClaim.length != 0 && !(await isClaimCooldown(winnerThree))) {
                  thirdWinner = winnerThree
                  finalThirdWinner = { id: thirdWinner }
                }
              }
            }
          } else if (dropPlayer == null || dropPlayer == undefined && !(await isClaimCooldown(winnerThree))) {
            thirdWinner = dropper
            finalThirdWinner = { id: dropper }
          }
        } else if (!thirdClaim.includes(dropper)) {
          var winnerThree = thirdClaim[Math.floor(Math.random() * (thirdClaim.length))]
          var thirdWinner = winnerThree
          var claimer = await user.findOne({ userID: winnerThree })
          while (await isClaimCooldown(winnerThree) && thirdClaim.length != 0) {
            winnerThree = thirdClaim[Math.floor(Math.random() * (thirdClaim.length))]
            claimer = await user.findOne({ userID: winnerThree })
            thirdWinner = winnerThree
            if (await isClaimCooldown(winnerThree)) {
              var playerIndex = thirdClaim.indexOf(winnerThree)
              thirdClaim.splice(playerIndex, 1)
            }
          }

          if (thirdClaim.length != 0 && !(await isClaimCooldown(winnerThree))) {
            thirdWinner = winnerThree
            finalThirdWinner = { id: thirdWinner }
          }
        }
      }

      /*---------------------------------------------------FIRST WINNER AND FIRST CLAIMED CARD-------------------------------------------*/

      if (Object.keys(finalFirstWinner).length != 0) {
        // FIRST WINNER AND CARD DATA: Receives all the necessary information for the card and player who won
        // the card. This includes cardInfo, claimedCards, and user.
        const firstMember = message.channel.guild.members.get(firstWinner)
        const winnerOne = await user.findOne({ userID: firstWinner })

        if (winnerOne == null || winnerOne == undefined) {
          const newData = new user({
            name: firstMember.username,
            userID: firstWinner,
            discriminator: firstMember.discriminator,
            avatar: firstMember.avatarURL,
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
            dateCreated: firstMember.createdAt,
            dateJoined: firstMember.joinedAt,
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
          newData.numCards += 1;
          newData.numClaimed += 1;
          newData.claimCooldown = Date.now();
          newData.save().catch(err => console.log(err));
        } else {
          winnerOne.numCards += 1;
          winnerOne.numClaimed += 1;
          winnerOne.claimCooldown = Date.now()
          winnerOne.save()
        }

        var firstClaimed = await claimedCards.find({ $and: [{ name: firstName }, { group: firstGroup }, { era: firstEraName }] })
        if (firstClaimed.length != 0) {
          firstIssue = Number(Number(firstClaimed[firstClaimed.length - 1].issue) + 1)
          firstIssueWon = { issue: firstIssue }
        } else {
          firstIssue = 1
          firstIssueWon = { issue: firstIssue }
        }
        var issueWorth = 0
        if (firstIssue <= 100) {
          issueWorth = (200 - firstIssue) + 1;
        } if (firstIssue > 100 && firstIssue <= 200) {
          issueWorth = 90;
        } if (firstIssue > 200 && firstIssue <= 300) {
          issueWorth = 80;
        } else if (firstIssue > 300 && firstIssue <= 400) {
          issueWorth = 70;
        } else if (firstIssue > 400 && firstIssue <= 500) {
          issueWorth = 60;
        } else if (firstIssue > 500 && firstIssue <= 600) {
          issueWorth = 50;
        } else if (firstIssue > 600 && firstIssue <= 700) {
          issueWorth = 40;
        } else if (firstIssue > 700 && firstIssue <= 800) {
          issueWorth = 30;
        } else if (firstIssue > 800 && firstIssue <= 900) {
          issueWorth = 20;
        } else if (firstIssue > 900 && firstIssue <= 1000) {
          issueWorth = 10;
        }


        const newData = new claimedCards({
          name: firstName,
          group: firstGroup,
          era: firstEraName,
          issue: firstIssue,
          mainImage: firstImages,
          icon: firstIcons,
          generated: Date.now(),
          claimed: Date.now(),
          condition: firstCondition,
          nameCondition: firstConditionName,
          stars: firstStars,
          worth: (firstConditionWorth * firstCondition) + issueWorth,
          timesTraded: 0,
          timesGifted: 0,
          timesBurned: 0,
          timesUpgraded: 0,
          owner: [firstMember.id],
          labels: [],
          stickers: [],
          frame: { image: firstFrame, x: 0, y: 0, w: 600, h: 900 },
          cosmetics: [{ image: firstCosmetic, x: 477, y: 20, w: 90, h: 40 }],
          bottomHueBar: [],
          topHueBar: [],
          traded: false,
          gifted: false,
          burned: false,
          upgraded: false,
          hueApplied: false
        })
        newData.save().catch(err => console.log(err));
      }

      /*-----------------------------SECOND WINNER AND CLAIMED CARDS------------------------------------------------*/

      if (Object.keys(finalSecondWinner).length != 0) {
        const secondMember = message.channel.guild.members.get(secondWinner)
        const winnerTwo = await user.findOne({ userID: secondWinner })

        if (winnerTwo == null || winnerTwo == undefined) {
          const newData = new user({
            name: secondMember.username,
            userID: secondWinner,
            discriminator: secondMember.discriminator,
            avatar: secondMember.avatarURL,
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
            dateCreated: secondMember.createdAt,
            dateJoined: secondMember.joinedAt,
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
          newData.numCards += 1;
          newData.numClaimed += 1;
          newData.claimCooldown = Date.now();
          newData.save().catch(err => console.log(err));
        } else {
          winnerTwo.numCards += 1;
          winnerTwo.numClaimed += 1;
          winnerTwo.claimCooldown = Date.now();
          winnerTwo.save()
        }

        var secondClaimed = await claimedCards.find({ $and: [{ name: secondName }, { group: secondGroup }, { era: secondEraName }] })
        if (secondClaimed.length != 0) {
          secondIssue = Number(Number(secondClaimed[secondClaimed.length - 1].issue) + 1)
          secondIssueWon = { issue: secondIssue }
        } else {
          secondIssue = 1
          secondIssueWon = { issue: secondIssue }
        }
        var issueWorth = 0
        if (secondIssue <= 100) {
          issueWorth = (200 - secondIssue) + 1;
        } if (secondIssue > 100 && secondIssue <= 200) {
          issueWorth = 90;
        } if (secondIssue > 200 && secondIssue <= 300) {
          issueWorth = 80;
        } else if (secondIssue > 300 && secondIssue <= 400) {
          issueWorth = 70;
        } else if (secondIssue > 400 && secondIssue <= 500) {
          issueWorth = 60;
        } else if (secondIssue > 500 && secondIssue <= 600) {
          issueWorth = 50;
        } else if (secondIssue > 600 && secondIssue <= 700) {
          issueWorth = 40;
        } else if (secondIssue > 700 && secondIssue <= 800) {
          issueWorth = 30;
        } else if (secondIssue > 800 && secondIssue <= 900) {
          issueWorth = 20;
        } else if (secondIssue > 900 && secondIssue <= 1000) {
          issueWorth = 10;
        }

        const newData = new claimedCards({
          name: secondName,
          group: secondGroup,
          era: secondEraName,
          issue: secondIssue,
          mainImage: secondImages,
          icon: secondIcons,
          generated: Date.now(),
          claimed: Date.now(),
          condition: secondCondition,
          nameCondition: secondConditionName,
          stars: secondStars,
          worth: (secondConditionWorth * secondCondition) + issueWorth,
          timesTraded: 0,
          timesGifted: 0,
          timesBurned: 0,
          timesUpgraded: 0,
          owner: [secondMember.id],
          labels: [],
          stickers: [],
          frame: { image: secondFrame, x: 0, y: 0, w: 600, h: 900 },
          cosmetics: [{ image: secondCosmetic, x: 477, y: 20, w: 90, h: 40 }],
          hues: [],
          bottomHueBar: [],
          topHueBar: [],
          traded: false,
          gifted: false,
          burned: false,
          upgraded: false,
          hueApplied: false
        })
        newData.save().catch(err => console.log(err));
      }
      /*----------------------------------THIRD WINNER AND CLAIMED CARDS------------------------------------*/
      if (Object.keys(finalThirdWinner).length != 0) {
        const thirdMember = message.channel.guild.members.get(thirdWinner)
        const winnerThree = await user.findOne({ userID: thirdWinner })

        if (winnerThree == null || winnerThree == undefined) {
          const newData = new user({
            name: thirdMember.username,
            userID: thirdWinner,
            discriminator: thirdMember.discriminator,
            avatar: thirdMember.avatarURL,
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
            dateCreated: thirdMember.createdAt,
            dateJoined: thirdMember.joinedAt,
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
          newData.numCards += 1;
          newData.numClaimed += 1;
          newData.claimCooldown = Date.now();
          newData.save().catch(err => console.log(err));
        } else {
          winnerThree.numCards += 1;
          winnerThree.numClaimed += 1;
          winnerThree.claimCooldown = Date.now();
          winnerThree.save()
        }

        var thirdClaimed = await claimedCards.find({ $and: [{ name: thirdName }, { group: thirdGroup }, { era: thirdEraName }] })
        if (thirdClaimed.length != 0) {
          thirdIssue = Number(Number(thirdClaimed[thirdClaimed.length - 1].issue) + 1)
          thirdIssueWon = { issue: thirdIssue }
        } else {
          thirdIssue = 1
          thirdIssueWon = { issue: thirdIssue }
        }
        var issueWorth = 0
        if (thirdIssue <= 100) {
          issueWorth = (200 - thirdIssue) + 1;
        } if (thirdIssue > 100 && thirdIssue <= 200) {
          issueWorth = 90;
        } if (thirdIssue > 200 && thirdIssue <= 300) {
          issueWorth = 80;
        } else if (thirdIssue > 300 && thirdIssue <= 400) {
          issueWorth = 70;
        } else if (thirdIssue > 400 && thirdIssue <= 500) {
          issueWorth = 60;
        } else if (thirdIssue > 500 && thirdIssue <= 600) {
          issueWorth = 50;
        } else if (thirdIssue > 600 && thirdIssue <= 700) {
          issueWorth = 40;
        } else if (thirdIssue > 700 && thirdIssue <= 800) {
          issueWorth = 30;
        } else if (thirdIssue > 800 && thirdIssue <= 900) {
          issueWorth = 20;
        } else if (thirdIssue > 900 && thirdIssue <= 1000) {
          issueWorth = 10;
        }

        const newData = new claimedCards({
          name: thirdName,
          group: thirdGroup,
          era: thirdEraName,
          issue: thirdIssue,
          mainImage: thirdImages,
          icon: thirdIcons,
          generated: Date.now(),
          claimed: Date.now(),
          condition: thirdCondition,
          nameCondition: thirdConditionName,
          stars: thirdStars,
          worth: (thirdConditionWorth * thirdCondition) + issueWorth,
          timesTraded: 0,
          timesGifted: 0,
          timesBurned: 0,
          timesUpgraded: 0,
          owner: [thirdMember.id],
          labels: [],
          stickers: [],
          frame: { image: thirdFrame, x: 0, y: 0, w: 600, h: 900 },
          cosmetics: [{ image: thirdCosmetic, x: 477, y: 20, w: 90, h: 40 }],
          hues: [],
          bottomHueBar: [],
          topHueBar: [],
          traded: false,
          gifted: false,
          burned: false,
          upgraded: false,
          hueApplied: false
        })
        newData.save().catch(err => console.log(err));
      }
    }, 16000)
    /*------------------------------------------------CLAIM MESSAGES--------------------------------------------------*/

    // CLAIM MESSAGES: Collects the data accumulated throughout the card generation process and uses it to display
    // aesthetic and informational messages.
    setTimeout(async () => {

      const general = await genCards.findOne({ identifier: "Overall Card Tracker" })
      // ONLY FIRST CARD WINNER: If the drop results in only the first card being claimed and won, the claim message will
      // display only the first card winner and the card information
      if (Object.keys(finalFirstWinner).length != 0 && Object.keys(finalSecondWinner).length == 0
        && Object.keys(finalThirdWinner).length == 0) {
        const firstInfo = await cardInfo.findOne({ $and: [{ name: firstName }, { group: firstGroup }, { era: firstEraName }] })
        const firstCard = await claimedCards.find({ $and: [{ name: firstName }, { group: firstGroup }, { era: firstEraName }] })
        const cardCode = firstCard[firstCard.length - 1].code
        const stars = firstCard[firstCard.length - 1].stars
        const firstChosenCard = `<@${finalFirstWinner.id}> collected <:cards:900131721855516743> ` + '`' + cardCode + '` ' + stars + ' **#'
          + Number(firstIssueWon.issue) + " " + firstInfo.group + " " + firstInfo.name + "** (" + firstInfo.era + ")"
        firstInfo.issue = firstIssueWon.issue + 1
        firstInfo.numClaimed = firstInfo.numClaimed + 1
        firstInfo.save()
        general.claimed += 1
        general.save()
        message.edit({ content: firstChosenCard, components: [], attachments: [] });
        message.removeReactions('1️⃣');
        message.removeReactions('2️⃣');
        message.removeReactions('3️⃣');
      }
      // ONLY SECOND CARD WINNER: If the drop results in only the second card being claimed and won, the claim message will
      // display only the second card winner and the card information
      if (Object.keys(finalFirstWinner).length == 0 && Object.keys(finalSecondWinner).length != 0
        && Object.keys(finalThirdWinner).length == 0) {
        const secondInfo = await cardInfo.findOne({ $and: [{ name: secondName }, { group: secondGroup }, { era: secondEraName }] })
        const secondCard = await claimedCards.find({ $and: [{ name: secondName }, { group: secondGroup }, { era: secondEraName }] })
        const cardCode = secondCard[secondCard.length - 1].code
        const stars = secondCard[secondCard.length - 1].stars
        const secondChosenCard = `<@${finalSecondWinner.id}> collected <:cards:900131721855516743> ` + '`' + cardCode + '` ' + stars + ' **#'
          + Number(secondIssueWon.issue) + " " + secondInfo.group + " " + secondInfo.name + "** (" + secondInfo.era + ")"
        secondInfo.issue = secondIssueWon.issue + 1
        secondInfo.numClaimed = secondInfo.numClaimed + 1
        secondInfo.save()
        general.claimed += 1
        general.save()
        message.edit({ content: secondChosenCard, components: [], attachments: [] });
        message.removeReactions('1️⃣');
        message.removeReactions('2️⃣');
        message.removeReactions('3️⃣');
      }

      // ONLY THIRD CARD WINNER: If the drop results in only the third card being claimed and won, the claim message will
      // display only the third card winner and the card information
      if (Object.keys(finalFirstWinner).length == 0 && Object.keys(finalSecondWinner).length == 0
        && Object.keys(finalThirdWinner).length != 0) {
        const thirdInfo = await cardInfo.findOne({ $and: [{ name: thirdName }, { group: thirdGroup }, { era: thirdEraName }] })
        const thirdCard = await claimedCards.find({ $and: [{ name: thirdName }, { group: thirdGroup }, { era: thirdEraName }] })
        const cardCode = thirdCard[thirdCard.length - 1].code
        const stars = thirdCard[thirdCard.length - 1].stars
        const thirdChosenCard = `<@${finalThirdWinner.id}> collected <:cards:900131721855516743> ` + '`' + cardCode + '` ' + stars + ' **#'
          + Number(thirdIssueWon.issue) + " " + thirdInfo.group + " " + thirdInfo.name + "** (" + thirdInfo.era + ")"
        thirdInfo.issue = thirdIssueWon.issue + 1
        thirdInfo.numClaimed = thirdInfo.numClaimed + 1
        thirdInfo.save()
        general.claimed += 1
        general.save()
        message.edit({ content: thirdChosenCard, components: [], attachments: [] });
        message.removeReactions('1️⃣');
        message.removeReactions('2️⃣');
        message.removeReactions('3️⃣');
      }

      // FIRST AND SECOND CARD WINNER: If the drop results in the first and second card being claimed and won, the claim message will
      // display the first and second card winners and the card information
      if (Object.keys(finalFirstWinner).length != 0 && Object.keys(finalSecondWinner).length != 0
        && Object.keys(finalThirdWinner).length == 0) {
        const firstInfo = await cardInfo.findOne({ $and: [{ name: firstName }, { group: firstGroup }, { era: firstEraName }] })
        const secondInfo = await cardInfo.findOne({ $and: [{ name: secondName }, { group: secondGroup }, { era: secondEraName }] })
        const firstCard = await claimedCards.find({ $and: [{ name: firstName }, { group: firstGroup }, { era: firstEraName }] })
        const secondCard = await claimedCards.find({ $and: [{ name: secondName }, { group: secondGroup }, { era: secondEraName }] })
        const firstCardCode = firstCard[firstCard.length - 1].code
        const firstStars = firstCard[firstCard.length - 1].stars
        const firstChosenCard = `<@${finalFirstWinner.id}> collected <:cards:900131721855516743> ` + '`' + firstCardCode + '` ' + firstStars + ' **#'
          + Number(firstIssueWon.issue) + " " + firstInfo.group + " " + firstInfo.name + "** (" + firstInfo.era + ")\n"
        const secondCardCode = secondCard[secondCard.length - 1].code
        const secondStars = secondCard[secondCard.length - 1].stars
        const secondChosenCard = `<@${finalSecondWinner.id}> collected <:cards:900131721855516743> ` + '`' + secondCardCode + '` ' + secondStars + ' **#'
          + Number(secondIssueWon.issue) + " " + secondInfo.group + " " + secondInfo.name + "** (" + secondInfo.era + ")"
        firstInfo.issue = firstIssueWon.issue + 1
        firstInfo.numClaimed = firstInfo.numClaimed + 1
        firstInfo.save()
        secondInfo.issue = secondIssueWon.issue + 1
        secondInfo.numClaimed = secondInfo.numClaimed + 1
        secondInfo.save()
        const totalClaim = firstChosenCard + secondChosenCard
        general.claimed += 2
        general.save()
        message.edit({ content: totalClaim, components: [], attachments: [] });
        message.removeReactions('1️⃣');
        message.removeReactions('2️⃣');
        message.removeReactions('3️⃣');
      }

      // FIRST AND THIRD CARD WINNERS: If the drop results in the first and third card being claimed and won, the claim message will
      // display the first and third card winners and the card information

      if (Object.keys(finalFirstWinner).length != 0 && Object.keys(finalSecondWinner).length == 0
        && Object.keys(finalThirdWinner).length != 0) {
        const firstInfo = await cardInfo.findOne({ $and: [{ name: firstName }, { group: firstGroup }, { era: firstEraName }] })
        const thirdInfo = await cardInfo.findOne({ $and: [{ name: thirdName }, { group: thirdGroup }, { era: thirdEraName }] })
        const firstCard = await claimedCards.find({ $and: [{ name: firstName }, { group: firstGroup }, { era: firstEraName }] })
        const thirdCard = await claimedCards.find({ $and: [{ name: thirdName }, { group: thirdGroup }, { era: thirdEraName }] })
        const firstCardCode = firstCard[firstCard.length - 1].code
        const firstStars = firstCard[firstCard.length - 1].stars
        const firstChosenCard = `<@${finalFirstWinner.id}> collected <:cards:900131721855516743> ` + '`' + firstCardCode + '` ' + firstStars + ' **#'
          + Number(firstIssueWon.issue) + " " + firstInfo.group + " " + firstInfo.name + "** (" + firstInfo.era + ")\n"
        const thirdCardCode = thirdCard[thirdCard.length - 1].code
        const thirdStars = thirdCard[thirdCard.length - 1].stars
        const thirdChosenCard = `<@${finalThirdWinner.id}> collected <:cards:900131721855516743> ` + '`' + thirdCardCode + '` ' + thirdStars + ' **#'
          + Number(thirdIssueWon.issue) + " " + thirdInfo.group + " " + thirdInfo.name + "** (" + thirdInfo.era + ")"
        firstInfo.issue = firstIssueWon.issue + 1
        firstInfo.numClaimed = firstInfo.numClaimed + 1
        firstInfo.save()
        thirdInfo.issue = thirdIssueWon.issue + 1
        thirdInfo.numClaimed = thirdInfo.numClaimed + 1
        thirdInfo.save()
        const totalClaim = firstChosenCard + thirdChosenCard
        general.claimed += 2
        general.save()
        message.edit({ content: totalClaim, components: [], attachments: [] });
        message.removeReactions('1️⃣');
        message.removeReactions('2️⃣');
        message.removeReactions('3️⃣');
      }
      // SECOND AND THIRD CARD WINNERS: If the drop results in the second cards being claimed and won, the claim message will
      // display the second and third card winners and the card information
      if (Object.keys(finalFirstWinner).length == 0 && Object.keys(finalSecondWinner).length != 0
        && Object.keys(finalThirdWinner).length != 0) {

        const secondInfo = await cardInfo.findOne({ $and: [{ name: secondName }, { group: secondGroup }, { era: secondEraName }] })
        const thirdInfo = await cardInfo.findOne({ $and: [{ name: thirdName }, { group: thirdGroup }, { era: thirdEraName }] })
        const secondCard = await claimedCards.find({ $and: [{ name: secondName }, { group: secondGroup }, { era: secondEraName }] })
        const thirdCard = await claimedCards.find({ $and: [{ name: thirdName }, { group: thirdGroup }, { era: thirdEraName }] })
        const secondCardCode = secondCard[secondCard.length - 1].code
        const secondStars = secondCard[secondCard.length - 1].stars
        const secondChosenCard = `<@${finalSecondWinner.id}> collected <:cards:900131721855516743> ` + '`' + secondCardCode + '` ' + secondStars + ' **#'
          + Number(secondIssueWon.issue) + " " + secondInfo.group + " " + secondInfo.name + "** (" + secondInfo.era + ")\n"
        const thirdCardCode = thirdCard[thirdCard.length - 1].code
        const thirdStars = thirdCard[thirdCard.length - 1].stars
        const thirdChosenCard = `<@${finalThirdWinner.id}> collected <:cards:900131721855516743> ` + '`' + thirdCardCode + '` ' + thirdStars + ' **#'
          + Number(thirdIssueWon.issue) + " " + thirdInfo.group + " " + thirdInfo.name + "** (" + thirdInfo.era + ")"
        thirdInfo.issue = thirdIssueWon.issue + 1
        thirdInfo.numClaimed = thirdInfo.numClaimed + 1
        thirdInfo.save()
        secondInfo.issue = secondIssueWon.issue + 1
        secondInfo.numClaimed = secondInfo.numClaimed + 1
        secondInfo.save()
        const totalClaim = secondChosenCard + thirdChosenCard
        general.claimed += 2
        general.save()
        message.edit({ content: totalClaim, components: [], attachments: [] });
        message.removeReactions('1️⃣');
        message.removeReactions('2️⃣');
        message.removeReactions('3️⃣');
      }

      // ALL CARD WINNERS: If the drop results in all cards being claimed and won, the claim message will
      // display all card winners and the card information

      if (Object.keys(finalFirstWinner).length != 0 && Object.keys(finalSecondWinner).length != 0
        && Object.keys(finalThirdWinner).length != 0) {
        const firstInfo = await cardInfo.findOne({ $and: [{ name: firstName }, { group: firstGroup }, { era: firstEraName }] })
        const secondInfo = await cardInfo.findOne({ $and: [{ name: secondName }, { group: secondGroup }, { era: secondEraName }] })
        const thirdInfo = await cardInfo.findOne({ $and: [{ name: thirdName }, { group: thirdGroup }, { era: thirdEraName }] })
        const firstCard = await claimedCards.find({ $and: [{ name: firstName }, { group: firstGroup }, { era: firstEraName }] })
        const secondCard = await claimedCards.find({ $and: [{ name: secondName }, { group: secondGroup }, { era: secondEraName }] })
        const thirdCard = await claimedCards.find({ $and: [{ name: thirdName }, { group: thirdGroup }, { era: thirdEraName }] })
        const firstCardCode = firstCard[firstCard.length - 1].code
        const firstStars = firstCard[firstCard.length - 1].stars
        const firstChosenCard = `<@${finalFirstWinner.id}> collected <:cards:900131721855516743> ` + '`' + firstCardCode + '` ' + firstStars + ' **#'
          + Number(firstIssueWon.issue) + " " + firstInfo.group + " " + firstInfo.name + "** (" + firstInfo.era + ")\n"
        const secondCardCode = secondCard[secondCard.length - 1].code
        const secondStars = secondCard[secondCard.length - 1].stars
        const secondChosenCard = `<@${finalSecondWinner.id}> collected <:cards:900131721855516743> ` + '`' + secondCardCode + '` ' + secondStars + ' **#'
          + Number(secondIssueWon.issue) + " " + secondInfo.group + " " + secondInfo.name + "** (" + secondInfo.era + ")\n"
        const thirdCardCode = thirdCard[thirdCard.length - 1].code
        const thirdStars = thirdCard[thirdCard.length - 1].stars
        const thirdChosenCard = `<@${finalThirdWinner.id}> collected <:cards:900131721855516743> ` + '`' + thirdCardCode + '` ' + thirdStars + ' **#'
          + Number(thirdIssueWon.issue) + " " + thirdInfo.group + " " + thirdInfo.name + "** (" + thirdInfo.era + ")"
        firstInfo.issue = firstIssueWon.issue + 1
        firstInfo.numClaimed = firstInfo.numClaimed + 1
        firstInfo.save()
        secondInfo.issue = secondIssueWon.issue + 1
        secondInfo.numClaimed = secondInfo.numClaimed + 1
        secondInfo.save()
        thirdInfo.issue = thirdIssueWon.issue + 1
        thirdInfo.numClaimed = thirdInfo.numClaimed + 1
        thirdInfo.save()
        const totalClaim = firstChosenCard + secondChosenCard + thirdChosenCard
        general.claimed += 3
        general.save()
        message.edit({ content: totalClaim, components: [], attachments: [] });
        message.removeReactions('1️⃣');
        message.removeReactions('2️⃣');
        message.removeReactions('3️⃣');
      }


      // NO WINNER: If the drop results in no cards being claimed or won, there will be a small given message
      if (Object.keys(finalFirstWinner).length == 0 && Object.keys(finalSecondWinner).length == 0
        && Object.keys(finalThirdWinner).length == 0) {
        const noCards = "<:starsparkles:900875332159168562> No cards were claimed during the drop"
        message.edit({ content: noCards, components: [], attachments: [] });
        message.removeReactions('1️⃣');
        message.removeReactions('2️⃣');
        message.removeReactions('3️⃣');
      }
    }, 17000)
  })
}



module.exports.config = {
  name: "drop",
  description: "Generates three random cards to be claimed by players",
  aliases: []
}