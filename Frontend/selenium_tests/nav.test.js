import { Builder, By, until, Key } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';

async function navTesztek() {
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
        console.log("--- NAVIGÁCIÓ ÉS EXTRÁK (21-25) ---");

        await driver.get('http://localhost:8090/');
        let keresoIkon = await driver.wait(until.elementLocated(By.css('.search-btn-icon')), 5000);
        await keresoIkon.click();
        await driver.sleep(800);

        let keresoMezo = await driver.wait(until.elementLocated(By.css('input[placeholder*="Címek"]')), 5000);
        await keresoMezo.sendKeys('Avatar', Key.RETURN);

        await driver.wait(until.urlContains('/kereses'), 5000);
        console.log("✅ 21. Keresés funkció: OK");

        let moziTerkepLink = await driver.wait(until.elementLocated(By.linkText('Mozitérkép')), 5000);
        await driver.wait(until.elementIsVisible(moziTerkepLink), 5000);
        await moziTerkepLink.click();
        
        await driver.wait(until.urlContains('/mozik-terkep'), 5000);
        console.log("✅ 22. Mozitérkép oldal: OK");

        await driver.get('http://localhost:8090/'); 
        await driver.executeScript("window.scrollTo(0, document.body.scrollHeight)");
        await driver.sleep(1000);
        
        let sugo = await driver.wait(until.elementLocated(By.linkText('Súgóközpont')), 5000);
        await sugo.click();
        await driver.wait(until.urlContains('/sugokozpont'), 5000);
        console.log("✅ 23. Footer: Súgóközpont oldal: OK");

        await driver.get('http://localhost:8090/');
        await driver.executeScript("window.scrollTo(0, document.body.scrollHeight)");
        await driver.sleep(1000);
        
        let aszf = await driver.wait(until.elementLocated(By.linkText('Használati feltételek')), 5000);
        await aszf.click();
        await driver.wait(until.urlContains('/aszf'), 5000);
        console.log("✅ 24. Footer: Használati feltételek (ÁSZF): OK");

        await driver.get('http://localhost:8090/');
        await driver.executeScript("window.scrollTo(0, document.body.scrollHeight)");
        await driver.sleep(1000);
        
        let adatvedelem = await driver.wait(until.elementLocated(By.linkText('Adatvédelem')), 5000);
        await adatvedelem.click();
        await driver.wait(until.urlContains('/adatvedelem'), 5000);
        console.log("✅ 25. Footer: Adatvédelem oldal: OK");

    } catch (hiba) { 
        console.error("❌ NAVIGÁCIÓ TESZT ELBUKOTT:", hiba.message);
    } finally { 
        await driver.quit(); 
    }
}
navTesztek();