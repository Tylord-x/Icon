function filters(search) {

    var group = false
    var name = false
    var era = false
    var condition = false
    var issue = false
    var label = false
    var sort = false
    var view = false

    var filters = []

    for (i = 0; i < search.length; i++) {
        if (search[i].includes("g=") || search[i].includes("group=") || search[i].includes("G=") || search[i].includes("Group=")) {
            group = true
            filters.push({ filter: "group", startingIndex: i })
        }
        if (search[i].includes("n=") || search[i].includes("name=") || search[i].includes("N=") || search[i].includes("Name=")) {
            name = true
            filters.push({ filter: "name", startingIndex: i })
        }
        if (search[i].includes("e=") || search[i].includes("era=") || search[i].includes("E=") || search[i].includes("Era=")) {
            era = true
            filters.push({ filter: "era", startingIndex: i })
        }
        if (search[i].includes("i=") || search[i].includes("issue=") || search[i].includes("I=") || search[i].includes("Issue=")) {
            issue = true
            filters.push({ filter: "issue", startingIndex: i })
        }
        if (search[i].includes("c=") || search[i].includes("condition=") || search[i].includes("C=") || search[i].includes("Condition=")) {
            condition = true
            filters.push({ filter: "condition", startingIndex: i })
        }
        if (search[i].includes("l=") || search[i].includes("label=") || search[i].includes("L=") || search[i].includes("Label=")) {
            label = true
            filters.push({ filter: "labels", startingIndex: i })
        }
        if (search[i].includes("s=") || search[i].includes("sort=") || search[i].includes("S=") || search[i].includes("Sort=")) {
            sort = true
            filters.push({ filter: "sort", startingIndex: i })
        }
        if (search[i].includes("v=") || search[i].includes("view=") || search[i].includes("V=") || search[i].includes("View=")) {
            view = true
            filters.push({ filter: "view", startingIndex: i })
        }
        search[i] = search[i].replace(/(.*)=/, "")
    }


    const initialFilters = []
    if (group || name || era || issue || condition || label || sort || view) {
        for (i = 0; i < filters.length; i++) {
            if (i < filters.length - 1) {
                initialFilters.push({ name: filters[i].filter, content: search.slice(filters[i].startingIndex, filters[i + 1].startingIndex) })
            } else {
                initialFilters.push({ name: filters[i].filter, content: search.slice(filters[i].startingIndex, search.length) })
            }
        }

        const finalFilters = []
        var groupFilter = ""
        var nameFilter = ""
        var eraFilter = ""
        var labelFilter = ""
        var sortFilter = ""
        var viewFilter = ""
        var issueFilter = 0
        var conditionFilter = 0

        for (i = 0; i < initialFilters.length; i++) {
            if (initialFilters[i].name == "group") {
                for (j = 0; j < initialFilters[i].content.length; j++) {
                    for (char in initialFilters[i].content[j]) {
                        console.log(char)
                        if (initialFilters[i].content[j].charAt(char) == "(" || initialFilters[i].content[j].charAt(char) == ")" || initialFilters[i].content[j].charAt(char) == "*" || initialFilters[i].content[j].charAt(char) == "&" || initialFilters[i].content[j].charAt(char) == "%"
                            || initialFilters[i].content[j].charAt(char) == "." || initialFilters[i].content[j].charAt(char) == "!" || initialFilters[i].content[j].charAt(char) == "@" || initialFilters[i].content[j].charAt(char) == "#" || initialFilters[i].content[j].charAt(char) == "]"
                            || initialFilters[i].content[j].charAt(char) == "[" || initialFilters[i].content[j].charAt(char) == ":" || initialFilters[i].content[j].charAt(char) == ";" || initialFilters[i].content[j].charAt(char) == "?" || initialFilters[i].content[j].charAt(char) == "<"
                            || initialFilters[i].content[j].charAt(char) == ">" || initialFilters[i].content[j].charAt(char) == "'") {
                            groupFilter += "\\" + initialFilters[i].content[j].charAt(char)

                        } else {
                            groupFilter += "" + initialFilters[i].content[j].charAt(char)
                        }
                    }
                    if (i < initialFilters[i].content[j].length) {
                        groupFilter += " "
                    }
                }
                
                finalFilters.push({ name: initialFilters[i].name, content: groupFilter.trim() })
            } else if (initialFilters[i].name == "name") {
                for (j = 0; j < initialFilters[i].content.length; j++) {
                    for (char in initialFilters[i].content[j]) {
                        if (initialFilters[i].content[j].charAt(char) == "(" || initialFilters[i].content[j].charAt(char) == ")" || initialFilters[i].content[j].charAt(char) == "*" || initialFilters[i].content[j].charAt(char) == "&" || initialFilters[i].content[j].charAt(char) == "%"
                            || initialFilters[i].content[j].charAt(char) == "." || initialFilters[i].content[j].charAt(char) == "!" || initialFilters[i].content[j].charAt(char) == "@" || initialFilters[i].content[j].charAt(char) == "#" || initialFilters[i].content[j].charAt(char) == "]"
                            || initialFilters[i].content[j].charAt(char) == "[" || initialFilters[i].content[j].charAt(char) == ":" || initialFilters[i].content[j].charAt(char) == ";" || initialFilters[i].content[j].charAt(char) == "?" || initialFilters[i].content[j].charAt(char) == "<"
                            || initialFilters[i].content[j].charAt(char) == ">" || initialFilters[i].content[j].charAt(char) == "'") {
                            nameFilter += "\\" + initialFilters[i].content[j].charAt(char)
                        } else {
                            nameFilter += initialFilters[i].content[j].charAt(char)
                        }
                    }
                    if (i < initialFilters[i].content[j].length && initialFilters[i].content[j].length >= 1) {
                        nameFilter += " "
                    }
                }

                finalFilters.push({ name: initialFilters[i].name, content: nameFilter.trim() })

            } else if (initialFilters[i].name == "era") {
                for (j = 0; j < initialFilters[i].content.length; j++) {
                    for (char in initialFilters[i].content[j]) {
                        if (initialFilters[i].content[j].charAt(char) == "(" || initialFilters[i].content[j].charAt(char) == ")" || initialFilters[i].content[j].charAt(char) == "*" || initialFilters[i].content[j].charAt(char) == "&" || initialFilters[i].content[j].charAt(char) == "%"
                            || initialFilters[i].content[j].charAt(char) == "." || initialFilters[i].content[j].charAt(char) == "!" || initialFilters[i].content[j].charAt(char) == "@" || initialFilters[i].content[j].charAt(char) == "#" || initialFilters[i].content[j].charAt(char) == "]"
                            || initialFilters[i].content[j].charAt(char) == "[" || initialFilters[i].content[j].charAt(char) == ":" || initialFilters[i].content[j].charAt(char) == ";" || initialFilters[i].content[j].charAt(char) == "?" || initialFilters[i].content[j].charAt(char) == "<"
                            || initialFilters[i].content[j].charAt(char) == ">" || initialFilters[i].content[j].charAt(char) == "'") {
                            eraFilter += "\\" + initialFilters[i].content[j].charAt(char)
                        } else {
                            eraFilter += initialFilters[i].content[j].charAt(char)
                        }
                    }
                    if (i < initialFilters[i].content[j].length && initialFilters[i].content[j].length >= 1) {
                        eraFilter += " "
                    }
                }
                finalFilters.push({ name: initialFilters[i].name, content: eraFilter.trim() })
            } else if (initialFilters[i].name == "labels") {
                for (j = 0; j < initialFilters[i].content.length; j++) {
                    for (char in initialFilters[i].content[j]) {
                        if (initialFilters[i].content[j].charAt(char) == "(" || initialFilters[i].content[j].charAt(char) == ")" || initialFilters[i].content[j].charAt(char) == "*" || initialFilters[i].content[j].charAt(char) == "&" || initialFilters[i].content[j].charAt(char) == "%"
                            || initialFilters[i].content[j].charAt(char) == "." || initialFilters[i].content[j].charAt(char) == "!" || initialFilters[i].content[j].charAt(char) == "@" || initialFilters[i].content[j].charAt(char) == "#" || initialFilters[i].content[j].charAt(char) == "]"
                            || initialFilters[i].content[j].charAt(char) == "[" || initialFilters[i].content[j].charAt(char) == ":" || initialFilters[i].content[j].charAt(char) == ";" || initialFilters[i].content[j].charAt(char) == "?" || initialFilters[i].content[j].charAt(char) == "<"
                            || initialFilters[i].content[j].charAt(char) == ">" || initialFilters[i].content[j].charAt(char) == "'") {
                            labelFilter += "\\" + initialFilters[i].content[j].charAt(char)
                        } else {
                            labelFilter += initialFilters[i].content[j].charAt(char)
                        }
                    }
                    if (i < initialFilters[i].content[j].length && initialFilters[i].content[j].length >= 1) {
                        labelFilter += " "
                    }
                }
                finalFilters.push({ name: initialFilters[i].name, content: labelFilter.trim() })
            } else if (initialFilters[i].name == "sort") {
                for (j = 0; j < initialFilters[i].content.length; j++) {
                    for (char in initialFilters[i].content[j]) {
                        if (initialFilters[i].content[j].charAt(char) == "(" || initialFilters[i].content[j].charAt(char) == ")" || initialFilters[i].content[j].charAt(char) == "*" || initialFilters[i].content[j].charAt(char) == "&" || initialFilters[i].content[j].charAt(char) == "%"
                            || initialFilters[i].content[j].charAt(char) == "." || initialFilters[i].content[j].charAt(char) == "!" || initialFilters[i].content[j].charAt(char) == "@" || initialFilters[i].content[j].charAt(char) == "#" || initialFilters[i].content[j].charAt(char) == "]"
                            || initialFilters[i].content[j].charAt(char) == "[" || initialFilters[i].content[j].charAt(char) == ":" || initialFilters[i].content[j].charAt(char) == ";" || initialFilters[i].content[j].charAt(char) == "?" || initialFilters[i].content[j].charAt(char) == "<"
                            || initialFilters[i].content[j].charAt(char) == ">" || initialFilters[i].content[j].charAt(char) == "'") {
                            sortFilter += "\\" + initialFilters[i].content[j].charAt(char)
                        } else {
                            sortFilter += initialFilters[i].content[j].charAt(char)
                        }
                    }
                    if (i < initialFilters[i].content[j].length && initialFilters[i].content[j].length >= 1) {
                        sortFilter += " "
                    }
                }
                finalFilters.push({ name: initialFilters[i].name, content: sortFilter.trim() })

            } else if (initialFilters[i].name == "view") {
                for (j = 0; j < initialFilters[i].content.length; j++) {
                    for (char in initialFilters[i].content[j]) {
                        if (initialFilters[i].content[j].charAt(char) == "(" || initialFilters[i].content[j].charAt(char) == ")" || initialFilters[i].content[j].charAt(char) == "*" || initialFilters[i].content[j].charAt(char) == "&" || initialFilters[i].content[j].charAt(char) == "%"
                            || initialFilters[i].content[j].charAt(char) == "." || initialFilters[i].content[j].charAt(char) == "!" || initialFilters[i].content[j].charAt(char) == "@" || initialFilters[i].content[j].charAt(char) == "#" || initialFilters[i].content[j].charAt(char) == "]"
                            || initialFilters[i].content[j].charAt(char) == "[" || initialFilters[i].content[j].charAt(char) == ":" || initialFilters[i].content[j].charAt(char) == ";" || initialFilters[i].content[j].charAt(char) == "?" || initialFilters[i].content[j].charAt(char) == "<"
                            || initialFilters[i].content[j].charAt(char) == ">" || initialFilters[i].content[j].charAt(char) == "'") {
                            viewFilter += "\\" + initialFilters[i].content[j].charAt(char)
                        } else {
                            viewFilter += initialFilters[i].content[j].charAt(char)
                        }
                    }
                    if (i < initialFilters[i].content[j].length && initialFilters[i].content[j].length >= 1) {
                        viewFilter += " "
                    }
                }
                finalFilters.push({ name: initialFilters[i].name, content: viewFilter.trim() })

            } else if (initialFilters[i].name == "issue") {
                for (j = 0; j < initialFilters[i].content.length; j++) {
                    issueFilter = Number(initialFilters[i].content[j])
                }
                finalFilters.push({ name: initialFilters[i].name, content: issueFilter })

            } else if (initialFilters[i].name == "condition") {
                for (j = 0; j < initialFilters[i].content.length; j++) {
                    conditionFilter = Number(initialFilters[i].content[j])
                }
                finalFilters.push({ name: initialFilters[i].name, content: conditionFilter })
            }
        }
        return finalFilters

    }



}

module.exports = {
    filters
};