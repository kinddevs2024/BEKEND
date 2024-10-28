const fs = require("node:fs/promises");

const fileRead = async (url) => {
    const dataJSON = await fs.readFile(url, "utf-8");
    const data = await JSON.parse(dataJSON);
    return data;
};

const fileWrite = async (url, data) => {
    await fs.writeFile(url, JSON.stringify(data, null, 2), "utf-8");
};

module.exports = { fileRead, fileWrite };