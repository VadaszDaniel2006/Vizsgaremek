// backend/server.js
const app = require('./src/app'); 
const dotenv = require('dotenv');
const cron = require('node-cron');
const runCinemaScraper = require('./src/services/cinemaScraper');

dotenv.config();

const PORT = process.env.PORT || 3000;

// ROBOT IDŐZÍTÉSE: Minden nap hajnali 3:00-kor lefut
cron.schedule('0 3 * * *', () => {
    console.log('⏰ Időzítő: Hajnali 3 óra van, indítom a mozi robotot...');
    runCinemaScraper();
});

// TESZTELÉS KÉSZ - KIKOMMENTELVE:
 setTimeout(() => {
    console.log('🤖 Manuális indítás kikapcsolva, az időzítő dolgozik helyette.');
    runCinemaScraper(); 
}, 10000);

app.listen(PORT, () => {
    console.log(`🚀 Szerver fut: http://localhost:${PORT}`);
});