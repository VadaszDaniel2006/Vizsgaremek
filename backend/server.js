// backend/server.js
const app = require('./src/app'); 
const dotenv = require('dotenv');
const cron = require('node-cron');
const runCinemaScraper = require('./src/services/cinemaScraper');
const fs = require('fs');
const path = require('path');

dotenv.config();

const PORT = process.env.PORT || 5000;
const logPath = path.join(__dirname, 'scraper_last_run.txt');

// 1. ROBOT IDŐZÍTÉSE: Minden nap hajnali 3:00-kor lefut (Ezt békén hagyjuk)
cron.schedule('0 3 * * *', async () => {
    console.log('⏰ Időzítő: Hajnali 3 óra van, indítom a mozi robotot...');
    await runCinemaScraper();
    const today = new Date().toISOString().split('T')[0];
    fs.writeFileSync(logPath, today);
});

// 2. INDÍTÁSI LOGIKA (Okos várakozás és napi 1x futás)
console.log('⏳ Várakozás az adatbázis felállására (25 mp)...');

setTimeout(async () => {
    try {
        const today = new Date().toISOString().split('T')[0];
        let lastRun = '';
        
        // Ellenőrizzük, mikor futott le utoljára a robot
        if (fs.existsSync(logPath)) {
            lastRun = fs.readFileSync(logPath, 'utf8').trim();
        }

        // Ha a mai napon még nem futott le, akkor elindítjuk!
        if (lastRun !== today) {
            console.log('🤖 Adatbázis kész! Mai moziműsor letöltése indítva...');
            await runCinemaScraper(); // Await = megvárjuk, amíg teljesen befejezi!
            fs.writeFileSync(logPath, today); // Feljegyezzük, hogy ma már végzett
        } else {
            console.log('✅ A mai napra már lefutott a mozi robot, korábbi adatok betöltése.');
        }
    } catch (error) {
        console.error('❌ Hiba az indítási folyamatban:', error);
    } finally {
        // A LEGFONTOSABB VÁLTOZÁS: A szervert CSAK AKKOR indítjuk el, ha a robot már végzett!
        // Így az indito.js pontosan addig fog várakozni, amíg be nem töltött a teljes műsor.
        app.listen(PORT, () => {
            console.log(`🚀 Szerver fut: http://localhost:${PORT}`);
        });
    }
}, 25000);