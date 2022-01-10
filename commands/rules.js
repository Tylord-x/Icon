require('pluris');


module.exports = {
    name: 'rules',
    description: "this is the bot rules command",
    execute(client, message, args, Eris){
        //embed
        const rule = new Eris.RichEmbed()
        .setTitle('R U L E S')
        .setDescription("In order to have a successful and enjoyable experience with the bot, it is important to read all of the rules. If there are further questions, check out the #help channel of the icon official server.")
        .setColor("33A7FF")
        //.setThumbnail(client.user.displayAvatarURL())
        .addField('01. Be Kind', 'Please be kind and respectful towards the other players.')
        .addField('02. No Harrassment or Hate Speech', "Harrassment and hate speech will not be tolerated, and will result in the blacklisting of the player. Let's keep this place a safe space to have fun.")
        .addField('03. No Spamming', 'Please wait until your cooldown time is over to drop/claim issues, and do not repeatedly use commands within a short period of time for no reason.')
        .addField('04. No Alting', 'Alting is when one person uses multiple of their own accounts to play the game, which provides an automatic advantage. This behavior will result in the blacklisting of the cheating player.')
        .addField('05. No Cross-Trading', 'Cross-Trading is when you trade currency acquired from outside of the bot, such as real-world currency.')
        .addField('06. No Funneling', 'Funneling is when you give cards or currency from non-playing accounts, such as alting or asking your friends to mass-gift you cards and/or currency.')
        .addField('07. Contact Admins', 'In case of violation of these rules or suspicion of another user, please do not hesitate to contact an admin.')
        //.setImage('https://i.ytimg.com/vi/WA8CYmDF8t0/maxresdefault.jpg')
        .setFooter('If any of the above rules are broken, it may result in an inventory wipe, as well as the banning of alt accounts.\n\nRemember to have fun!');
        message.channel.createMessage({embed: rule});
    }
    
}