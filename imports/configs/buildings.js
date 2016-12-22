import { resourceConfig } from './game.js';
import { tiles } from './locations.js';

export const buildingConfig = {
  open: {
    key: 'open',
    label: 'Empty land',
    image: '/images/buy-parcel.png',
    cost: [],
    energyCost: 1000,
    description: 'Can be built up into a functioning building, or sold as is.',
    getTileTypes: function(dimensions, x, y) {
      var tileTypes = [
        ['fence-top-left-corner','fence-horizontal','fence-top-right-corner'],
        ['fence-vertical','grass','fence-vertical'],
        ['fence-bottom-left-corner','fence-sign','fence-bottom-right-corner'],
      ];
      const relativeX = x - dimensions.topLeft.x;
      const relativeY = y - dimensions.topLeft.y;
      return tileTypes[relativeY][relativeX];
    },
  },
  workshop: {
    key: 'workshop',
    label: 'Wood workshop',
    image: '/images/workbench-left.png',
    cost: [{resource: resourceConfig.wood.key, amount: 10}],//, {resource: resourceConfig.metal.key, amount: 5}],
    description: 'Lets you build wooden items, and store resources and items. You can enable building trade if you hire a shopkeeper.',
    getTileTypes: function(dimensions, x, y) {
      var tileTypes = [
        ['full-building-wall','full-building-wall','H'],
        ['full-building-wall','full-building-wall','H'],
        ['1','door','2'],
      ];
      const relativeX = x - dimensions.topLeft.x;
      const relativeY = y - dimensions.topLeft.y;
      return tileTypes[relativeY][relativeX];
    },
    interior: function(gameId, name, entrance){
      return {
        gameId: gameId,
        name: name,
        width: 6,
        height: 6,
        map:[
          [tiles.floor,tiles.floor,tiles.floor,tiles.floor,tiles.floor,tiles.floor],
          [tiles.floor,tiles.floor,tiles.floor,tiles['workbench-left'],tiles["workbench-right"],tiles.floor],
          [tiles.floor,tiles.floor,tiles.floor,tiles.floor,tiles.floor,tiles.floor],
          [tiles.floor,tiles.floor,tiles.floor,tiles.floor,tiles.floor,tiles.floor],
          [tiles.floor,tiles.floor,tiles.floor,tiles.floor,tiles.floor,tiles.floor],
          [tiles.floor,tiles.floor,{type: "mat", data: entrance},{type: "mat", data: entrance},tiles.floor,tiles.floor]
        ] 
      };
    },
    entry: {x: 2, y: 4},
  },
//    smithy: 2,
//    farm: 3,
//    tannery: 4,
};
