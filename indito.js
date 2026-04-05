const { spawn, execSync } = require('child_process');
const fs = require('fs');

console.log('\x1b[33m%s\x1b[0m', '⏳ A MOZI rendszer és a dokumentáció indítása folyamatban...');

let systemReady = false;

if (!fs.existsSync('./dokumentacio/node_modules')) {
    console.log('\x1b[36m%s\x1b[0m', '📦 Docusaurus függőségek telepítése (ez eltarthat 1-2 percig az első alkalommal)...');
    execSync('npm install', { cwd: './dokumentacio', stdio: 'inherit' });
}

const docker = spawn('docker', ['compose', 'up', '-d', '--build'], { stdio: 'inherit', shell: true });

const docusaurus = spawn('npm', ['start', '--', '--no-open'], { 
    cwd: './dokumentacio',
    stdio: 'ignore',       
    shell: true 
});

docker.on('close', (code) => {
    if (code === 0) {
        console.clear();
        console.log('\x1b[36m%s\x1b[0m', '⏳ Adatbázis szinkronizálása és betöltése... (Kérlek várj, ez eltarthat 10-15 másodpercig)');

        const checkBackend = setInterval(() => {
            fetch('http://localhost:5000/api/filmek')
                .then(res => {
                    if (res.ok) {
                        systemReady = true; 
                        clearInterval(checkBackend); 
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
                    
                });
        }, 2000); 
        
    } else {
        console.error('Hiba történt a Docker indításakor!');
    }
});

process.on('SIGINT', () => {
    console.log('\n\x1b[31m%s\x1b[0m', '🛑 Leállítás folyamatban...');
    try {
        if (docusaurus) docusaurus.kill(); 

        if (systemReady) {
            console.log('\x1b[36m%s\x1b[0m', '💾 Adatbázis aktuális állapotának kimentése a db_init mappába...');
            let dumpSuccessful = false;
            const tempDumpFile = './db_init/mozipont_beta.sql.tmp';
            const finalDumpFile = './db_init/mozipont_beta.sql';

            try {
                const dumpCommand = `docker compose exec -T db mysqldump -u root -prootpw --skip-extended-insert mozipont_beta > ${tempDumpFile}`;
                execSync(dumpCommand, { stdio: 'ignore', shell: true });

                fs.renameSync(tempDumpFile, finalDumpFile);

                console.log('\x1b[32m%s\x1b[0m', '✅ Adatbázis sikeresen elmentve az mozipont_beta.sql fájlba!');
                dumpSuccessful = true;
            } catch (dbError) {
                console.error('\x1b[31m%s\x1b[0m', '⚠️ Nem sikerült kimenteni az adatbázist. A meglévő `mozipont_beta.sql` fájl érintetlen maradt.');

                if (fs.existsSync(tempDumpFile)) {
                    fs.unlinkSync(tempDumpFile);
                }
            }

            if (dumpSuccessful) {

                console.log('\x1b[36m%s\x1b[0m', '🧹 Konténerek leállítása és a régi adatbázis gyorsítótár törlése...');
                execSync('docker compose down -v', { stdio: 'ignore' });
            } else {
                console.log('\n\x1b[33m%s\x1b[0m', '⚠️ Mivel az adatbázis mentése sikertelen volt, a kötet (volume) megmarad az adatvesztés elkerülése érdekében.');
                execSync('docker compose down', { stdio: 'ignore' });
            }
        } else {

            console.log('\n\x1b[33m%s\x1b[0m', '⚠️ A rendszer nem indult el teljesen. A konténerek leállnak, de az adatbázis kötete (volume) megmarad az adatvesztés elkerülése érdekében.');
            execSync('docker compose down', { stdio: 'ignore' });
        }
        
        console.log('\x1b[32m%s\x1b[0m', '✅ Minden leállt. Viszlát!');
        process.exit();
    } catch (e) {
        console.error('Hiba a leállításkor, de a program kilép.', e);
        process.exit();
    }
});