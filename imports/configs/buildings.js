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
    cost: [{resource: resourceConfig.wood.key, amount: 10}, {resource: resourceConfig.metal.key, amount: 5}],
    description: 'Lets you build wooden items, and store resources and items. You can enable building trade if you hire a shopkeeper.',
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
