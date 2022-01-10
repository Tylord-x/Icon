require('pluris');


module.exports = {
    name: 'about',
    description: "gives a brief summary of the bot",
    execute(client, message, args, Eris){
        //embed
        const about = new Eris.RichEmbed()
        .setTitle('About Icon.')
        .setDescription("A magazine-themed kpop trading card bot. Build up your own collection of assorted idol and group cards and establish a highly-customizable magazine. \n\n **Collect** \nWith consistent releases of cards, there will be endless opportunities to create your dream collection.\n\n**Trade**\n Interact and trade with other players to acheive your gameplay goals.\n\n**Create** \n Become the CEO of your own company and develop your own highly-customized magazine.")
        .setColor("33A7FF")
        .setImage("https://i.imgur.com/NCGSU0d.png")
        .setFooter('Established August 2021');
        message.channel.createMessage({embed: about});
    }
    
}