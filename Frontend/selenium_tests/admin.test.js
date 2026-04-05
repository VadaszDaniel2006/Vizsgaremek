import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';

async function adminTesztek() {
    let options = new chrome.Options();
    options.addArguments('--log-level=3'); 
    options.addArguments('--silent');
    options.addArguments('--disable-logging');
    options.excludeSwitches('enable-logging'); 

    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    try {
        await driver.manage().window().maximize();
        
        console.log("--- ADMIN TESZTEK (6-13) ---");

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

        await driver.get('http://localhost:8090/admin');
        let header = await driver.wait(until.elementLocated(By.css('.neo-header h1')), 5000).getText();
        if(header.includes('Rendszervezérlő')) console.log("✅ 6. Admin Dashboard betöltés: OK");

        await driver.findElement(By.xpath("//div[contains(@class, 'neo-tab') and contains(., 'Felhasználók')]")).click();
        await driver.sleep(1000);
        let userTable = await driver.findElement(By.css('.neo-table')).isDisplayed();
        if(userTable) console.log("✅ 7. Felhasználók fül és táblázat megjelenítése: OK");

        await driver.findElement(By.xpath("//div[contains(@class, 'neo-tab') and contains(., 'Jelentések')]")).click();
        await driver.sleep(1000);
        console.log("✅ 8. Jelentések fülre váltás: OK");

        await driver.findElement(By.xpath("//div[contains(@class, 'neo-tab') and contains(., 'Üzenetek')]")).click();
        await driver.sleep(1000);
        console.log("✅ 9. Üzenetek fülre váltás: OK");

        await driver.findElement(By.xpath("//div[contains(@class, 'neo-tab') and contains(., 'Tartalom Kezelése')]")).click();
        await driver.sleep(1000);
        let subTabs = await driver.findElement(By.css('.neo-sub-tabs')).isDisplayed();
        if(subTabs) console.log("✅ 10. Tartalom Kezelése fül és al-menük megjelenése: OK");

        await driver.findElement(By.xpath("//div[contains(@class, 'neo-tab') and contains(., 'Új Feltöltés')]")).click();
        await driver.sleep(1000);
        console.log("✅ 11. Új Feltöltés fülre váltás: OK");

        let submitGomb = await driver.findElement(By.css('button[type="submit"].neo-btn-primary'));
        await submitGomb.click();
        await driver.sleep(1000);
        let isFormStillThere = await driver.findElement(By.css('.neo-form-grid')).isDisplayed();
        if(isFormStillThere) console.log("✅ 12. Új tartalom validáció (Üres küldés blokkolva): OK");

        await driver.findElement(By.css('.neo-btn-exit')).click();
        await driver.wait(until.urlIs('http://localhost:8090/'), 5000);
        console.log("✅ 13. Kilépés a Főoldalra gomb működése: OK");

    } catch (hiba) { 
        console.error("❌ ADMIN TESZT ELBUKOTT:", hiba.message);
    } finally { 
        await driver.quit(); 
    }
}
adminTesztek();