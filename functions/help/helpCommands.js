function helpCommands(commandName) {

    /*-------------------------------------------THE BASICS------------------------------------------*/
    if(commandName == "help") {
        return "**Command**\n`help`\n\nA central hub of all in-game commands. All commands are categorized by usage."
    }

    if(commandName == "drop") {
        return "**Command**\n`drop`\n\n**Gameplay**\nGenerates three claimable cards. The dropping player has priority over cards in their drop, while other players are still able to claim cards within the drop not collected by the dropper.\n\n**Card Generation**\nThe most fundamental function of playing Icon is generating cards, or dropping. When dropping, three randomized cards will appear with three reaction buttons attached below to claim cards. The first button corresponds to the left most card, the second button corresponds with the center card, and the third button corresponds to the right most card. Each card is claimable as long as players are off cooldowns."
    }

    if(commandName == "balance" || commandName == "bal") {
        return "**Command**\n`balance`\n\n**Shortcuts**\n`bal`\n\n**Gameplay**\nShowcases the balance of a player. There are two different currencies shown: diamonds and opals. Diamonds is considered the rarer, premium currency, while opals is the regular currency.\n\n<:diamond:898641993511628800> **Diamonds** (Premium Currency) / <:opal:899430579831988275> **Opals** (Regular Currency)"
    }

    if(commandName == "daily") {
        return "**Command**\n`daily`\n\n**Shortcuts**\n`d`\n\n**Gameplay**\nProvides players with a set amount of diamonds and opals every 24 hours.\n\n<:diamond:898641993511628800> **Diamonds** (Premium Currency) / <:opal:899430579831988275> **Opals** (Regular Currency)"
    }

    if(commandName == "cooldown" || commandName == "cd" || commandName == "t") {
        return "**Command**\n`cooldown`\n\n**Shortcuts**\n`cd | t`\n\n**Gameplay**\nLists the drop, claim, and daily cooldowns.\n\n<:cooldown:903784440403230772> **Drop Cooldown** is 25 minutes ﹒ A timeout from performing the drop command\n\n<:cooldown:903784440403230772> **Claim Cooldown** is 10 minutes﹒A timeout on claiming cards from drops\n\n<:cooldown:903784440403230772> **Daily Cooldown** is 24 hours﹒A timeout from performing the daily command"
    }

    if(commandName == "inventory" || commandName == "inv" || commandName == "i") {
        return "**Command**\n`inventory`\n\n**Shortcuts**\n`inv | i`\n\n**Usage**\n`inv or inv [mention player / id]`\n\n**Gameplay**\nDisplays all the cards a player currently has in their possession. It is arranged by issue number. Filters such as `g= (group), n= (name), e= (era), c= (condition), i= (issue), l= (label), s= (sort), and v= (true or yes)` can be used to narrow down results.\n\nTo view another player's inventory, use the format of `inv [mention player]` or `inv [player id]`. Filters can also be used when viewing the inventories of other players."
    }

    
    if(commandName == "trade") {
        return "**Command**\n`trade`\n\n**Usage**\n`trade [mention player]`\n\n**Gameplay**\nTrade cards with other players. This can be done by performing the command and mentioning another player. The trade process will include further instructions once begun."
    }

    if(commandName == "gift") {
        return "**Command**\n`gift`\n\n**Shortcuts**\n`g`\n\n**Usage**\n`gift [mention player] or [player id]`\n\n**Gameplay**\nGift cards to other players through mentioning or using their ids."
    }

    if(commandName == "pay") {
        return "**Command**\n`pay`\n\n**Usage**\n`pay [mention player / player id] [amount] [currency]`\n\n**Gameplay**\nPay other players either diamonds or opals."
    }

    if(commandName == "pay") {
        return "**Command**\n`buy`\n\n**Usage**\n`buy [card code]`\n\n**Gameplay**\nIf a card is found within the card market, it can be purchased with `buy` and its card code."
    }

    if(commandName == "labels") {
        return "**Command**\n`labels`\n\n**Gameplay**\nProvides a list of all the labels a player has created. Next to each label name, there is a number that represents the amount of cards belonging to each label. View other the labels of other players by mentioning them or using their id."
    }

    
    if(commandName == "createlabel") {
        return "**Command**\n`createlabel`\n\n**Shortcuts**\n`cl`\n\n**Usage**\n`cl [emoji] [label name]`\n\n**Gameplay**\nCreate a label to add to cards within your inventory. This can be done by using the format `createlabel [emoji] [label name]`."
    }

      
    if(commandName == "addlabel") {
        return "**Command**\n`addlabel`\n\n**Shortcuts**\n`al`\n\n**Usage**\n`al [label name] [card codes]`\n\n**Gameplay**\nAdd a label to add to one or multiple cards cards within your inventory. This can be done by using the format `addlabel [label name] [card codes]`."
    }

    if(commandName == "removelabel") {
        return "**Command**\n`addlabel`\n\n**Shortcuts**\n`rl`\n\n**Usage**\n`rl [card codes]`\n\n**Gameplay**\nRemove labels from one or multiple cards cards within your inventory. This can be done by using the format `removelabel [card code]`."
    }

    if(commandName == "deletelabel") {
        return "**Command**\n`deletelabel`\n\n**Shortcuts**\n`dl`\n\n**Usage**\n`dl [label name]`\n\n**Gameplay**\nDelete a label from your labels collection. This can be done by using the format `deletelabel [label name]`."
    }


    /*------------------------------------------------PROFILE------------------------------------------*/

    if(commandName == "profile" || commandName == "p") {
        return "**Command**\n`profile`\n\n**Shortcuts**\n`p`\n\n**Gameplay**\nCreates and displays a highly customizable player profile. Add a color of your choice, write a collection list of your desired cards, visually show off your favorite artists with badges and brand ambassadors, and more. Your profile is unique to you and your gameplay style."
    }

    if(commandName == "color") {
        return "**Command**\n`color`\n\n**Usage**\n`color [hex code]`\n\n**Gameplay**\nCustomize the sidebar and visuals of your profile with a splash of color."
    }

    if(commandName == "description" || commandName == "desc") {
        return "**Command**\n`description`\n\n**Shortcuts**\n`desc`\n\n**Usage**\n`desc [description]`\n\n**Gameplay**\nInsert freeform content about you, your gameplay style, or other information you want to showcase in your profile."
    }

    if(commandName == "collects") {
        return "**Command**\n`collects`\n\n**Usage**\n`collects [collection list]`\n\n**Gameplay**\nCreate a collection list or description of your desired artists or cards for your profile"
    }

    if(commandName == "badge") {
        return "**Command**\n`badge`\n\n**Usage**\n`badge [spot] [g=(group), n=(name), e=(era)]`\n\n**Gameplay**\nAdd the in-game icons of your favorite artists to your profile by adding badges. Use `badge [spot] [g= (group), n= (name) and/or e= (era)]` to select your desired icon. This can, for example, look like `badge 2 n=soyeon e=dumdi dumdi`. The badge chosen will appear and wait to be confirmed before being officially added to the profile."
    }

    
    if(commandName == "brand" || commandName == "brandambassador") {
        return "**Command**\n`brand`\n\n**Usages**\n`brand [g=(group), n=(name), e=(era)]`\n\n**Gameplay**\nAdd one of your favorite artists as the focal point of your profile by choosing a brand ambassador. Use `brand [g= (group), n= (name) and/or e= (era)]` to select your desired image. This can, for example, look like `brand n=soyeon e=dumdi dumdi`. Unlike badges, brand ambassador will be placed in a pre-determined position in the profile. The ambassador will be added once confirmed."
    }

    if(commandName == "removebadge" || commandName == "rmbadge") {
        return "**Command**\n`removebadge`\n\n**Shortcuts**\n`rmbadge`\n\n**Usages**\n`rmbadge [spot in profile]`\n\n**Gameplay**\nRemove a single badge from a profile at a time by indicating the spot (1-6) to remove. The badge will no longer be visible in its spot."
    }

    
    if(commandName == "removebadges" || commandName == "rmbadges") {
        return "**Command**\n`removebadges`\n\n**Shortcuts**\n`rmbadges`\n\n**Usages**\n`rmbadges`\n\n**Gameplay**\nRemove all badges within your profile to start fresh."
    }

    if(commandName == "cardmarket" || commandName == "cm") {
        return "**Command**\n`cardmarket`\n\n**Shortcuts**\n`cm`\n\n**Gameplay**\nThe card market, also known as Prismatic Cards, provides buyable cards for a price in opals. These cards are burned cards that are 100 issue print and over."
    }

    if(commandName == "shop") {
        return "**Command**\n`shop`\n\n**Gameplay**\nThe shop contains purchasable cosmetics and other items. Look around at all of the latest items in stock."
    }

    

}

module.exports = {
    helpCommands
};