const app = require('./src/app'); 
const dotenv = require('dotenv');
const cron = require('node-cron');
const runCinemaScraper = require('./src/services/cinemaScraper');
const fs = require('fs');
const path = require('path');

dotenv.config();

const PORT = process.env.PORT || 5000;
const logPath = path.join(__dirname, 'scraper_last_run.txt');

cron.schedule('0 3 * * *', async () => {
    console.log('⏰ Időzítő: Hajnali 3 óra van, indítom a mozi robotot...');
    await runCinemaScraper();
    const today = new Date().toISOString().split('T')[0];
    fs.writeFileSync(logPath, today);
});

console.log('⏳ Várakozás az adatbázis felállására (25 mp)...');

setTimeout(async () => {
    try {
        const today = new Date().toISOString().split('T')[0];
        let lastRun = '';

        if (fs.existsSync(logPath)) {
            lastRun = fs.readFileSync(logPath, 'utf8').trim();
        }

        if (lastRun !== today) {
            console.log('🤖 Adatbázis kész! Mai moziműsor letöltése indítva...');
            await runCinemaScraper(); 
            fs.writeFileSync(logPath, today); 
        } else {
            console.log('✅ A mai napra már lefutott a mozi robot, korábbi adatok betöltése.');
        }
    } catch (error) {
        console.error('❌ Hiba az indítási folyamatban:', error);
    } finally {

        app.listen(PORT, () => {
            console.log(`🚀 Szerver fut: http://localhost:${PORT}`);
        });
    }
}, 25000);