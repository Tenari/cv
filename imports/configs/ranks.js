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
    japs: 'Shogun',
    romans: 'Imperator',
    number: 1,
    power: 100,
  },
  noble: {
    japs: 'Lord',
    romans: 'Senator',
    number: 2,
    power: 80,
  },
  freeman: {
    japs: 'Samurai',
    romans: 'Patrician',
    number: 4,
    power: 50,
  },
  peasant: {
    japs: 'Peasant',
    romans: 'Plebian',
    number: 8,
    power: 10,
  },
}
