const bcrypt = require('bcrypt');

async function hashPasswords() {
    const passwords = ['pass1', 'pass2'];
    for (const password of passwords) {
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log(hashedPassword);
    }
}

hashPasswords();