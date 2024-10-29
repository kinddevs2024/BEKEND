const fs = require('fs').promises;

async function getElements(filePath, page = 1, take = 10) {
    try {
        // Reading data from the JSON file
        const data = await fs.readFile(filePath, 'utf8');
        const elements = JSON.parse(data);

        // Calculate the starting index and end index
        const startIndex = (page - 1) * take;
        const paginatedElements = elements.slice(startIndex, startIndex + take);

        return paginatedElements;
    } catch (error) {
        console.error("Error reading the file:", error);
        throw error;
    }
}

module.exports = getElements;
