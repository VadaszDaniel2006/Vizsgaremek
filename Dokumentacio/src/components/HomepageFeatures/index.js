import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Filmek & Sorozatok',
  
    emoji: '🎬', 
    description: (
      <>
        Böngéssz a legújabb tartalmak között, nézz előzeteseket, olvasd el a leírásokat
        és találd meg a következő kedvencedet egy helyen.
      </>
    ),
  },
  {
    title: 'Moziműsor',
    emoji: '🎫',
    description: (
      <>
        Keresd meg a hozzád legközelebb eső mozikat az interaktív térképen! Nézd meg a naprakész vetítési időpontokat, 
        mentsd el a kedvenc filmjeidet a saját listádra, és tervezd meg a következő moziélményed.
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