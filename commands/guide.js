require('pluris');


module.exports = {
    name: 'guide',
    description: "shows all the current commands",
    execute(client, message, args, Eris){
        //embed
        const guide = new Eris.RichEmbed()
        .setTitle('Icon Guide')
        .setDescription("")
        .setColor("33A7FF")
        .setDescription("Here is a small guide to understanding all of the current commands within the bot. Need more help? Visit the official Icon server and get all your questions answered. \n\n `-join`: Sets up an official profile of a player in the Icon playerbase. Use this to be able to play. \n\n`-drop`: Displays a set of three cards that can be claimed. The dropper has priority over the cards in their drop. \n\n`-view | -v `: Shows the most recent in a player's inventory. \n\n`-view [card code] | -v [card code]`: Displays the card with the specified card code and its information. \n\n`-inventory | -inv`: Populates all the cards currently in a player's collection. \n\n`-inventory [player id] | -inv [player id]`: Searches for and displays the inventory of a player by their id.\n\n `-trade [user]`: Initiate a trade with another player by mentioning them after the trade command and then follow the steps given within the designated trade embed. \n\n `-cooldown | -cd | -t`: Gives the duration of time until each feature of gameplay, such as drop and claim, are available to use.\n\n `-userinfo | -ui`: Showcases information on a player and their time using Icon.\n\n `-userinfo [player id or mention] | -ui [player id or mention]`: Searches for and showcases information on the specified player and their time using Icon.\n\n `-rules`: Views all the rules that should be upheld by all players when using Icon. \n\n")
        .setThumbnail(client.user.avatarURL)
        .setFooter('Established August 2021');
        message.channel.createMessage({embed: guide});
    }
    
}