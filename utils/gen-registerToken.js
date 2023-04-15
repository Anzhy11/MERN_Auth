
const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
let registerToken = '';
for (let i = 0; i < 25; i++) {
    registerToken += characters[Math.floor(Math.random() * characters.length)];
}

module.exports = { registerToken };