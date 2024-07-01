const fs = require("node:fs/promises");
const path = require("path");

module.exports = { lookUp }

async function lookUp(fNames, uri = "") {
    const fileP = path.resolve(uri);
    const pUri = path.join(fileP, '../');
    if (pUri === fileP) throw `not find ${fNames}`

    let fileName = fNames;
    try {
        const files = await fs.readdir(fileP);
        if (fNames instanceof Array) fileName = files.find(el => fNames.includes(el))
        if (files.includes(fileName)) return path.join(fileP, fileName)
        return lookUp(fNames, pUri)
    } catch (error) {
        console.error("not find" + fNames)
        console.error(error)
    }

}




