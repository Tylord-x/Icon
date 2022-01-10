const genCards = require('../../models/overallCards.js');

module.exports.execute = async () => {

    const cardTracker = await genCards.findOne({ identifier: "Overall Card Tracker" })

    if (cardTracker == null || cardTracker == undefined) {
        const newData = new genCards({
            identifier: "Overall Card Tracker",
            code: 0,
            generated: 3,
            claimed: 0
        })
        newData.save().catch(err => console.log(err));
    } else {
        cardTracker.generated += 3
        cardTracker.save()
    }
}
module.exports.config = {
    name: "cardTracker",
    aliases: [],
}



