import { resourceConfig } from './game.js';

export const buildingConfig = {
  open: {
    key: 'open',
    label: 'Empty land',
    image: '/images/buy-parcel.png',
    cost: [],
    description: 'Can be built up into a functioning building, or sold as is.',
  },
  workshop: {
    key: 'workshop',
    label: 'Wood workshop',
    image: '/images/workbench-left.png',
    cost: [{resource: resourceConfig.wood.key, amount: 10}],//, {resource: resourceConfig.metal.key, amount: 5}],
    description: 'Lets you build wooden items, and store resources and items. You can enable building trade if you hire a shopkeeper.',
    getTileTypes: function(dimensions, x, y) {
      var tiles = [
        ['full-building-wall','full-building-wall','H'],
        ['full-building-wall','full-building-wall','H'],
        ['1','door','2'],
      ];
      const relativeX = x - dimensions.topLeft.x;
      const relativeY = y - dimensions.topLeft.y;
      return tiles[relativeY][relativeX];
    }
  },
//    smithy: 2,
//    farm: 3,
//    tannery: 4,
};

export const doorConfig = {
  lockTypes: {
    none: 'none',
    team: 'team',
    all: 'all',
  }
};
