const genMags = require('../../models/overallMags.js');

module.exports.execute = async () => {
    var note = "Overall magazine tracker"

    genMags.findOne({
    note: note
    }, (err, data) => {
    if (err) console.log(err);

    if (!data) {
        const newData = new genMags({
            note: note,
            magCode: 0,
            numGenerated: 1,
        })
        newData.save().catch(err => console.log(err));
    } else {
        data.numGenerated += 1;
        data.save();
     }

   })

}

module.exports.config = {
    name: "hueTracker",
    aliases: [],
}
  