// backend/server.js
const app = require('./src/app'); 
const dotenv = require('dotenv');
const cron = require('node-cron');
const runCinemaScraper = require('./src/services/cinemaScraper');
const fs = require('fs');
const path = require('path');

dotenv.config();

const PORT = process.env.PORT || 3000;
const logPath = path.join(__dirname, 'scraper_last_run.txt');

// ROBOT IDŐZÍTÉSE: Minden nap hajnali 3:00-kor lefut
cron.schedule('0 3 * * *', () => {
    console.log('⏰ Időzítő: Hajnali 3 óra van, indítom a mozi robotot...');
    runCinemaScraper();
    // Bejegyezzük, hogy a mai napon már lefutott a cron
    const today = new Date().toISOString().split('T')[0];
    fs.writeFileSync(logPath, today);
});

// Szerver induláskori ellenőrzés: Csak akkor fut le, ha ma még nem történt meg
setTimeout(() => {
    const today = new Date().toISOString().split('T')[0]; // "ÉÉÉÉ-HH-NN" formátum
    try {
        const lastRun = fs.existsSync(logPath) ? fs.readFileSync(logPath, 'utf8') : '';
        if (lastRun !== today) {
            console.log('🤖 Napi első szerverindulás: a mozi robot elindítása...');
            runCinemaScraper(); 
            fs.writeFileSync(logPath, today);
        } else {
            console.log('🤖 A mozi robot ma már lefutott, az induló futtatás kihagyva.');
        }
    } catch (error) {
        console.error('Hiba a napi futás ellenőrzésekor:', error);
    }
}, 10000);

app.listen(PORT, () => {
    console.log(`🚀 Szerver fut: http://localhost:${PORT}`);
});