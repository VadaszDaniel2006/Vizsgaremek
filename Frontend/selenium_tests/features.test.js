import { Builder, By, until, Key } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';

async function extraTesztek() {
    let options = new chrome.Options();
    options.addArguments('--log-level=3'); 
    options.addArguments('--silent');
    options.excludeSwitches('enable-logging'); 

    let driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

    try {
        await driver.manage().window().maximize();
        console.log("---  FUNKCIÓK TESZTJE (26-30) ---");

        await driver.get('http://localhost:8090/');
        await driver.wait(until.elementLocated(By.css('.search-btn-icon')), 5000).click();
        let keresoMezo = await driver.wait(until.elementLocated(By.css('input[placeholder*="Címek"]')), 5000);
        await keresoMezo.sendKeys('Ava');
        let dropdown = await driver.wait(until.elementLocated(By.css('.search-dropdown-modern')), 5000);
        if(await dropdown.isDisplayed()) console.log("✅ 26. Keresési javaslatok megjelennek: OK");

        await driver.get('http://localhost:8090/');
        await driver.sleep(1000);
        let elsoKartya = await driver.wait(until.elementLocated(By.css('.movie-card')), 5000);
        await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", elsoKartya);
        await elsoKartya.click();
        let video = await driver.wait(until.elementLocated(By.css('.video-container iframe')), 5000);
        if(await video.isDisplayed()) console.log("✅ 27. Trailer videólejátszó betöltése: OK");
        await driver.findElement(By.css('.close-modal')).click();
        await driver.sleep(1000);

        let megnézemGomb = await driver.wait(until.elementLocated(By.css('.btn-card-play')), 5000);
        await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", megnézemGomb);
        await megnézemGomb.click();
        let streaming = await driver.wait(until.elementLocated(By.css('.streaming-services-container')), 5000);
        if(await streaming.isDisplayed()) console.log("✅ 28. Streaming választó modal: OK");
        await driver.findElement(By.css('.close-modal')).click();
        await driver.sleep(1000);

        console.log("...Bejelentkezés az utolsó tesztekhez...");
        await driver.wait(until.elementLocated(By.css('.btn-login')), 5000).click();
        await driver.sleep(1000);
        await driver.findElement(By.css('.auth-card input[type="email"]')).sendKeys('admin@admin.com');
        await driver.findElement(By.css('.auth-card input[type="password"]')).sendKeys('admin1');
        await driver.findElement(By.css('.btn-submit-auth')).click();

        let profilAvatar = await driver.wait(until.elementLocated(By.css('.nav-right img')), 10000);
        await driver.sleep(2000); 
        console.log("...Belépve.");

        await profilAvatar.click();
        await driver.sleep(1000);

        let editLink = await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Profil szerkesztése')]")), 5000);
        await editLink.click();

        let profileModal = await driver.wait(until.elementLocated(By.css('.profile-modal-content')), 5000);
        if(await profileModal.isDisplayed()) console.log("✅ 29. Profil szerkesztő (ProfileEditor) megnyitása: OK");

        await driver.findElement(By.css('.profile-close-modal')).click();
        await driver.sleep(1000);

        await profilAvatar.click();
        await driver.sleep(1000);
        let favLink = await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Kedvenceim')]")), 5000);
        await favLink.click();

        let sidebar = await driver.wait(until.elementLocated(By.css('[class*="sidebar"]')), 5000);
        if(await sidebar.isDisplayed()) console.log("✅ 30. Kedvencek oldalsáv (Sidebar) megnyílt: OK");

        

    } catch (hiba) { 
        console.error("❌  TESZT ELBUKOTT:", hiba.message);
    } finally { 
        await driver.quit(); 
    }
}
extraTesztek();