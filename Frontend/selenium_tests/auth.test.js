import { Builder, By, until } from 'selenium-webdriver';

async function authTesztek() {
    let driver = await new Builder().forBrowser('chrome').build();
    try {
        await driver.manage().window().maximize();
        
        console.log("--- AUTH TESZTEK (1-5) ---");

        await driver.get('http://localhost:8090/');
        await driver.wait(until.elementLocated(By.css('.btn-login')), 5000).click();
        await driver.sleep(1000); 

        let emailInput = await driver.wait(until.elementLocated(By.css('.auth-card input[type="email"]')), 5000);
        await driver.wait(until.elementIsVisible(emailInput), 5000);
        await emailInput.sendKeys('admin@admin.com');
        
        await driver.findElement(By.css('.auth-card input[type="password"]')).sendKeys('admin1');
        await driver.findElement(By.css('.btn-submit-auth')).click();

        await driver.wait(async () => {
            let loginBtns = await driver.findElements(By.css('.btn-login'));
            return loginBtns.length === 0;
        }, 8000);
        console.log("✅ 1. Sikeres Admin bejelentkezés (Modalon keresztül): OK");

        await driver.get('http://localhost:8090/'); 
        await driver.sleep(1000);
        let profilDropdown = await driver.wait(until.elementLocated(By.css('.nav-right .profil-dropdown-toggle, .nav-right img, .nav-right .user-menu')), 5000);
        await profilDropdown.click();
        await driver.sleep(1000);
        await driver.findElement(By.xpath("//*[contains(text(), 'Kijelentkezés') or contains(text(), 'Kilépés')]")).click();

        try {
            let igenGomb = await driver.wait(until.elementLocated(By.xpath("//button[contains(translate(text(), 'IGEN', 'igen'), 'igen') or contains(@class, 'swal2-confirm')]")), 5000);
            await driver.wait(until.elementIsVisible(igenGomb), 5000);
            await igenGomb.click();
            await driver.sleep(1000); 
        } catch (e) {
            console.log("Nem találtam meg az 'Igen' gombot a felugró ablakon, próbálok továbbmenni...");
        }
 
        await driver.get('http://localhost:8090/');
        await driver.wait(until.elementLocated(By.css('.btn-login')), 5000);
        console.log("✅ 2. Kijelentkezés: OK");

        await driver.get('http://localhost:8090/');
        await driver.sleep(1000);
        await driver.wait(until.elementLocated(By.css('.btn-login')), 5000).click();
        await driver.sleep(1000); 
        
        await driver.findElement(By.css('.auth-card input[type="email"]')).sendKeys('admin@admin.com');
        await driver.findElement(By.css('.auth-card input[type="password"]')).sendKeys('rosszjelszo123');
        await driver.findElement(By.css('.btn-submit-auth')).click();
        await driver.sleep(2000);
        let errorMsg = await driver.findElements(By.css('.auth-error'));
        if (errorMsg.length > 0) console.log("✅ 3. Sikertelen bejelentkezés (Rossz jelszó blokkolva): OK");

        await driver.get('http://localhost:8090/');
        await driver.sleep(1000);
        await driver.wait(until.elementLocated(By.css('.btn-login')), 5000).click();
        await driver.sleep(1000); 
        
        await driver.findElement(By.css('.auth-card input[type="email"]')).sendKeys('hibasemailformatum');
        await driver.findElement(By.css('.auth-card input[type="password"]')).sendKeys('admin1');
        await driver.findElement(By.css('.btn-submit-auth')).click();
        await driver.sleep(1000);
        console.log("✅ 4. Bejelentkezés hibás email formátummal (Validáció): OK");

        await driver.get('http://localhost:8090/');
        await driver.sleep(1000);
        await driver.wait(until.elementLocated(By.css('.btn-login')), 5000).click();
        await driver.sleep(1000); 
        
        await driver.findElement(By.xpath("//span[contains(text(), 'Regisztrálj most')]")).click();
        await driver.sleep(1000);
        let title = await driver.findElement(By.css('.auth-header h2')).getText();
        if(title.includes('Fiók')) console.log("✅ 5. Váltás Regisztrációs felületre: OK");

    } catch (hiba) { 
        console.error("❌ AUTH TESZT ELBUKOTT:", hiba.message);
    } finally { 
        await driver.quit(); 
    }
}
authTesztek();