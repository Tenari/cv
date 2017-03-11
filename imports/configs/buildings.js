import { resourceConfig } from './game.js';
import { obstaclesConfig } from './obstacles.js';
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
        obstacles: [{location:{x:0,y:0},type:"bed",data: obstaclesConfig.bed.defaultData},{location:{x:5,y:5},data: exit,type:"mat"},{location:{x:4,y:5},data: exit,type:"mat"}],
      };
    },
    doorLocation: {x: 2, y: 2}, //relative to the top left corner
    insideLocation: {x: 4, y: 4}, //relative to the top left corner
  },
  bar: {
    key: 'bar',
    label: 'Bar',
    imageClass: 'obstacle-3x3 i-bar-big',
    underConstructionImageClass: 'obstacle-3x3 i-house-in-progress',
    cost: [{resource: resourceConfig.wood.key, amount: 10, has: 0}],
    description: 'A place to drink, make friends, and make enemies.',
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
        obstacles: [{location:{x:5,y:5},data: exit,type:"mat"},{location:{x:4,y:5},data: exit,type:"mat"},{type:"woodenBar",location:{x:0,y:1}},{type:"barrel",location:{x:5,y:0}},{type:"barrel",location:{x:5,y:1}},{type:"stool",location:{x:0,y:2}},{type:"stool",location:{x:2,y:2}}],
      };
    },
    doorLocation: {x: 2, y: 2}, //relative to the top left corner
    insideLocation: {x: 4, y: 4}, //relative to the top left corner
  },
  workshop: {
    key: 'workshop',
    label: 'Wood workshop',
    image: '/images/workbench-left.png',
    imageClass: 'obstacle-3x3 i-woodworkshop-big',
    underConstructionImageClass: 'obstacle-3x3 i-house-in-progress',
    cost: [{resource: resourceConfig.wood.key, amount: 10}],
    description: 'Lets you build wooden items, and store resources and items. You can enable building trade if you hire a shopkeeper.',
    interior: function(gameId, name, building){
      const exit = {
        id: building.location.roomId,
        y: building.location.y + building.height(),
        x: building.location.x + 2,
      }
      return {
        room: {
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
            [tiles.floor,tiles.floor,tiles.floor,tiles.floor,tiles.floor,tiles.floor],
          ] 
        },
        obstacles: [{location:{x:2,y:5},data: exit,type:"mat"},{location:{x:3,y:5},data: exit,type:"mat"},{type:'workbench',data:obstaclesConfig.workbench.defaultData,location:{x:3, y:1}}]
      };
    },
    doorLocation: {x: 1, y: 2}, //relative to the top left corner
    insideLocation: {x: 2, y: 4},
  },
//    smithy: 2,
//    farm: 3,
//    tannery: 4,
};
