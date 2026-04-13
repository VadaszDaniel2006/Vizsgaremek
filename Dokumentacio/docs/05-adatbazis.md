---
id: adatbazis
sidebar_position: 5
title: Adatbázis felépítése
---

# Adatbázis Felépítése és Logikai Modellje (ER)

A MoziPont alkalmazás hatalmas mennyiségű és sokrétű adatot kezel, ezért a szilárd és jól átgondolt adatbázis-struktúra elengedhetetlen volt. A rendszert egy **MySQL** relációs adatbázis-kezelő (RDBMS) szolgálja ki. 

A tervezés során a Harmadik Normálformát (3NF) alkalmaztuk, hogy minimalizáljuk az adatredundanciát és megakadályozzuk az anomáliákat az adatok frissítésekor vagy törlésekor. Az adatbázis `InnoDB` tárolómotort használ, amely teljes ACID (Atomicitás, Konzisztencia, Izoláció, Tartósság) támogatást nyújt a komplex tranzakciókhoz. Az `utf8mb4_hungarian_ci` karakterkódolás biztosítja a speciális karakterek és a magyar nyelv teljes körű támogatását.

A rendszer összesen 16 összefüggő táblából áll.

![Adatbázis táblák listája a phpMyAdminban](/img/db-tablak.png)

## Az Adatbázis Elérése

A rendszer indítása után az adatbázis az alábbi címeken érhető el:

**Web Interface (phpMyAdmin):**
- 🌐 URL: `http://localhost:8082`
- 👤 Felhasználónév: `root`
- 🔐 Jelszó: `rootpw`

A phpMyAdmin felületén keresztül megtekinthetők és szerkeszthetők az összes táblák, valamint futtathatók SQL lekérdezések az adatbázis kezeléséhez.

## Az Adatbázis Relációs Modellje (ER Diagram)

A könnyebb megérthetőség érdekében a komplex Entitás-Kapcsolat (Entity-Relationship) modellt két fő logikai blokkra osztottuk: a felhasználókat és interakciókat kezelő részre, valamint a médiatartalmakat és moziműsorokat kezelő részre. Ezeket számos N:M (több-a-többhöz) kapcsolótábla köti össze.

### 1. Felhasználók és Közösségi Interakciók Blokkia
Ez a terület felel a platform személyre szabhatóságáért és a közösségi élményért.

![ER diagram - Felhasználók és Interakciók](/img/er-bal.png)

* **`felhasznalok` tábla:** A rendszer alapköve. Oszlopai között szerepel a biztonságos `jelszo_hash` (visszafejthetetlen, Bcrypt által kódolt jelszó), az `email`, valamint a `jogosultsag` (ENUM: 'user' vagy 'admin'), amely a hozzáférési szinteket (RBAC) vezérli.
* **`ertekelesek` tábla (Kapcsolótábla):** Egy klasszikus N:M feloldó tábla, amely összeköti a felhasználókat a filmekkel. Tárolja az 1-10 közötti pontszámot (`pontszam`), a szöveges véleményt, a dátumot, valamint a `jelolve` (boolean) mezőt, amely jelzi az adminisztrátorok felé, ha a komment moderálásra szorul.
* **`sajat_listak` és `sajat_lista_elemek` táblák:** A személyes gyűjtemények logikáját valósítják meg. Egy felhasználónak több listája lehet (1:N), és egy listán több film szerepelhet (N:M).
* **`kedvencek` és `kedvenc_kategoriak` táblák:** Ez a két tábla a MoziPont intelligens ajánlórendszerének alapja. A felhasználóhoz rendelt műfaji azonosítók (`kategoria_id`) alapján súlyozza a backend a kezdőoldali lekérdezéseket.

### 2. Médiatartalmak, Mozik és Szolgáltatók Blokkia
Ez a szekció kezeli magát a szórakoztatóipari tartalmat és azok elérhetőségét. Az adatbázis-optimalizálás egyik kulcsa itt az volt, hogy a filmeket és sorozatokat ne külön táblákban, hanem egy közös, hatékony entitásban tároljuk.

![ER diagram - Média, mozik és kategóriák](/img/er-jobb.png)

* **`media` tábla:** A legnagyobb és legtöbbet lekérdezett entitás. A `tipus` ENUM oszlop (értéke: 'film' vagy 'sorozat') differenciálja a rekordokat. Tartalmazza a metaadatokat (cím, leírás, korhatár, hossz, HD poszter URL, YouTube trailer link). Kétféle minősítési oszloppal rendelkezik: az `alap_rating` a nemzetközi standardot (pl. IMDb) mutatja, míg a `rating` mezőt a backendünk folyamatosan újraszámolja a saját felhasználóink leadott értékelései (`ertekelesek` tábla) alapján.
* **`mozik` és `media_mozik` táblák:** A földrajzi és időbeli információszolgáltatás alapja. A `mozik` tábla tárolja a szélességi és hosszúsági koordinátákat (`lat`, `lng`) a térképhez, valamint a hálózat típusát (pl. Cinema City). A `media_mozik` kapcsolótábla tartalmazza a pontos `vetites_idopont` (DATETIME) adatokat.
* **`kategoriak` és `media_kategoriak`:** A műfaji besorolást (pl. Horror, Dráma) és a gyors szűrési logikát támogató táblák.
* **`platformok` és `media_platformok`:** Lehetővé teszik, hogy a filmekhez direkt streaming linkeket (pl. Netflix, HBO Max) rendeljünk.