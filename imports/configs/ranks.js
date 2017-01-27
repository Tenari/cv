export const teamConfigs = {
  nature: {
    key: 'nature',
    startingCharacterCode: 100,
    name: 'Wild Nature',
  },
  japs: {
    key: 'japs',
    startingCharacterCode: 30,
    name: 'Land of the Rising Sun',
  },
  romans: {
    key: 'romans',
    startingCharacterCode: 20,
    name: 'Roman Empire',
  },
};

export const playerTeamKeys = _.select(_.keys(teamConfigs), function(key) {return key != 'nature';});

export const ranksConfig = {
  king: {
    key: 'king',
    japs: {
      name: 'Shogun',
      image: '/images/shogun.png',
    },
    romans: {
      name: 'Imperator',
      image: '/images/imperator.png',
    },
    number: 1,
    power: 100,
    value: 100,
    missionPoints: 10,
  },
/*  noble: {
    japs: 'Lord',
    romans: 'Senator',
    number: 2,
    power: 80,
  },*/
  freeman: {
    key: 'freeman',
    japs: {
      name: 'Samurai',
      image: '/images/samurai.png',
    },
    romans: {
      name: 'Patrician',
      image: '/images/patrician.png',
    },
    number: 4,
    power: 50,
    value: 10,
    next: 'king',
    missionPoints: 5,
  },
  peasant: {
    key: 'peasant',
    japs: {
      name: 'Peasant',
      image: '/images/peasant.png',
    },
    romans: {
      name: 'Plebian',
      image: '/images/plebian.png',
    },
    number: 800,
    power: 10,
    value: 1,
    next: 'freeman',
  },
}
