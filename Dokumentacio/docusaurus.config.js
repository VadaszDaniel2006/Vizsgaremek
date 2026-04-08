import {themes as prismThemes} from 'prism-react-renderer';

const config = {
  title: 'MoziPont', 
  tagline: 'Mozis filmek és sorozatok webalkalmazása',
  favicon: 'img/logo2.png',

  url: 'https://VadaszDaniel2006.github.io', 
  baseUrl: '/Vizsgaremek/', 

  organizationName: 'VadaszDaniel2006', 
  projectName: 'Vizsgaremek', 

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'hu',
    locales: ['hu'],
  },

  presets: [
    [
      'classic',
      ({
        docs: {
          sidebarPath: './sidebars.js',
          routeBasePath: 'docs', 
          editUrl: 'https://github.com/VadaszDaniel2006/Vizsgaremek/tree/main/dokumentacio/',
          showLastUpdateAuthor: false, 
          showLastUpdateTime: false,   
        },
        blog: false, 
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    ({
      colorMode: {
        defaultMode: 'dark',
        disableSwitch: false,
      },
      navbar: {
        title: '', 
        logo: {
          alt: 'MoziPont Logo',
          src: 'img/logo.png',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Dokumentáció', 
          },
          {
            to: '/naplo', 
            label: 'Fejlesztési Napló', 
            position: 'left'
          },
          {
            href: 'https://github.com/VadaszDaniel2006/Vizsgaremek',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Navigáció',
            items: [
              { label: 'Kezdőlap', to: '/' },
              { label: 'Dokumentáció', to: '/docs/01-bevezetes' },
              { label: 'Fejlesztési Napló', to: '/naplo' },
            ],
          },
          {
            title: 'Kapcsolat',
            items: [
              { label: 'GitHub Repozitórium', href: 'https://github.com/VadaszDaniel2006/Vizsgaremek' },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} MoziPont Vizsgaremek. Készítette: Palkovics Tamás Tibor, Vadász Dániel.`, 
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;