import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

// Itt definiáljuk a 3 oszlop tartalmát
const FeatureList = [
  {
    title: 'Filmek & Sorozatok',
    // Kép helyett emojit használunk, hogy ne kelljen fájlokkal bajlódni
    emoji: '🎬', 
    description: (
      <>
        Böngéssz a legújabb tartalmak között, nézz előzeteseket, olvasd el a leírásokat
        és találd meg a következő kedvencedet egy helyen.
      </>
    ),
  },
  {
    title: 'Moziműsor & Jegyfoglalás',
    emoji: '🎫',
    description: (
      <>
        Keress a közeli mozik aktuális kínálatában. Nézd meg a vetítési időpontokat,
        válaszd ki a legjobb széket és foglald le a jegyedet online.
      </>
    ),
  },
  {
    title: 'Okos Ajánlórendszer',
    emoji: '🧠',
    description: (
      <>
        Nem tudod mit nézz? A rendszerünk elemzi a korábbi kedvenc kategóriáidat 
        ,hogy személyre szabott ajánlásokat adjon neked.
      </>
    ),
  },
];

function Feature({emoji, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        {/* Itt jelenítjük meg az emojit jó nagyban */}
        <span style={{fontSize: '4rem', display: 'block', marginBottom: '1rem'}} role="img" aria-label={title}>
          {emoji}
        </span>
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}