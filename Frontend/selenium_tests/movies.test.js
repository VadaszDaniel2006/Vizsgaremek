import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';

async function moviesTesztek() {
    let options = new chrome.Options();
    options.addArguments('--log-level=3'); 
    options.addArguments('--silent');
    options.excludeSwitches('enable-logging'); 

    let driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

    try {
        await driver.manage().window().maximize();
        console.log("--- FILM / TARTALOM TESZTEK (14-20) ---");

        await driver.get('http://localhost:8090/');
        let hero = await driver.wait(until.elementLocated(By.css('.featured-section')), 5000);
        if(await hero.isDisplayed()) console.log("✅ 14. Főoldal Hero banner betöltése: OK");

        await driver.findElement(By.xpath("//a[contains(text(), 'Top 50 Film')]")).click();
        await driver.wait(until.urlContains('/top-50-filmek'), 5000);
        console.log("✅ 15. Top 50 Film oldal: OK");

        await driver.findElement(By.xpath("//a[contains(text(), 'Top 50 Sorozat')]")).click();
        await driver.wait(until.urlContains('/top-50-sorozatok'), 5000);
        console.log("✅ 16. Top 50 Sorozat oldal: OK");

        await driver.findElement(By.xpath("//a[contains(text(), 'Heti Ajánló')]")).click();
        await driver.wait(until.urlContains('/heti-ajanlo'), 5000);
        console.log("✅ 17. Heti Ajánló oldal: OK");

        await driver.get('http://localhost:8090/');
        await driver.sleep(2000); 
        let infoGomb = await driver.wait(until.elementLocated(By.css('.btn-card-info')), 5000);
        await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", infoGomb);
        await driver.sleep(500);
        await infoGomb.click();

        await driver.wait(until.elementLocated(By.css('.modal.active .modal-content')), 5000);
        console.log("✅ 18. Részletek Modal megnyitása: OK");

        let leiras = await driver.findElement(By.css('.info-desc'));
        if(await leiras.isDisplayed()) console.log("✅ 19. Modal leírás (info-desc) megjelenik: OK");

        await driver.findElement(By.css('.close-modal')).click();
        await driver.sleep(500);
        let logo = await driver.findElement(By.css('.logo-link'));
        await logo.click();
        await driver.wait(until.urlIs('http://localhost:8090/'), 5000);
        console.log("✅ 20. Modal bezárása és visszatérés a főoldalra: OK");

    } catch (hiba) { console.error("❌ FILM TESZT ELBUKOTT:", hiba.message);
    } finally { await driver.quit(); }
}
moviesTesztek();