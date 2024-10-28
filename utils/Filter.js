const fs = require('fs');

// JSON faylni o'qish
fs.readFile(url, 'utf8', (err, data) => {
    if (err) {
        console.error("Faylni o'qishda xato:", err);
        return;
    }

    // JSONni ob'ektga aylantirish
    const items = JSON.parse(data);

    // Narxi 400 dan 4000 gacha bo'lgan narsalarni filtrlash
    const filteredItems = items.filter(item => item.price >= 400 && item.price <= 4000);

    console.log("Filtrlash natijasi:", filteredItems);
});

module.exports = Filter;