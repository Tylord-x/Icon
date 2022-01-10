
const ReactionHandler = require('eris-reactions');

async function inventory(viewer, player, playerName, playerDiscriminator, playerAvatar, search, filters, user, claimedCards, ReactionHandler, Eris, message) {

    var messager = false;

    if (player == viewer.id) {
        messager = true
    }

    const owner = await user.findOne({ userID: player })

    if ((owner != null && owner != undefined) || messager) {
        if (owner == null || owner == undefined) {
            saveCards = []
        } else if (owner != null && owner != undefined) {
            saveCards = await claimedCards.find({ $and: [{ owner: owner.userID }, { code: { $in: owner.inventory } }] })
        }
        var totalCards = saveCards.length
        var totalCardContent = ""
        if (totalCards == 1) {
            totalCardContent = "Card"
        } else {
            totalCardContent = "Cards"
        }

        const groups = []
        for (i = 0; i < saveCards.length; i++) {
            groups.push(saveCards[i].group)
        }

        const unique = (value, index, self) => {
            return self.indexOf(value) === index
        }
        const getGroups = groups.filter(unique).length
        var numGroups = ""
        if (getGroups == 1) {
            numGroups = "Group"
        } else {
            numGroups = "Groups"
        }

        var cards = []

        const inventory = []
        var pageCount = 0
        var page = 1
        const pages = []

        var firstFilter = ""
        var firstContent;
        var secondFilter = ""
        var secondContent;
        var thirdFilter = ""
        var thirdContent;
        var fourthFilter = ""
        var fourthContent;
        var fifthFilter = ""
        var fifthContent;
        var sort = "";
        var sortBy = 0;
        var sortIndex = 0;
        var view = false
        var viewIndex = 0;

        if (owner != null && owner != undefined) {
            if (filters.length != 0) {
                for (i = 0; i < filters.length; i++) {
                    if (i == 0) {
                        firstFilter = filters[i].name
                        if (firstFilter == "name" || firstFilter == "group" || firstFilter == "labels" || firstFilter == "era") {
                            firstContent = { $regex: filters[i].content, $options: "i" }
                        } else if (firstFilter == "issue" || firstFilter == "condition") {
                            firstContent = Number(filters[i].content)
                            firstContent = Number(firstContent)
                        } else if (firstFilter == "sort") {
                            if (filters[i].content == "n" || filters[i].content == "N" || filters[i].content == "name" || filters[i].content == "Name") {
                                sort = "name"
                                sortBy = 1
                            } else if (filters[i].content == "g" || filters[i].content == "G" || filters[i].content == "group" || filters[i].content == "Group") {
                                sort = "group"
                                sortBy = 1
                            } else if (filters[i].content == "e" || filters[i].content == "E" || filters[i].content == "era" || filters[i].content == "Era") {
                                sort = "era"
                                sortBy = 1
                            } else if (filters[i].content == "c" || filters[i].content == "C" || filters[i].content == "condition" || filters[i].content == "Condition") {
                                sort = "condition"
                                sortBy = -1
                            } else if (filters[i].content == "l" || filters[i].content == "L" || filters[i].content == "label" || filters[i].content == "Label" || filters[i].content == "labels" || filters[i].content == "Labels") {
                                sort = "labels"
                                sortBy = 1
                            }
                            sortIndex = i
                        } else if (firstFilter == "view") {
                            if (filters[i].content == "t" || filters[i].content == "T" || filters[i].content == "true" || filters[i].content == "True" || filters[i].content == "y" || filters[i].content == "Y"
                                || filters[i].content == "Yes" || filters[i].content == "yes") {
                                view = true
                                viewIndex = i
                            }
                        }
                    }
                    if (i == 1) {
                        secondFilter = filters[i].name
                        if (secondFilter == "name" || secondFilter == "group" || secondFilter == "labels" || secondFilter == "era") {
                            secondContent = { $regex: filters[i].content, $options: "i" }
                        } else if (secondFilter == "issue" || secondFilter == "condition") {
                            secondContent = Number(filters[i].content)
                            secondContent = Number(secondContent)
                        } else if (secondFilter == "sort") {
                            if (filters[i].content == "n" || filters[i].content == "N" || filters[i].content == "name" || filters[i].content == "Name") {
                                sort = "name"
                                sortBy = 1
                            } else if (filters[i].content == "g" || filters[i].content == "G" || filters[i].content == "group" || filters[i].content == "Group") {
                                sort = "group"
                                sortBy = 1
                            } else if (filters[i].content == "e" || filters[i].content == "E" || filters[i].content == "era" || filters[i].content == "Era") {
                                sort = "era"
                                sortBy = 1
                            } else if (filters[i].content == "c" || filters[i].content == "C" || filters[i].content == "condition" || filters[i].content == "Condition") {
                                sort = "condition"
                                sortBy = -1
                            } else if (filters[i].content == "l" || filters[i].content == "L" || filters[i].content == "label" || filters[i].content == "Label" || filters[i].content == "labels" || filters[i].content == "Labels") {
                                sort = "labels"
                                sortBy = 1
                            }
                            sortIndex = i
                        } else if (secondFilter == "view") {
                            if (filters[i].content == "t" || filters[i].content == "T" || filters[i].content == "true" || filters[i].content == "True" || filters[i].content == "y" || filters[i].content == "Y"
                                || filters[i].content == "Yes" || filters[i].content == "yes") {
                                view = true
                                viewIndex = i
                            }
                        }
                    }
                    if (i == 2) {
                        thirdFilter = filters[i].name
                        if (thirdFilter == "name" || thirdFilter == "group" || thirdFilter == "labels" || thirdFilter == "era") {
                            thirdContent = { $regex: filters[i].content, $options: "i" }
                        } else if (thirdFilter == "issue" || thirdFilter == "condition") {
                            thirdContent = Number(filters[i].content)
                            thirdContent = Number(thirdContent)
                        } else if (thirdFilter == "sort") {
                            if (filters[i].content == "n" || filters[i].content == "N" || filters[i].content == "name" || filters[i].content == "Name") {
                                sort = "name"
                                sortBy = 1
                            } else if (filters[i].content == "g" || filters[i].content == "G" || filters[i].content == "group" || filters[i].content == "Group") {
                                sort = "group"
                                sortBy = 1
                            } else if (filters[i].content == "e" || filters[i].content == "E" || filters[i].content == "era" || filters[i].content == "Era") {
                                sort = "era"
                                sortBy = 1
                            } else if (filters[i].content == "c" || filters[i].content == "C" || filters[i].content == "condition" || filters[i].content == "Condition") {
                                sort = "condition"
                                sortBy = -1
                            } else if (filters[i].content == "l" || filters[i].content == "L" || filters[i].content == "label" || filters[i].content == "Label" || filters[i].content == "labels" || filters[i].content == "Labels") {
                                sort = "labels"
                                sortBy = 1
                            }
                            sortIndex = i
                        } else if (thirdFilter == "view") {
                            if (filters[i].content == "t" || filters[i].content == "T" || filters[i].content == "true" || filters[i].content == "True" || filters[i].content == "y" || filters[i].content == "Y"
                                || filters[i].content == "Yes" || filters[i].content == "yes") {
                                view = true
                                viewIndex = i
                            }
                        }
                    }
                    if (i == 3) {
                        fourthFilter = filters[i].name
                        if (fourthFilter == "name" || fourthFilter == "group" || fourthFilter == "labels" || fourthFilter == "era") {
                            fourthContent = { $regex: filters[i].content, $options: "i" }
                        } else if (fourthFilter == "issue" || fourthFilter == "condition") {
                            fourthContent = Number(filters[i].content)
                            fourthContent = Number(fourthContent)
                        } else if (fourthFilter == "sort") {
                            if (filters[i].content == "n" || filters[i].content == "N" || filters[i].content == "name" || filters[i].content == "Name") {
                                sort = "name"
                                sortBy = 1
                            } else if (filters[i].content == "g" || filters[i].content == "G" || filters[i].content == "group" || filters[i].content == "Group") {
                                sort = "group"
                                sortBy = 1
                            } else if (filters[i].content == "e" || filters[i].content == "E" || filters[i].content == "era" || filters[i].content == "Era") {
                                sort = "era"
                                sortBy = 1
                            } else if (filters[i].content == "c" || filters[i].content == "C" || filters[i].content == "condition" || filters[i].content == "Condition") {
                                sort = "condition"
                                sortBy = -1
                            } else if (filters[i].content == "l" || filters[i].content == "L" || filters[i].content == "label" || filters[i].content == "Label" || filters[i].content == "labels" || filters[i].content == "Labels") {
                                sort = "labels"
                                sortBy = 1
                            }
                            sortIndex = i
                        } else if (fourthFilter == "view") {
                            if (filters[i].content == "t" || filters[i].content == "T" || filters[i].content == "true" || filters[i].content == "True" || filters[i].content == "y" || filters[i].content == "Y"
                                || filters[i].content == "Yes" || filters[i].content == "yes") {
                                view = true
                                viewIndex = i
                            }
                        }
                    }
                    if (i == 4) {
                        fifthFilter = filters[i].name
                        if (fifthFilter == "name" || fifthFilter == "group" || fifthFilter == "labels" || fifthFilter == "era") {
                            fifthContent = { $regex: filters[i].content, $options: "i" }
                        } else if (fifthFilter == "issue" || fifthFilter == "condition") {
                            fifthContent = Number(filters[i].content)
                            fifthContent = Number(fifthContent)
                        } else if (fifthFilter == "sort") {
                            if (filters[i].content == "n" || filters[i].content == "N" || filters[i].content == "name" || filters[i].content == "Name") {
                                sort = "name"
                                sortBy = 1
                            } else if (filters[i].content == "g" || filters[i].content == "G" || filters[i].content == "group" || filters[i].content == "Group") {
                                sort = "group"
                                sortBy = 1
                            } else if (filters[i].content == "e" || filters[i].content == "E" || filters[i].content == "era" || filters[i].content == "Era") {
                                sort = "era"
                                sortBy = 1
                            } else if (filters[i].content == "c" || filters[i].content == "C" || filters[i].content == "condition" || filters[i].content == "Condition") {
                                sort = "condition"
                                sortBy = -1
                            } else if (filters[i].content == "l" || filters[i].content == "L" || filters[i].content == "label" || filters[i].content == "Label" || filters[i].content == "labels" || filters[i].content == "Labels") {
                                sort = "labels"
                                sortBy = 1
                            }
                            sortIndex = i
                        } else if (fifthFilter == "view") {
                            if (filters[i].content == "t" || filters[i].content == "T" || filters[i].content == "true" || filters[i].content == "True" || filters[i].content == "y" || filters[i].content == "Y"
                                || filters[i].content == "Yes" || filters[i].content == "yes") {
                                view = true
                                viewIndex = i
                            }
                        }
                    }

                }

                if (filters.length == 1) {
                    if (sort != "") {
                        cards = await claimedCards.find({ $and: [{ owner: owner.userID }, { code: { $in: owner.inventory } }] }).sort({ issue: 1, [sort]: sortBy }).collation({ locale: "en" })
                    } else {
                        cards = await claimedCards.find({ $and: [{ owner: owner.userID }, { code: { $in: owner.inventory } }, { [firstFilter]: firstContent }] }).sort({ issue: 1 })
                    }
                } else if (filters.length == 2) {
                    if (sort != "") {
                        if (!view) {
                            if (sortIndex == 0) {
                                cards = await claimedCards.find({ $and: [{ owner: owner.userID }, { code: { $in: owner.inventory } }, { [secondFilter]: secondContent }] }).sort({ issue: 1, [sort]: sortBy }).collation({ locale: "en" })
                            } else {
                                cards = await claimedCards.find({ $and: [{ owner: owner.userID }, { code: { $in: owner.inventory } }, { [firstFilter]: firstContent }] }).sort({ issue: 1, [sort]: sortBy }).collation({ locale: "en" })
                            }
                        } else {
                            cards = await claimedCards.find({ $and: [{ owner: owner.userID }, { code: { $in: owner.inventory } }] }).sort({ issue: 1, [sort]: sortBy }).collation({ locale: "en" })
                        }
                    } else {
                        if (view) {
                            if (viewIndex == 0) {
                                cards = await claimedCards.find({ $and: [{ owner: owner.userID }, { code: { $in: owner.inventory } }, { [secondFilter]: secondContent }] }).sort({ issue: 1 })
                            } else {
                                cards = await claimedCards.find({ $and: [{ owner: owner.userID }, { code: { $in: owner.inventory } }, { [firstFilter]: firstContent }] }).sort({ issue: 1 })
                            }
                        } else {
                            cards = await claimedCards.find({ $and: [{ owner: owner.userID }, { code: { $in: owner.inventory } }, { [firstFilter]: firstContent }, { [secondFilter]: secondContent }] }).sort({ issue: 1 })
                        }
                    }
                } else if (filters.length == 3) {
                    if (sort != "") {
                        if (!view) {
                            if (sortIndex == 0) {
                                cards = await claimedCards.find({ $and: [{ owner: owner.userID }, { code: { $in: owner.inventory } }, { [secondFilter]: secondContent }, { [thirdFilter]: thirdContent }] }).sort({ issue: 1, [sort]: sortBy }).collation({ locale: "en" })
                            } else if (sortIndex == 1) {
                                cards = await claimedCards.find({ $and: [{ owner: owner.userID }, { code: { $in: owner.inventory } }, { [firstFilter]: firstContent }, { [thirdFilter]: thirdContent }] }).sort({ issue: 1, [sort]: sortBy }).collation({ locale: "en" })
                            } else {
                                cards = await claimedCards.find({ $and: [{ owner: owner.userID }, { code: { $in: owner.inventory } }, { [firstFilter]: firstContent }, { [secondFilter]: secondContent }] }).sort({ issue: 1, [sort]: sortBy }).collation({ locale: "en" })
                            }
                        } else {
                            if (sortIndex == 0 && viewIndex == 1) {
                                cards = await claimedCards.find({ $and: [{ owner: owner.userID }, { code: { $in: owner.inventory } }, { [thirdFilter]: thirdContent }] }).sort({ issue: 1, [sort]: sortBy }).collation({ locale: "en" })
                            } else if (sortIndex == 0 && viewIndex == 2) {
                                cards = await claimedCards.find({ $and: [{ owner: owner.userID }, { code: { $in: owner.inventory } }, { [secondFilter]: secondContent }] }).sort({ issue: 1, [sort]: sortBy }).collation({ locale: "en" })
                            } else if (sortIndex == 1 && viewIndex == 2) {
                                cards = await claimedCards.find({ $and: [{ owner: owner.userID }, { code: { $in: owner.inventory } }, { [firstFilter]: firstContent }] }).sort({ issue: 1, [sort]: sortBy }).collation({ locale: "en" })
                            } else if (sortIndex == 1 && viewIndex == 0) {
                                cards = await claimedCards.find({ $and: [{ owner: owner.userID }, { code: { $in: owner.inventory } }, { [thirdFilter]: thirdContent }] }).sort({ issue: 1, [sort]: sortBy }).collation({ locale: "en" })
                            }
                        }
                    } else {
                        if (view) {
                            if (viewIndex == 0) {
                                cards = await claimedCards.find({ $and: [{ owner: owner.userID }, { code: { $in: owner.inventory } }, { [secondFilter]: secondContent }, { [thirdFilter]: thirdContent }] }).sort({ issue: 1 })
                            } else if (viewIndex == 1) {
                                cards = await claimedCards.find({ $and: [{ owner: owner.userID }, { code: { $in: owner.inventory } }, { [firstFilter]: firstContent }, { [thirdFilter]: thirdContent }] }).sort({ issue: 1 })
                            } else {
                                cards = await claimedCards.find({ $and: [{ owner: owner.userID }, { code: { $in: owner.inventory } }, { [firstFilter]: firstContent }, { [secondFilter]: secondContent }] }).sort({ issue: 1 })
                            }
                        } else {
                            cards = await claimedCards.find({ $and: [{ owner: owner.userID }, { code: { $in: owner.inventory } }, { [firstFilter]: firstContent }, { [secondFilter]: secondContent }, { [thirdFilter]: thirdContent }] }).sort({ issue: 1 })
                        }
                    }
                } else if (filters.length == 4) {
                    if (sort != "") {
                        if (!view) {
                            if (sortIndex == 0) {
                                cards = await claimedCards.find({ $and: [{ owner: owner.userID }, { code: { $in: owner.inventory } }, { [secondFilter]: secondContent }, { [thirdFilter]: thirdContent }, { [fourthFilter]: fourthContent }] }).sort({ issue: 1, [sort]: sortBy }).collation({ locale: "en" })
                            } else if (sortIndex == 1) {
                                cards = await claimedCards.find({ $and: [{ owner: owner.userID }, { code: { $in: owner.inventory } }, { [firstFilter]: firstContent }, { [thirdFilter]: thirdContent }, { [fourthFilter]: fourthContent }] }).sort({ issue: 1, [sort]: sortBy }).collation({ locale: "en" })
                            } else if (sortIndex == 2) {
                                cards = await claimedCards.find({ $and: [{ owner: owner.userID }, { code: { $in: owner.inventory } }, { [firstFilter]: firstContent }, { [secondFilter]: secondContent }, { [fourthFilter]: fourthContent }] }).sort({ issue: 1, [sort]: sortBy }).collation({ locale: "en" })
                            } else {
                                cards = await claimedCards.find({ $and: [{ owner: owner.userID }, { code: { $in: owner.inventory } }, { [firstFilter]: firstContent }, { [secondFilter]: secondContent }, { [thirdFilter]: thirdContent }] }).sort({ issue: 1, [sort]: sortBy }).collation({ locale: "en" })
                            }
                        } else {
                            if (sortIndex == 0 && viewIndex == 1 || sortIndex == 1 && viewIndex == 0) {
                                cards = await claimedCards.find({ $and: [{ owner: owner.userID }, { code: { $in: owner.inventory } }, { [thirdFilter]: thirdContent }, { [fourthFilter]: fourthContent }] }).sort({ issue: 1, [sort]: sortBy }).collation({ locale: "en" })
                            } else if (sortIndex == 0 && viewIndex == 2 || sortIndex == 2 && viewIndex == 0) {
                                cards = await claimedCards.find({ $and: [{ owner: owner.userID }, { code: { $in: owner.inventory } }, { [secondFilter]: secondContent }, { [fourthFilter]: fourthContent }] }).sort({ issue: 1, [sort]: sortBy }).collation({ locale: "en" })
                            } else if (sortIndex == 0 && viewIndex == 3 || sortIndex == 3 && viewIndex == 0) {
                                cards = await claimedCards.find({ $and: [{ owner: owner.userID }, { code: { $in: owner.inventory } }, { [secondFilter]: secondContent }, { [thirdFilter]: thirdContent }] }).sort({ issue: 1, [sort]: sortBy }).collation({ locale: "en" })
                            } else if (sortIndex == 1 && viewIndex == 2 || sortIndex == 2 && viewIndex == 1) {
                                cards = await claimedCards.find({ $and: [{ owner: owner.userID }, { code: { $in: owner.inventory } }, { [firstFilter]: firstContent }, { [fourthFilter]: fourthContent }] }).sort({ issue: 1, [sort]: sortBy }).collation({ locale: "en" })
                            } else if (sortIndex == 1 && viewIndex == 3 || sortIndex == 3 && viewIndex == 1) {
                                cards = await claimedCards.find({ $and: [{ owner: owner.userID }, { code: { $in: owner.inventory } }, { [firstFilter]: firstContent }, { [thirdFilter]: thirdContent }] }).sort({ issue: 1, [sort]: sortBy }).collation({ locale: "en" })
                            } else if (sortIndex == 2 && viewIndex == 3 || sortIndex == 3 && viewIndex == 2) {
                                cards = await claimedCards.find({ $and: [{ owner: owner.userID }, { code: { $in: owner.inventory } }, { [firstFilter]: firstContent }, { [secondFilter]: secondContent }] }).sort({ issue: 1, [sort]: sortBy }).collation({ locale: "en" })
                            }
                        }
                    } else {
                        if (view) {
                            if (viewIndex == 0) {
                                cards = await claimedCards.find({ $and: [{ owner: owner.userID }, { code: { $in: owner.inventory } }, { [secondFilter]: secondContent }, { [thirdFilter]: thirdContent }, { [fourthFilter]: fourthContent }] }).sort({ issue: 1 })
                            } else if (viewIndex == 1) {
                                cards = await claimedCards.find({ $and: [{ owner: owner.userID }, { code: { $in: owner.inventory } }, { [firstFilter]: firstContent }, { [thirdFilter]: thirdContent }, { [fourthFilter]: fourthContent }] }).sort({ issue: 1 })
                            } else if (viewIndex == 2) {
                                cards = await claimedCards.find({ $and: [{ owner: owner.userID }, { code: { $in: owner.inventory } }, { [firstFilter]: firstContent }, { [secondFilter]: secondContent }, { [fourthFilter]: fourthContent }] }).sort({ issue: 1 })
                            } else {
                                cards = await claimedCards.find({ $and: [{ owner: owner.userID }, { code: { $in: owner.inventory } }, { [firstFilter]: firstContent }, { [secondFilter]: secondContent }, { [thirdFilter]: thirdContent }] }).sort({ issue: 1 })
                            }
                        } else {
                            cards = await claimedCards.find({ $and: [{ owner: owner.userID }, { code: { $in: owner.inventory } }, { [firstFilter]: firstContent }, { [secondFilter]: secondContent }, { [thirdFilter]: thirdContent }, { [fourthFilter]: fourthContent }] }).sort({ issue: 1 })
                        }
                    }
                } else if (filters.length == 5) {
                    if (sort != "") {
                        if (!view) {
                            if (sortIndex == 0) {
                                cards = await claimedCards.find({ $and: [{ owner: owner.userID }, { code: { $in: owner.inventory } }, { [secondFilter]: secondContent }, { [thirdFilter]: thirdContent }, { [fourthFilter]: fourthContent }, { [fifthFilter]: fifthContent }] }).sort({ issue: 1, [sort]: sortBy }).collation({ locale: "en" })
                            } else if (sortIndex == 1) {
                                cards = await claimedCards.find({ $and: [{ owner: owner.userID }, { code: { $in: owner.inventory } }, { [firstFilter]: firstContent }, { [thirdFilter]: thirdContent }, { [fourthFilter]: fourthContent }, { [fifthFilter]: fifthContent }] }).sort({ issue: 1, [sort]: sortBy }).collation({ locale: "en" })
                            } else if (sortIndex == 2) {
                                cards = await claimedCards.find({ $and: [{ owner: owner.userID }, { code: { $in: owner.inventory } }, { [firstFilter]: firstContent }, { [secondFilter]: secondContent }, { [fourthFilter]: fourthContent }, { [fifthFilter]: fifthContent }] }).sort({ issue: 1, [sort]: sortBy }).collation({ locale: "en" })
                            } else if (sortIndex == 3) {
                                cards = await claimedCards.find({ $and: [{ owner: owner.userID }, { code: { $in: owner.inventory } }, { [firstFilter]: firstContent }, { [secondFilter]: secondContent }, { [thirdFilter]: thirdContent }, { [fifthFilter]: fifthContent }] }).sort({ issue: 1, [sort]: sortBy }).collation({ locale: "en" })
                            } else {
                                cards = await claimedCards.find({ $and: [{ owner: owner.userID }, { code: { $in: owner.inventory } }, { [firstFilter]: firstContent }, { [secondFilter]: secondContent }, { [thirdFilter]: thirdContent }, { [fourthFilter]: fourthContent }] }).sort({ issue: 1, [sort]: sortBy }).collation({ locale: "en" })
                            }
                        } else {
                            if (sortIndex == 0 && viewIndex == 1 || sortIndex == 1 && viewIndex == 0) {
                                cards = await claimedCards.find({ $and: [{ owner: owner.userID }, { code: { $in: owner.inventory } }, { [thirdFilter]: thirdContent }, { [fourthFilter]: fourthContent }, { [fifthFilter]: fifthContent }] }).sort({ issue: 1, [sort]: sortBy }).collation({ locale: "en" })
                            } else if (sortIndex == 0 && viewIndex == 2 || sortIndex == 2 && viewIndex == 0) {
                                cards = await claimedCards.find({ $and: [{ owner: owner.userID }, { code: { $in: owner.inventory } }, { [secondFilter]: secondContent }, { [fourthFilter]: fourthContent }, { [fifthFilter]: fifthContent }] }).sort({ issue: 1, [sort]: sortBy }).collation({ locale: "en" })
                            } else if (sortIndex == 0 && viewIndex == 3 || sortIndex == 3 && viewIndex == 0) {
                                cards = await claimedCards.find({ $and: [{ owner: owner.userID }, { code: { $in: owner.inventory } }, { [secondFilter]: secondContent }, { [thirdFilter]: thirdContent }, { [fifthFilter]: fifthContent }] }).sort({ issue: 1, [sort]: sortBy }).collation({ locale: "en" })
                            } else if (sortIndex == 0 && viewIndex == 4 || sortIndex == 4 && viewIndex == 0) {
                                cards = await claimedCards.find({ $and: [{ owner: owner.userID }, { code: { $in: owner.inventory } }, { [secondFilter]: secondContent }, { [thirdFilter]: thirdContent }, { [fourthFilter]: forthContent }] }).sort({ issue: 1, [sort]: sortBy }).collation({ locale: "en" })
                            } else if (sortIndex == 1 && viewIndex == 2 || sortIndex == 2 && viewIndex == 1) {
                                cards = await claimedCards.find({ $and: [{ owner: owner.userID }, { code: { $in: owner.inventory } }, { [firstFilter]: firstContent }, { [fourthFilter]: fourthContent }] }).sort({ issue: 1, [sort]: sortBy }).collation({ locale: "en" })
                            } else if (sortIndex == 1 && viewIndex == 3 || sortIndex == 3 && viewIndex == 1) {
                                cards = await claimedCards.find({ $and: [{ owner: owner.userID }, { code: { $in: owner.inventory } }, { [firstFilter]: firstContent }, { [thirdFilter]: thirdContent }] }).sort({ issue: 1, [sort]: sortBy }).collation({ locale: "en" })
                            } else if (sortIndex == 1 && viewIndex == 4 || sortIndex == 4 && viewIndex == 1) {
                                cards = await claimedCards.find({ $and: [{ owner: owner.userID }, { code: { $in: owner.inventory } }, { [firstFilter]: firstContent }, { [thirdFilter]: thirdContent }, { [fourthFilter]: fourthContent }] }).sort({ issue: 1, [sort]: sortBy }).collation({ locale: "en" })
                            } else if (sortIndex == 2 && viewIndex == 3 || sortIndex == 3 && viewIndex == 2) {
                                cards = await claimedCards.find({ $and: [{ owner: owner.userID }, { code: { $in: owner.inventory } }, { [firstFilter]: firstContent }, { [secondFilter]: secondContent }, { [fifthFilter]: fifthContent }] }).sort({ issue: 1, [sort]: sortBy }).collation({ locale: "en" })
                            } else if (sortIndex == 2 && viewIndex == 4 || sortIndex == 4 && viewIndex == 2) {
                                cards = await claimedCards.find({ $and: [{ owner: owner.userID }, { code: { $in: owner.inventory } }, { [firstFilter]: firstContent }, { [secondFilter]: secondContent }, { [fourthFilter]: fourthContent }] }).sort({ issue: 1, [sort]: sortBy }).collation({ locale: "en" })
                            } else if (sortIndex == 3 && viewIndex == 4 || sortIndex == 4 && viewIndex == 3) {
                                cards = await claimedCards.find({ $and: [{ owner: owner.userID }, { code: { $in: owner.inventory } }, { [firstFilter]: firstContent }, { [secondFilter]: secondContent }, { [thirdFilter]: thirdContent }] }).sort({ issue: 1, [sort]: sortBy }).collation({ locale: "en" })
                            }
                        }
                    } else {
                        if (view) {
                            console.log("hello")
                            if (viewIndex == 0) {
                                cards = await claimedCards.find({ $and: [{ owner: owner.userID }, { code: { $in: owner.inventory } }, { [secondFilter]: secondContent }, { [thirdFilter]: thirdContent }, { [fourthFilter]: fourthContent }, { [fifthFilter]: fifthContent }] }).sort({ issue: 1 })
                            } else if (viewIndex == 1) {
                                cards = await claimedCards.find({ $and: [{ owner: owner.userID }, { code: { $in: owner.inventory } }, { [firstFilter]: firstContent }, { [thirdFilter]: thirdContent }, { [fourthFilter]: fourthContent }, { [fifthFilter]: fifthContent }] }).sort({ issue: 1 })
                            } else if (viewIndex == 2) {
                                cards = await claimedCards.find({ $and: [{ owner: owner.userID }, { code: { $in: owner.inventory } }, { [firstFilter]: firstContent }, { [secondFilter]: secondContent }, { [fourthFilter]: fourthContent }, { [fifthFilter]: fifthContent }] }).sort({ issue: 1 })
                            } else if (viewIndex == 3) {
                                cards = await claimedCards.find({ $and: [{ owner: owner.userID }, { code: { $in: owner.inventory } }, { [firstFilter]: firstContent }, { [secondFilter]: secondContent }, { [thirdFilter]: thirdContent }, { [fifthFilter]: fifthContent }] }).sort({ issue: 1 })
                            } else {
                                console.log("should go in here")
                                cards = await claimedCards.find({ $and: [{ owner: owner.userID }, { code: { $in: owner.inventory } }, { [firstFilter]: firstContent }, { [secondFilter]: secondContent }, { [thirdFilter]: thirdContent }, { [fourthFilter]: fourthContent }] }).sort({ issue: 1 })
                            }
                        } else {
                            cards = await claimedCards.find({ $and: [{ owner: owner.userID }, { code: { $in: owner.inventory } }, { [firstFilter]: firstContent }, { [secondFilter]: secondContent }, { [thirdFilter]: thirdContent }, { [fourthFilter]: fourthContent }, { [fifthFilter]: fifthContent }] }).sort({ issue: 1 })
                        }
                    }
                }

            } else {
                cards = await claimedCards.find({ $and: [{ owner: owner.userID }, { code: { $in: owner.inventory } }] }).sort({ issue: 1 })

            }
        } else if(owner == null || owner == undefined) {
            cards = []
        }

        if (cards.length != 0) {
            for (i = 0; i < cards.length; i++) {
                var nameEra = ""
                if (view) {
                    nameEra = "(" + cards[i].era + ")"
                }
                if (cards[i].labels.length != 0) {
                    const emoji = cards[i].labels[0].split(" ")[0]
                    inventory.push('' + emoji + " `" + cards[i].code + '` | ' + cards[i].stars + ' | **#' + cards[i].issue + '** | **' + cards[i].group + '** ' + cards[i].name + ' ' + nameEra + '\n')
                } else {
                    inventory.push("◾ `" + cards[i].code + '` | ' + cards[i].stars + ' | **#' + cards[i].issue + '** | **' + cards[i].group + '** ' + cards[i].name + ' ' + nameEra + '\n')
                }
                if (i % 10 == 0) {
                    pageCount += 1;
                    pages.push(pageCount)
                }
            }
        }

        var shownCards = ""
        if (inventory.length == 1) {
            shownCards = "Card"
        } else {
            shownCards = "Cards"
        }

        /*----------------------------------------------------------INVENTORY EMBEDS-------------------------------------------------------------*/
        if (inventory.length != 0) {

            if (inventory.length < 11) {
                const inv = new Eris.RichEmbed()
                    .setTitle("")
                    .setDescription("**" + playerName.toUpperCase() + "'S INVENTORY**\n" + inventory.slice((page) * 10 - 10, (page) * 10).toString().replace(/,/g, ""))
                    .setColor("#33A7FF")
                    .setAuthor(`${playerName}#${playerDiscriminator}`, playerAvatar, playerAvatar)
                    .setFooter(`${viewer.username}#${viewer.discriminator} | Showing ` + inventory.length + ` of ` + totalCards + ` ` + totalCardContent + ` | ${page} of ${pages.length} Pages`, viewer.avatarURL, viewer.avatarURL)
                message.channel.createMessage({ embed: inv })
            } else if (inventory.length >= 11) {
                const inv = new Eris.RichEmbed()
                    .setTitle("")
                    .setDescription("**" + playerName.toUpperCase() + "'S INVENTORY**\n" + inventory.slice((page) * 10 - 10, (page) * 10).toString().replace(/,/g, ""))
                    .setColor("#33A7FF")
                    .setAuthor(`${playerName}#${playerDiscriminator}`, playerAvatar, playerAvatar)
                    .setFooter(`${viewer.username}#${viewer.discriminator} | Showing ` + inventory.length + ` of ` + totalCards + ` ` + totalCardContent + ` | ${page} of ${pages.length} Pages`, viewer.avatarURL, viewer.avatarURL)
                message.channel.createMessage({ embed: inv })
                    .then(function (message) {
                        message.addReaction('⏪');
                        message.addReaction('◀️');
                        message.addReaction('▶️')
                        message.addReaction('⏩');

                        const reactionListener = new ReactionHandler.continuousReactionStream(
                            message,
                            (userID) => userID != message.author.id,
                            false,
                            { max: 100, time: 60000 }
                        );
                        const viewerReaction = []
                        reactionListener.on('reacted', (event) => {
                            if (event.emoji.name == "⏪") {
                                viewerReaction.push(event.userID)
                                console.log(viewerReaction)
                                if (viewerReaction.includes(viewer.id)) {
                                    if (page == 1) return;
                                    page = 1;
                                    inv.setDescription("**" + playerName.toUpperCase() + "'S INVENTORY**\n" + inventory.slice((page) * 10 - 10, (page) * 10).toString().replace(/,/g, ""))
                                    inv.setFooter(`${viewer.username}#${viewer.discriminator} | Showing ` + inventory.length + ` of ` + totalCards + ` ` + totalCardContent + ` | ${page} of ${pages.length} Pages`, viewer.avatarURL, viewer.avatarURL)
                                    message.edit({ embed: inv })
                                }
                            }
                            if (event.emoji.name == "◀️") {
                                viewerReaction.push(event.userID)
                                if (viewerReaction.includes(viewer.id)) {
                                    if (page == 1) return;
                                    page--;
                                    inv.setDescription("**" + playerName.toUpperCase() + "'S INVENTORY**\n" + inventory.slice((page) * 10 - 10, (page) * 10).toString().replace(/,/g, ""))
                                    inv.setFooter(`${viewer.username}#${viewer.discriminator} | Showing ` + inventory.length + ` of ` + totalCards + ` ` + totalCardContent + ` | ${page} of ${pages.length} Pages`, viewer.avatarURL, viewer.avatarURL)
                                    message.edit({ embed: inv })
                                }
                            }

                            if (event.emoji.name == "▶️") {
                                console.log(viewerReaction)
                                viewerReaction.push(event.userID)
                                if (viewerReaction.includes(viewer.id)) {
                                    if (page == pages.length) return;
                                    page++;
                                    inv.setDescription("**" + playerName.toUpperCase() + "'S INVENTORY**\n" + inventory.slice((page) * 10 - 10, (page) * 10).toString().replace(/,/g, ""));
                                    inv.setFooter(`${viewer.username}#${viewer.discriminator} | Showing ` + inventory.length + ` of ` + totalCards + ` ` + totalCardContent + ` | ${page} of ${pages.length} Pages`, viewer.avatarURL, viewer.avatarURL)
                                    message.edit({ embed: inv })
                                }
                            }

                            if (event.emoji.name == "⏩") {
                                viewerReaction.push(event.userID)
                                if (viewerReaction.includes(viewer.id)) {
                                    if (page == pages.length) return;
                                    page = pages.length;
                                    inv.setDescription("**" + playerName.toUpperCase() + "'S INVENTORY**\n" + inventory.slice((page) * 10 - 10, (page) * 10).toString().replace(/,/g, ""))
                                    inv.setFooter(`${viewer.username}#${viewer.discriminator} | Showing ` + inventory.length + ` of ` + totalCards + ` ` + totalCardContent + ` | ${page} of ${pages.length} Pages`, viewer.avatarURL, viewer.avatarURL)
                                    message.edit({ embed: inv })
                                }
                            }

                        })
                    })
            }
        } else {
            if (saveCards.length == 0) {
                const inv = new Eris.RichEmbed()
                    .setTitle("")
                    .setDescription("**" + playerName.toUpperCase() + "'S INVENTORY**\nNo cards can be found within this inventory")
                    .setColor("#33A7FF")
                    .setAuthor(`${playerName}#${playerDiscriminator}`, playerAvatar, playerAvatar)
                    .setFooter(`${viewer.username}#${viewer.discriminator} | Viewing Inventory`, viewer.avatarURL, viewer.avatarURL)
                message.channel.createMessage({ embed: inv })
            } else if (saveCards.length != 0 && inventory.length == 0 && filters.length != 0) {
                const inv = new Eris.RichEmbed()
                    .setTitle("")
                    .setDescription("**" + playerName.toUpperCase() + "'S INVENTORY**\nNo cards matching the given filters can be found")
                    .setColor("#33A7FF")
                    .setAuthor(`${playerName}#${playerDiscriminator}`, playerAvatar, playerAvatar)
                    .setFooter(`${viewer.username}#${viewer.discriminator} | Viewing Inventory`, viewer.avatarURL, viewer.avatarURL)
                message.channel.createMessage({ embed: inv })
            }
        }
    } else if ((owner == null || owner != undefined) && !messager) {
        const noPlayer = new Eris.RichEmbed()
            .setTitle("")
            .setDescription("<:exclaim:906289233814241290> A player with the given information cannot be found within the Icon playerbase")
            .setColor("#9370DB")
            .setFooter(`${viewer.username}#${viewer.discriminator} | Viewing Inventory`, viewer.avatarURL, viewer.avatarURL)
        message.channel.createMessage({ embed: noPlayer })

    }
}

module.exports = {
    inventory
};