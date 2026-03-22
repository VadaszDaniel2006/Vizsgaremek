---
sidebar_position: 4
title: Technikai Dokumentáció
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Technikai Dokumentáció

Ebben a fejezetben a MoziPont projekt technikai hátterét, az adatbázis felépítését, a forráskód minden részletét és a tesztelési folyamatokat mutatjuk be.

<Tabs>
  <TabItem value="database" label="🗄️ Adatbázis" default>

    ## Adatbázis leírás

    A Mozipont alkalmazás adatbázisa összesen tizenöt táblát tartalmaz, amelyek logikusan és strukturáltan fedik le a platform teljes funkcionalitását. A rendszer alapját a fő entitásokat tartalmazó táblák adják. Ezek közül a legfontosabb a felhasznalok tábla, amely a regisztrált tagok alapvető adatait – mint a felhasználónév, az e-mail cím, a titkosított jelszó és a jogosultságok – tárolja. A tartalmi rész központja a media tábla, amely magukat a filmeket és sorozatokat fogja össze a hozzájuk tartozó címekkel, leírásokkal, megjelenési évekkel és előzetesekkel. Ezen tartalmak műfaji besorolását a kategoriak tábla, míg a megtekintésükre szolgáló felületeket a platformok (például Netflix, HBO Max vagy mozi) tábla biztosítja. Az alkotókhoz köthető információkat a rendezok és a nemzetisegek táblákban rögzítettük. Az interaktív térképes funkció hátterét pedig a mozik tábla adja, amely a hazai filmszínházak elhelyezkedéséhez szükséges adatokat tartalmazza.

    A felhasználói élményt és az interakciókat egy külön logikai csoport kezeli. A közösségi funkciókat az ertekelesek tábla biztosítja, amely összeköti a felhasználókat a médiatartalmakkal, rögzítve a látogatók szöveges véleményeit és pontszámait. A személyre szabhatóság kulcsa a kedvencek és a kedvenc_kategoriak táblákban rejlik: ezek mentik el, hogy egy-egy felhasználó mely filmeket és műfajokat preferálja, ami az egyedi ajánlórendszerünk alapját is képezi. A platformon belüli aktivitást és nézettségi statisztikákat a megtekintesek táblában vezetjük, míg a sajat_listak tábla lehetőséget ad a felhasználóknak, hogy saját, egyedi gyűjteményeket (például „Hétvégi filmezés”) hozzanak létre.

    Mivel az adatbázisban számos több-a-többhöz (N:M) kapcsolat található, ezek feloldására úgynevezett kapcsolótáblákat alkalmaztunk. A sajat_lista_elemek tábla rendeli hozzá a konkrét filmeket a felhasználók által létrehozott listák fejléceihez. Hasonló logikával működik a media_orszagok és a media_platformok tábla is.

    Technikai szempontból az adatbázis InnoDB tárolómotort és utf8mb4_hungarian_ci karakterkódolást használ, amely garantálja az adatbázis integritását, a tranzakciók biztonságos kezelését, a relációk (idegen kulcsok) megfelelő működését, valamint a magyar ékezetes karakterek hibátlan megjelenítését.

    ![Adatbázis táblák](/img/adatbazis_tablak.png)

    ## Az adatbázis relációs modellje (ER diagram) és a kulcstáblák jellemzése

    A relációs adatbázis megtervezésekor (amelyet a fenti ER diagram is szemléltet) különös figyelmet fordítottunk a táblák közötti logikai kapcsolatok (Foreign Keys) kialakítására. A rendszer gerincét a felhasználók és a tartalmak, valamint az ezeket összekötő interakciók adják. Az alábbiakban a három legfontosabb tábla felépítését részletezzük:

    ![ER Diagram](/img/er_diagram.png)

    ### 1. A felhasznalok tábla
    Ez a tábla a rendszer alapköve, amely a regisztrált felhasználók adatait tárolja. Az ábrán is jól látható, hogy a legtöbb interakciós tábla zöld vonalakkal ehhez az entitáshoz kapcsolódik.
    - **id (int)**: Elsődleges kulcs (Primary Key), amely egyedien azonosít minden fiókot.
    - **nev (varchar) és felhasznalonev (varchar)**: A felhasználó teljes neve, illetve a platformon használt egyedi azonosítója.
    - **email (varchar)**: Kapcsolattartáshoz és belépéshez használt e-mail cím.
    - **jelszo_hash (varchar)**: Titkosítva (hash-elve) tárolt jelszó a biztonság érdekében.
    - **avatar (longtext)**: A felhasználó profilképének elérhetősége.
    - **jogosultsag (enum)**: Szerepkör-alapú jogosultság, amely 'user' vagy 'admin' lehet.
    - **regisztracio_datum (datetime)**: A fiók létrehozásának időbélyege.
    - **Kapcsolatai**: 1:N kapcsolatban áll az ertekelesek, kedvencek, sajat_listak, megtekintesek és kedvenc_kategoriak táblákkal.

    ### 2. A media tábla
    Ez a központi entitás felelős a platformon elérhető összes film és sorozat adatainak tárolásáért. Kialakítása lehetővé teszi a két formátum egységes, mégis megkülönböztethető kezelését.
    - **id (int)**: Elsődleges kulcs, a tartalom egyedi azonosítója.
    - **tipus (enum)**: Meghatározza, hogy a rekord 'film' vagy 'sorozat'.
    - **cim (varchar) és leiras (text)**: A mű címe és szinopszisa.
    - **poszter_url és elozetes_url (varchar)**: A borítókép és a trailer hivatkozása.
    - **megjelenes_ev_start (int) és megjelenes_ev_end (varchar)**: A kiadás és befejezés éve.
    - **evadok_szama (int) és hossz_perc (int)**: A tartalom terjedelmét leíró adatok.
    - **alap_rating és rating (decimal)**: Külső forrásból származó, illetve a saját felhasználók által generált értékelések átlaga.
    - **kategoria_id és rendezo_id**: Idegen kulcsok (Foreign Keys), amelyek a kategoriak és a rendezok táblákra mutatnak.

    ### 3. Az ertekelesek tábla
    Ez a tábla a közösségi élmény magja. Feloldja a felhasználók és a tartalmak közötti több-a-többhöz (N:M) kapcsolatot, rögzítve, hogy ki, mit és hogyan értékelt.
    - **id (int)**: Az értékelés egyedi azonosítója.
    - **felhasznalo_id (int)**: Idegen kulcs a véleményt író felhasználóhoz.
    - **media_id (int)**: Idegen kulcs az értékelt tartalomhoz.
    - **pontszam (int)**: A numerikus értékelés (pl. csillagok).
    - **szoveg (text)**: A szöveges kritika.
    - **letrehozva (datetime)**: Az értékelés időpontja.
    - **jelentve (tinyint) és jelentes_oka (varchar)**: Moderációs mezők, amelyek jelzik, ha egy értékelést a közösség sértőként jelentett az adminisztrátoroknak.

  </TabItem>

  <TabItem value="backend" label="⚙️ Backend">

    ## Szerveroldali architektúra (Node.js & Express)

    ### Biztonsági Middleware (authMiddleware.js)
    A rendszer JWT (JSON Web Token) alapú hitelesítést használ.

    ```javascript
    const jwt = require('jsonwebtoken');

    const protect = (req, res, next) => {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            try {
                token = req.headers.authorization.split(' ')[1];
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'titkoskulcs');
                req.user = decoded;
                next();
            } catch (error) {
                res.status(401).json({ message: 'Érvénytelen token!' });
            }
        } else {
            res.status(401).json({ message: 'Nincs token, nem vagy jogosult!' });
        }
    };
    ```

    ### 🤖 Automatizált Adatgyűjtés (Cinema Scraper Robot)

    A projekt egyik legfejlettebb funkciója a `cinemaScraper.js`, amely hibrid technológiával gyűjti össze az országos moziműsort.

    #### 1. Hibrid lekérdezési stratégia
    A rendszer alkalmazkodik a céloldal technológiájához: a nagy hálózatoknál (Cinema City) közvetlen API hívásokat használ, míg a független moziknál HTML elemzést (Scraping) végez.

    ```javascript
    // Példa: Cinema City API alapú lekérdezése
    const apiUrl = `https://www.cinemacity.hu/hu/data-api-service/v1/quickbook/10102/film-events/in-cinema/${internalId}/at-date/${date}`;
    const response = await axios.get(apiUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    ```

    #### 2. Intelligens szövegfeldolgozás
    A robot egyedi normalizáló algoritmust használ, hogy a weboldalakon talált eltérő filmcímeket (pl. névelők, ékezetek különbsége) párosítani tudja az adatbázissal.

    ```javascript
    const normalizeText = (text) => {
        return text.toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Ékezetek eltávolítása
            .replace(/[^a-z0-9]+/g, ' ') // Speciális karakterek törlése
            .trim();
    };
    ```

    #### 3. Regex alapú időpont-szűrés
    Az univerzális scraper egy kőkemény reguláris kifejezéssel választja le a vetítési időpontokat a zavaró számoktól (pl. játékidő vagy dátumok).

    ```javascript
    // Csak a valódi mozi időpontokat (pl. 18:30) találja meg
    const timeRegex = /(?<!\d[\.\-])\b(?:[01]?[0-9]|2[0-3])[:.][0-5][0-9]\b(?!\.)(?!\s*perc|\s*p\b)/gi;
    ```

    #### 4. Teljesítmény és Hibatűrés
    Annak érdekében, hogy ne terhelje túl a szervereket és elkerülje az IP-tiltást, a robot **5-ös csomagokban (chunks)** dolgozza fel a mozikat, rövid szünetekkel. A kis mozik SSL hibáit a `rejectUnauthorized: false` kapcsolóval küszöböli ki.

  </TabItem>

  <TabItem value="frontend" label="🖥️ Frontend">

    ## Kliensoldali logika (React.js)

    ### 1. MovieCard komponens
    Kezeli a filmek állapotát (kedvenc, listázott). A `safeMovie` objektum biztosítja az adatkonzisztenciát:

    ```javascript
    const safeMovie = movie ? { 
        ...movie, 
        tipus: movie.tipus || ((movie.evadok_szama !== undefined) ? 'sorozat' : 'film') 
    } : null;
    ```

    ### 2. ModalManager
    Központosított felület a moziműsorok megjelenítéséhez. Az ablak nyitásakor aszinkron módon kéri le az adatokat:

    ```javascript
    useEffect(() => {
        const fetchLiveAdatok = async () => {
            if (streamingModal.isOpen && streamingModal.movie) {
                const mediaId = streamingModal.movie.id;
                const [mozikRes, streamingRes] = await Promise.all([
                    fetch(`http://localhost:5000/api/mozik/${mediaId}/mozik`),
                    fetch(`http://localhost:5000/api/mozik/${mediaId}/platformok`)
                ]);
            }
        };
        fetchLiveAdatok();
    }, [streamingModal.isOpen]);
    ```

    ### 3. CinemaMap: GPS és Távolság
    A térkép a `react-leaflet` könyvtárat használja. A legközelebbi mozi kiszámításához a **Haversine-formulát** alkalmazzuk:

    ```javascript
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; 
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };
    ```

  </TabItem>

  <TabItem value="testing" label="🧪 Tesztelés">

    ## Automatizált tesztek (Jest)

    A projekt megbízhatóságát egységtesztek garantálják. A tesztelés például az `authController`, `authMiddleware` és `cinemaScraper` fájlokra terjed ki. Ezekből mutatunk pár példát.

    ### Példa: Auth Controller Teszt
    ```javascript
    describe('register', () => {
        it('Sikeres regisztráció (201-es státuszkód)', async () => {
            db.query.mockResolvedValueOnce([[]]); 
            db.query.mockResolvedValueOnce([{ insertId: 1 }]); 
            await authController.register(req, res);
            expect(res.status).toHaveBeenCalledWith(201);
        });
    });
    ```

    ### Tesztek futtatásának menete

    **1. Lépjen be a backend mappába:**
    ```bash
    cd backend
    ```

    **2. Futtassa a teszteket az npx paranccsal:**
    ```bash
    npx jest
    ```

  </TabItem>

 <TabItem value="install" label="🚀 Telepítés">

    ## Telepítési útmutató és Fejlesztői Környezet

    A projekt egyedi, automatizált indító scripttel (`indito.js`) rendelkezik, amely jelentősen leegyszerűsíti a fejlesztői környezet elindítását, a dokumentáció kezelését és az adatbázis szinkronizálását. **Nincs szükség a Docker és az npm parancsok külön-külön történő kézi futtatására!**

    ### 1. Rendszer indítása

    1. Nyisson meg egy parancssort (terminált) a projekt gyökérmappájában (`Vizsgaremek`).
    2. Futtassa az alábbi egyetlen parancsot:
       ```bash
       node indito.js
       ```
    
    **Mi történik a háttérben?**
    - A script ellenőrzi, és ha szükséges, automatikusan telepíti a Docusaurus függőségeit.
    - Elindítja és felépíti a Docker konténereket a háttérben (`docker compose up -d --build`).
    - Csendben elindítja a dokumentáció fejlesztői szerverét is.

    ### 2. Leállítás és Automatikus Adatbázis Mentés

    A munka befejeztével a rendszer leállításához **kizárólag a terminálban lenyomott `CTRL + C` billentyűkombinációt** szabad használni!
    
    Ez egy kritikus lépés a folyamatban, ugyanis a script ekkor:
    1. **Kimenti az adatbázist:** Készít egy friss, soronként formázott másolatot a jelenleg futó adatbázisról, és felülírja vele a `db_init/mozipont_beta.sql` fájlt. (Ehhez a `--skip-extended-insert` paramétert használja a tiszta verziókövetés érdekében).
    2. **Leállít mindent:** Szabályosan leállítja a Docusaurust és a Docker konténereket.
    3. **Takarít:** Törli a Docker belső adatbázis köteteit (`-v` kapcsoló). Ez garantálja, hogy a következő indításkor a Docker egy tiszta lappal induljon, és a legfrissebb `.sql` fájlt olvassa be.

    ### Elérhetőségek a sikeres indítás után:
    - **Weboldal (Frontend)**: [http://localhost:8090](http://localhost:8090)
    - **Adatbázis (phpMyAdmin)**: [http://localhost:8082](http://localhost:8082)
    - **Backend API**: [http://localhost:5000](http://localhost:5000)
    - **Dokumentáció**: [http://localhost:3000/Vizsgaremek/](http://localhost:3000/Vizsgaremek/)

  </TabItem>
</Tabs>