const { spawn, execSync } = require('child_process');
const fs = require('fs');

console.log('\x1b[33m%s\x1b[0m', '⏳ A MOZI rendszer és a dokumentáció indítása folyamatban...');

// 1. Docusaurus függőségek automatikus telepítése, ha még nincsenek meg
if (!fs.existsSync('./dokumentacio/node_modules')) {
    console.log('\x1b[36m%s\x1b[0m', '📦 Docusaurus függőségek telepítése (ez eltarthat 1-2 percig az első alkalommal)...');
    execSync('npm install', { cwd: './dokumentacio', stdio: 'inherit' });
}

// 2. Docker indítása a háttérben
const docker = spawn('docker', ['compose', 'up', '-d', '--build'], { stdio: 'inherit', shell: true });

// 3. Docusaurus indítása a háttérben (böngésző azonnali megnyitása nélkül!)
const docusaurus = spawn('npm', ['start', '--', '--no-open'], { 
    cwd: './dokumentacio',
    stdio: 'ignore',       
    shell: true 
});

docker.on('close', (code) => {
    if (code === 0) {
        console.clear();
        console.log('\x1b[36m%s\x1b[0m', '⏳ Adatbázis szinkronizálása és betöltése... (Kérlek várj, ez eltarthat 10-15 másodpercig)');

        // OKOS VÁRAKOZÁS: 2 másodpercenként rákérdezünk a backend-re, hogy felállt-e már az adatbázis
        const checkBackend = setInterval(() => {
            fetch('http://localhost:5000/api/filmek')
                .then(res => {
                    // Ha 200-as (OK) választ kapunk, az azt jelenti, hogy az adatbázis teljesen készen áll!
                    if (res.ok) {
                        clearInterval(checkBackend); // Leállítjuk a kérdezősködést
                        console.clear();
                        console.log('\x1b[32m%s\x1b[0m', '✅ A RENDSZER SIKERESEN ELINDULT ÉS KÉSZEN ÁLL!');
                        console.log('--------------------------------------------------');
                        console.log('🌍 \x1b[36mWEBOLDAL:\x1b[0m            http://localhost:8090');
                        console.log('🗄️ \x1b[36mADATBÁZIS:\x1b[0m           http://localhost:8082');
                        console.log('⚙️  \x1b[36mBACKEND API:\x1b[0m         http://localhost:5000');
                        console.log('📚 \x1b[36mDOKUMENTÁCIÓ:\x1b[0m        http://localhost:3000/Vizsgaremek/');
                        console.log('--------------------------------------------------');
                        console.log('\x1b[33m%s\x1b[0m', '🛑 LEÁLLÍTÁSHOZ ÉS AZ ADATBÁZIS MENTÉSÉHEZ NYOMJ: CTRL + C');
                    }
                })
                .catch(() => {
                    // Ha hiba van (pl. 500-as hiba, vagy még nem él a szerver), csak várunk csendben tovább
                });
        }, 2000); // 2 másodpercenként próbálkozik újra
        
    } else {
        console.error('Hiba történt a Docker indításakor!');
    }
});

// 4. Leállítás (CTRL + C) eseménykezelője
process.on('SIGINT', () => {
    console.log('\n\x1b[31m%s\x1b[0m', '🛑 Leállítás folyamatban...');
    try {
        // Docusaurus kilövése
        if (docusaurus) docusaurus.kill(); 

        // --- ADATBÁZIS AUTOMATIKUS MENTÉSE (EXPORT) ---
        console.log('\x1b[36m%s\x1b[0m', '💾 Adatbázis aktuális állapotának kimentése a db_init mappába...');
        try {
            // Itt vannak a te docker-compose.yml fájlodhoz igazított adatok!
            const dumpCommand = 'docker compose exec -T db mysqldump -u root -prootpw --skip-extended-insert mozipont_beta > ./db_init/mozipont_beta.sql';
            execSync(dumpCommand, { stdio: 'ignore', shell: true });
            console.log('\x1b[32m%s\x1b[0m', '✅ Adatbázis sikeresen elmentve az mozipont_beta.sql fájlba!');
        } catch (dbError) {
            console.log('\x1b[31m%s\x1b[0m', '⚠️ Nem sikerült kimenteni az adatbázist.');
        }

        // --- DOCKER LEÁLLÍTÁSA ÉS A KÖTETEK (VOLUMES) TÖRLÉSE ---
        // A "-v" kapcsoló törli a köteteket, így következő induláskor újra beolvassa a friss init.sql-t!
        console.log('\x1b[36m%s\x1b[0m', '🧹 Konténerek leállítása és a régi adatbázis gyorsítótár törlése...');
        execSync('docker compose down -v', { stdio: 'ignore' });
        
        console.log('\x1b[32m%s\x1b[0m', '✅ Minden leállt. Viszlát!');
        process.exit();
    } catch (e) {
        console.log('Hiba a leállításkor, de a program kilép.', e);
        process.exit();
    }
});