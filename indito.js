const { spawn, execSync } = require('child_process');

console.log('\x1b[33m%s\x1b[0m', '⏳ A MOZI rendszer indítása folyamatban... (Kérlek várj pár másodpercet)');

// 1. Docker indítása a háttérben (hogy ne szemetelje tele a képernyőt)
const docker = spawn('docker', ['compose', 'up', '-d', '--build'], { stdio: 'inherit', shell: true });

docker.on('close', (code) => {
    if (code === 0) {
        // Ha sikeresen elindult, letöröljük a képernyőt és kiírjuk a linkeket
        console.clear();
        console.log('\x1b[32m%s\x1b[0m', '✅ A RENDSZER SIKERESEN ELINDULT!');
        console.log('--------------------------------------------------');
        console.log('🌍 \x1b[36mWEBOLDAL (Kattints ide):\x1b[0m   http://localhost:8090');
        console.log('🗄️  \x1b[36mADATBÁZIS (PhpMyAdmin):\x1b[0m    http://localhost:8082');
        console.log('⚙️  \x1b[36mBACKEND API:\x1b[0m               http://localhost:5000');
        console.log('--------------------------------------------------');
        console.log('\x1b[33m%s\x1b[0m', '🛑 LEÁLLÍTÁSHOZ NYOMJ: CTRL + C');
        
        // Folyamatosan figyeljük, hogy ne lépjen ki a script
        setInterval(() => {}, 1000);
    } else {
        console.error('Hiba történt az indításkor!');
    }
});

// 2. Ha megnyomod a CTRL + C-t, akkor leállítjuk a Dockert is
process.on('SIGINT', () => {
    console.log('\n\x1b[31m%s\x1b[0m', '🛑 Leállítás folyamatban... (A konténerek leállnak)');
    try {
        execSync('docker compose down');
        console.log('✅ Minden leállt. Viszlát!');
        process.exit();
    } catch (e) {
        console.log('Hiba a leállításkor, de a program kilép.');
        process.exit();
    }
});
