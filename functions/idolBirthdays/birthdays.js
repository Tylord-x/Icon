function helpCommands(idolName, idolGroup) {

    // (G)I-DLE
    if(idolName == "Soojin" && idolGroup == "(G)I-DLE") {
        return ""
    }
    if(commandName == "drop") {
        return "**Command Name**\n`drop`\n\nGenerates three cards that are able to be claimed. These cards are randomized and vary in content."
    }
    if(commandName == "inventory" || commandName == "inv" || commandName == "i") {
        return "**Command Name**\n`inventory | inv | i`\n\nDisplays all the cards a player owns. Inventory features labels, card codes, conditions, issue numbers, and group and member names. There is an option to narrow down or sort what is shown in the inventory with inventory filtering. \n\n**Special Uses**"
    }


}

module.exports = {
    helpCommands
};