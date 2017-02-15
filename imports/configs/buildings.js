import { resourceConfig } from './game.js';
import { tiles } from './locations.js';

export const buildingConfig = {
  open: {
    key: 'open',
    label: 'Empty land',
    image: '/images/buy-parcel.png',
    imageClass: 'obstacle-3x3 i-full-land-parcel',
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
  house: {
    key: 'house',
    label: 'House',
    imageClass: 'obstacle-3x3 i-house-big',
    underConstructionImageClass: 'obstacle-3x3 i-house-in-progress',
    cost: [{resource: resourceConfig.wood.key, amount: 10, has: 0}],
    description: 'A safe place to sleep at night, and store your junk',
    interior: function(gameId, name, building){
      const exit = {
        id: building.location.roomId,
        y: building.location.y + building.height(),
        x: building.location.x + 2,
      }
      return {
        room:{
          gameId: gameId,
          name: name,
          width: 6,
          height: 6,
          map:[
            [tiles.floor,tiles.floor,tiles.floor,tiles.floor,tiles.floor,tiles.floor],
            [tiles.floor,tiles.floor,tiles.floor,tiles.floor,tiles.floor,tiles.floor],
            [tiles.floor,tiles.floor,tiles.floor,tiles.floor,tiles.floor,tiles.floor],
            [tiles.floor,tiles.floor,tiles.floor,tiles.floor,tiles.floor,tiles.floor],
            [tiles.floor,tiles.floor,tiles.floor,tiles.floor,tiles.floor,tiles.floor],
            [tiles.floor,tiles.floor,tiles.floor,tiles.floor,tiles.floor,tiles.floor]
          ] 
        },
        doors: [{location:{x:5,y:5},data: exit,type:"mat"},{location:{x:4,y:5},data: exit,type:"mat"}],
        generics: [],
      };
    },
    doorLocation: {x: 2, y: 2}, //relative to the top left corner
    insideLocation: {x: 4, y: 4}, //relative to the top left corner
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
        ['building-front-wall','door','2'],
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
    doorLocation: {x: 1, y: 2}, //relative to the top left corner
    entry: {x: 2, y: 4},
  },
//    smithy: 2,
//    farm: 3,
//    tannery: 4,
};
