const sidebars = {
  tutorialSidebar: [
    'bevezetes',
    'csapat-es-feladatok',
    'kornyezet',
    {
      type: 'category',
      label: 'Technológiai Áttekintés',
      link: {
        type: 'doc',
        id: 'tech-dokumentacio',
      },
      items: [
        'adatbazis',
        'backend',
        'frontend',
        'admin-vezerlopult',
        'teszteles'
      ],
    },
  ],
};

export default sidebars;