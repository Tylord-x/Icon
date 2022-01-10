/*---------------------------------------LOADING IN THE PACKAGES---------------------------------------*/
// MODELS: Gets the necessary data models from the database to complete the cooldown process
const user = require('../models/user.js');

//TIME: Provides the cooldown times for codes and a package that formats time
const duration = require('humanize-duration')
const droptimeout = 1.5 * 10 ** 6; // Creates a drop cooldown of 25 minutes
const claimtimeout = 600000; // Creats a claim cooldown of 10 minutes

/*--------------------------------CREATE COOLDOWN COMMAND: BEGINNING COOLDOWN PROCESS----------------------------------------------*/
module.exports = {
  name: 'cooldown',
  description: "Players can check their cooldowns for drop, claim, and daily",
  aliases: ["cd", "t"],
  async execute(client, message, args, Eris) {
    const member = message.member.user;
    const player = await user.findOne({ userID: member.id })

    var dailycd, claimcd, dropcd = null; // Sets all the cooldowns to null
    const timeout = 8.64 * 10 ** 7; // Receives the daily time (24 hours)

    // PLAYER: Checks if the player is null or undefined. If the player is found,
    // their cooldowns are checked and showcased. Otherwise, the player will be
    // provided with the default cooldown phrases.
    if (player != null && player != undefined) {

      dailycd = player.daily; // The daily cooldown of the player
      claimcd = player.claimCooldown; // The claim cooldown of the player
      dropcd = player.dropCooldown; // The drop cooldown of the player

      var claimedCD = false // Checks if player is on claim cooldown
      var droppedCD = false // Checks if player is on drop cooldown

      function claimcooldown(cooldownTime) {
        if (claimtimeout - (Date.now() - cooldownTime) > 0) {
          claimedCD = true // True if on cooldown
        }
        else {
          claimedCD = false // False if not on cooldown
        }
        return claimedCD
      }
      function dropcooldown(cooldownTime) {
        if (droptimeout - (Date.now() - cooldownTime) > 0) {
          droppedCD = true // True if on cooldown
        }
        else {
          droppedCD = false // False if not on cooldown
        }
        return droppedCD
      }

      // DROP COOLDOWN: Checks if the player has a drop cooldown. If so, their time left will be displayed in the format of 
      // hours, minutes, and seconds. If they are not on cooldown, it will provide a predetermined phrase
      var dropTime = ""
      if (dropcd != undefined && dropcooldown(dropcd)) {
        var timeLeft = duration(droptimeout - (Date.now() - dropcd), { units: ['h', 'm', 's'], conjunction: " and ", round: true });
        dropTime = timeLeft; // Stores the time left in the drop cooldown
      } else {
        dropTime = 'Drop is now available!'
      }

      // CLAIM COOLDOWN: Checks if the player has a claim cooldown. If so, their time left will be displayed in the format of 
      // hours, minutes, and seconds. If they are not on cooldown, it will provide a predetermined phrase
      var claimTime = ""
      if (claimcd != undefined && claimcooldown(claimcd)) {
        var timeLeft = duration(claimtimeout - (Date.now() - claimcd), { units: ['h', 'm', 's'], conjunction: " and ", round: true });
        claimTime = timeLeft; // Stores the time left in the claim cooldown
      } else {
        claimTime = 'Claim is now available!';
      }

      // DAILY COOLDOWN: Checks if the player has a daily cooldown. If so, their time left will be displayed in the format of 
      // hours, minutes, and seconds. If they are not on cooldown, it will provide a predetermined phrase
      var dailyTime = ""
      if (dailycd != null && (timeout - (Date.now() - dailycd) > 0)) {
        var timeLeft = duration(timeout - (Date.now() - dailycd), { units: ['h', 'm', 's'], conjunction: " and ", round: true });
        dailyTime = timeLeft // Stores the time left in the daily cooldown
      } else {
        dailyTime = 'Daily can now be claimed!';
      }

      const cooldowns = new Eris.RichEmbed()
        .setTitle("")
        .setColor("#33A7FF")
        .setDescription(`<:cooldown:903784440403230772> **` + member.username.toUpperCase() + `'S COOLDOWNS**`)
        .addField('**Drop Cooldown**', dropTime)
        .addField('**Claim Cooldown**', claimTime)
        .addField('**Daily Cooldown**', dailyTime)
        .setFooter(`${member.username}#${member.discriminator} | Showing Cooldowns`, member.avatarURL, member.avatarURL)
      message.channel.createMessage({ embed: cooldowns });

    } else if (player == null || player == undefined) {

      // NEW PLAYER: If a player is new and does not have a cooldown, as well as if this is their first interaction with the bot,
      // the predetermined cooldown phrases below will be added to the embed.
      const daily = 'Daily can now be claimed!';
      const claim = 'Claim is now available!';
      const drop = 'Drop is now available!';

      const cooldowns = new Eris.RichEmbed()
        .setTitle("")
        .setColor("#33A7FF")
        .setDescription(`<:cooldown:903784440403230772> **` + member.username.toUpperCase() + `'S COOLDOWNS**`)
        .addField('**Drop Cooldown**', drop)
        .addField('**Claim Cooldown**', claim)
        .addField('**Daily Cooldown**', daily)
        .setFooter(`${member.username}#${member.discriminator} | Showing Cooldowns`, member.avatarURL, member.avatarURL)
      message.channel.createMessage({ embed: cooldowns });

    }

    var claimcooldown = async function (id) {
      const userData = await user.findOne({ userID: id })
      var onCooldown = false
      if (userData == null || userData == undefined) {
        onCooldown = false
      } else {
        let cooldownTime = userData.claimCooldown;
        if (claimtimeout - (Date.now() - cooldownTime) > 0) {
          onCooldown = true
        }
        else {
          onCooldown = false
        }
      }
      return onCooldown
    }

    async function isClaimCooldown(id) {
      const userData = await user.findOne({ userID: id })
      var onCooldown = false
      if (userData == null || userData == undefined) {
        onCooldown = false
      } else {
        let cooldownTime = userData.claimCooldown;
        if (claimtimeout - (Date.now() - cooldownTime) > 0) {
          onCooldown = true
        }
        else {
          onCooldown = false
        }
      }
      return onCooldown
    }

    async function isDropCooldown(id) {
      const userData = await user.findOne({ userID: id })
      var onCooldown = false
      if (userData == null || userData == undefined) {
        onCooldown = false
      } else {
        let cooldownTime = userData.dropCooldown;
        if (droptimeout - (Date.now() - cooldownTime) > 0) {
          onCooldown = true
        }
        else {
          onCooldown = false
        }
      }
      return onCooldown
    }

  }
}