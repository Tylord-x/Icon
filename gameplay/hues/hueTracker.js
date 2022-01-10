const genHues = require('../../models/overallHues.js');

module.exports.execute = async () => {

    const hueTracker = await genHues.findOne({ identifier: "Overall Hue Tracker" })

    if (hueTracker == null || hueTracker == undefined) {
        const newData = new genHues({
            identifier: "Overall Hue Tracker",
            code: 0,
            generated: 1,
            owned: 0
        })
        newData.save().catch(err => console.log(err));
    } else {
        hueTracker.generated += 1
        hueTracker.save()
    }
}
module.exports.config = {
    name: "hueTracker",
    aliases: [],
}

