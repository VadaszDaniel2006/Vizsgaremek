import React from 'react';  

export default function Terms() {
  return (
    <div className="page-container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '110px 20px 60px', color: '#d1d5db', lineHeight: '1.8', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#ffffff', borderBottom: '2px solid #374151', paddingBottom: '15px', marginBottom: '30px', fontSize: '2.5rem' }}>Általános Szerződési Feltételek (ÁSZF)</h1>
      <p style={{ marginBottom: '40px', fontStyle: 'italic', color: '#9ca3af' }}>Hatályba lépés dátuma: {new Date().getFullYear()}. március 1. A jelen ÁSZF visszavonásig, illetve a módosítások közzétételéig érvényes.</p>

      <section style={{ marginTop: '40px' }}>
        <h2 style={{ color: '#ffffff', fontSize: '1.8rem', marginBottom: '15px' }}>1. A Szerződés tárgya és létrejötte</h2>
        <p style={{ marginBottom: '15px' }}>
          A jelen Általános Szerződési Feltételek (a továbbiakban: ÁSZF) a MoziPont (a továbbiakban: Szolgáltató) által üzemeltetett mozipont.hu (és aldomainjei) weboldalon elérhető szolgáltatások igénybevételének feltételeit tartalmazza. A Szolgáltatás célja egy átfogó filmes és sorozatos adatbázis, moziműsor-kereső (Mozi Térkép) és közösségi platform biztosítása.
        </p>
        <p style={{ marginBottom: '15px' }}>
          A szerződés a Szolgáltató és a weboldalt látogató, illetve ott regisztráló felhasználó (a továbbiakban: Felhasználó) között jön létre. A weboldal használatának megkezdésével, illetve a regisztrációs gombra történő kattintással a Felhasználó kijelenti, hogy a jelen ÁSZF-et elolvasta, megértette, és annak minden pontját magára nézve kötelezőnek ismeri el.
        </p>
      </section>

      <section style={{ marginTop: '40px' }}>
        <h2 style={{ color: '#ffffff', fontSize: '1.8rem', marginBottom: '15px' }}>2. Korhatár és kiskorúak védelme</h2>
        <p style={{ marginBottom: '15px' }}>
          A MoziPont platformján vizuális és szöveges formában megjelenhetnek olyan filmadatok, előzetesek vagy cselekményleírások, amelyek felnőtt tartalomra utalnak, vagy 18 éven aluliak számára nem ajánlottak (pl. horror, thriller, korhatáros akciófilmek). 
        </p>
        <p style={{ marginBottom: '15px' }}>
          A platform böngészése és a regisztráció kizáróales a 16. életévüket betöltött személyek számára engedélyezett. A 16 éven aluli felhasználók regisztrációjához és a közösségi funkciók (kommentelés, profilalkotás) használatához a szülő vagy törvényes képviselő előzetes hozzájárulása szükséges. A Szolgáltató fenntartja a jogot, hogy korhatár-besorolási figyelmeztetéseket helyezzen el az egyes filmek adatlapjain, azonban ezek betartásának ellenőrzése a Felhasználó (kiskorú esetén a törvényes képviselő) kizárólagos felelőssége.
        </p>
      </section>

      <section style={{ marginTop: '40px' }}>
        <h2 style={{ color: '#ffffff', fontSize: '1.8rem', marginBottom: '15px' }}>3. A Platform funkciói és a Heti Ajánló Rendszer</h2>
        <p style={{ marginBottom: '15px' }}>
          A Szolgáltató folyamatosan frissülő, <strong>Top 50-es globális toplistát</strong>, valamint <strong>Heti Ajánló</strong> szekciót üzemeltet. A Heti Ajánlóba bekerülő filmek és sorozatok automatizált algoritmus alapján kerülnek kiválasztásra, amelynek szigorú feltétele, hogy az adott tartalom a nemzetközi értékelési platformokon és a MoziPont saját rendszerében elérje a legalább 7.0-s átlagértékelést.
        </p>
        <p style={{ marginBottom: '15px' }}>
          Regisztrált Felhasználóink számára a rendszer személyre szabott Kezdőoldalt biztosít. A Felhasználó által megadott kedvenc kategóriák (pl. Sci-Fi, Dráma) alapján az algoritmus előtérbe helyezi a releváns, magas értékelésű tartalmakat. A Szolgáltató nem garantálja, hogy az ajánlott tartalmak minden esetben elnyerik a Felhasználó tetszését, az algoritmus pusztán statisztikai valószínűségeken alapul.
        </p>
      </section>

      <section style={{ marginTop: '40px' }}>
        <h2 style={{ color: '#ffffff', fontSize: '1.8rem', marginBottom: '15px' }}>4. Felhasználói tartalmak és Szerzői jogok</h2>
        <p style={{ marginBottom: '15px' }}>
          A Felhasználó által az oldalon közzétett tartalmak (kommentek, saját listák nevei, profilképek) nem sérthetik mások szerzői jogait, személyiségi jogait vagy a hatályos jogszabályokat. A Felhasználó a hozzászólás elküldésével nem kizárólagos, ingyenes, globális felhasználási engedélyt (licencet) ad a Szolgáltatónak a tartalom megjelenítésére, tárolására és formázására a platform működtetése céljából.
        </p>
        <p style={{ marginBottom: '15px' }}>
          <strong>Spoiler Szabályzat:</strong> Tilos a filmek, sorozatok cselekményének kritikus pontjait (befejezés, nagy csavarok) figyelmeztetés nélkül leírni. A Felhasználó köteles a [SPOILER] címkét használni mondandója elején. A szabályzat ismételt megsértése a kommentelési jog megvonásával járhat.
        </p>
      </section>

      <section style={{ marginTop: '40px' }}>
        <h2 style={{ color: '#ffffff', fontSize: '1.8rem', marginBottom: '15px' }}>5. Szolgáltatás szüneteltetése, Fiók megszüntetése</h2>
        <p style={{ marginBottom: '15px' }}>
          A Szolgáltató jogosult a platform karbantartása, frissítése vagy biztonsági okok miatt a szolgáltatást előzetes értesítés nélkül, átmenetileg szüneteltetni (Vis Maior). Ebből fakadóan a Felhasználót kártérítés nem illeti meg.
        </p>
        <p style={{ marginBottom: '15px' }}>
          A Felhasználó bármikor jogosult a profilját törölni az erre kijelölt menüpontban vagy ügyfélszolgálati megkeresés útján. A Szolgáltató fenntartja a jogot, hogy a jelen ÁSZF-et, az etikai kódexet vagy a jogszabályokat súlyosan megsértő Felhasználók fiókját – előzetes figyelmeztetés után vagy anélkül – azonnali hatállyal törölje, és a Felhasználót a szolgáltatás további használatából kizárja.
        </p>
      </section>
    </div>
  );
}