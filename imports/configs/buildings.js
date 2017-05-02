import { importRoomNpcs } from './ai.js';
import { resourceConfig } from './game.js';
import { obstaclesConfig } from './obstacles.js';

const floorTile = {type: "floor", imageClass:'i-floor'};
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
            [floorTile,floorTile,floorTile,floorTile,floorTile,floorTile],
            [floorTile,floorTile,floorTile,floorTile,floorTile,floorTile],
            [floorTile,floorTile,floorTile,floorTile,floorTile,floorTile],
            [floorTile,floorTile,floorTile,floorTile,floorTile,floorTile],
            [floorTile,floorTile,floorTile,floorTile,floorTile,floorTile],
            [floorTile,floorTile,floorTile,floorTile,floorTile,floorTile]
          ] 
        },
        obstacles: [{location:{x:0,y:0},type:"bed",data: obstaclesConfig.bed.defaultData},{location:{x:5,y:5},data: exit,type:"mat"},{location:{x:4,y:5},data: exit,type:"mat"}],
      };
    },
    doorLocation: {x: 2, y: 2}, //relative to the top left corner
    insideLocation: {x: 4, y: 4}, //relative to the top left corner
    npcs: [{type: 'genericRomanTownsPerson', location: {x:1, y:1}}],
  },
  japaneseHouse: {
    key: 'japaneseHouse',
    label: 'House',
    imageClass: 'obstacle-3x3 i-japanese-house-big',
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
            [floorTile,floorTile,floorTile,floorTile,floorTile,floorTile],
            [floorTile,floorTile,floorTile,floorTile,floorTile,floorTile],
            [floorTile,floorTile,floorTile,floorTile,floorTile,floorTile],
            [floorTile,floorTile,floorTile,floorTile,floorTile,floorTile],
            [floorTile,floorTile,floorTile,floorTile,floorTile,floorTile],
            [floorTile,floorTile,floorTile,floorTile,floorTile,floorTile]
          ] 
        },
        obstacles: [{location:{x:0,y:0},type:"bed",data: obstaclesConfig.bed.defaultData},{location:{x:5,y:5},data: exit,type:"mat"},{location:{x:4,y:5},data: exit,type:"mat"}],
      };
    },
    doorLocation: {x: 2, y: 2}, //relative to the top left corner
    insideLocation: {x: 4, y: 4}, //relative to the top left corner
    npcs: [{type: 'genericJapaneseTownsPerson', location: {x:1, y:1}}],
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
            [floorTile,floorTile,floorTile,floorTile,floorTile,floorTile],
            [floorTile,floorTile,floorTile,floorTile,floorTile,floorTile],
            [floorTile,floorTile,floorTile,floorTile,floorTile,floorTile],
            [floorTile,floorTile,floorTile,floorTile,floorTile,floorTile],
            [floorTile,floorTile,floorTile,floorTile,floorTile,floorTile],
            [floorTile,floorTile,floorTile,floorTile,floorTile,floorTile]
          ] 
        },
        obstacles: [{location:{x:5,y:5},data: exit,type:"mat"},{location:{x:4,y:5},data: exit,type:"mat"},{type:"woodenBar",location:{x:0,y:1}},{type:"barrel",location:{x:5,y:0}},{type:"barrel",location:{x:5,y:1}},{type:"stool",location:{x:0,y:2}},{type:"stool",location:{x:2,y:2}}],
      };
    },
    npcs: [{type: 'romanBartender', location: {x:0, y:0}}],
    doorLocation: {x: 2, y: 2}, //relative to the top left corner
    insideLocation: {x: 4, y: 4}, //relative to the top left corner
  },
  japaneseBar: {
    key: 'japaneseBar',
    label: 'Bar',
    imageClass: 'obstacle-3x3 i-japanese-bar-big',
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
            [floorTile,floorTile,floorTile,floorTile,floorTile,floorTile],
            [floorTile,floorTile,floorTile,floorTile,floorTile,floorTile],
            [floorTile,floorTile,floorTile,floorTile,floorTile,floorTile],
            [floorTile,floorTile,floorTile,floorTile,floorTile,floorTile],
            [floorTile,floorTile,floorTile,floorTile,floorTile,floorTile],
            [floorTile,floorTile,floorTile,floorTile,floorTile,floorTile]
          ] 
        },
        obstacles: [{location:{x:5,y:5},data: exit,type:"mat"},{location:{x:4,y:5},data: exit,type:"mat"},{type:"woodenBar",location:{x:0,y:1}},{type:"barrel",location:{x:5,y:0}},{type:"barrel",location:{x:5,y:1}},{type:"stool",location:{x:0,y:2}},{type:"stool",location:{x:2,y:2}}],
      };
    },
    npcs: [{type: 'japBartender', location: {x:0, y:0}}],
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
            [floorTile,floorTile,floorTile,floorTile,floorTile,floorTile],
            [floorTile,floorTile,floorTile,floorTile,floorTile,floorTile],
            [floorTile,floorTile,floorTile,floorTile,floorTile,floorTile],
            [floorTile,floorTile,floorTile,floorTile,floorTile,floorTile],
            [floorTile,floorTile,floorTile,floorTile,floorTile,floorTile],
            [floorTile,floorTile,floorTile,floorTile,floorTile,floorTile],
          ] 
        },
        obstacles: [{location:{x:2,y:5},data: exit,type:"mat"},{location:{x:3,y:5},data: exit,type:"mat"},{type:'workbench',data:obstaclesConfig.workbench.defaultData,location:{x:3, y:1}}]
      };
    },
    doorLocation: {x: 1, y: 2}, //relative to the top left corner
    insideLocation: {x: 2, y: 4},
  },
  japWorkshop: {
    key: 'japWorkshop',
    label: 'Wood workshop',
    image: '/images/workbench-left.png',
    imageClass: 'obstacle-3x3 i-jap-woodworkshop-big',
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
            [floorTile,floorTile,floorTile,floorTile,floorTile,floorTile],
            [floorTile,floorTile,floorTile,floorTile,floorTile,floorTile],
            [floorTile,floorTile,floorTile,floorTile,floorTile,floorTile],
            [floorTile,floorTile,floorTile,floorTile,floorTile,floorTile],
            [floorTile,floorTile,floorTile,floorTile,floorTile,floorTile],
            [floorTile,floorTile,floorTile,floorTile,floorTile,floorTile],
          ] 
        },
        obstacles: [{location:{x:2,y:5},data: exit,type:"mat"},{location:{x:3,y:5},data: exit,type:"mat"},{type:'workbench',data:obstaclesConfig.workbench.defaultData,location:{x:3, y:1}}]
      };
    },
    doorLocation: {x: 1, y: 2}, //relative to the top left corner
    insideLocation: {x: 2, y: 4},
  },
  farm: {
    key: 'farm',
    label: 'Farm',
    imageClass: 'obstacle-3x3 i-farm',
    underConstructionImageClass: 'obstacle-3x3 i-house-in-progress',
    cost: [{resource: resourceConfig.wood.key, amount: 15, has: 0}],
    description: 'A place to grow food.',
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
            [floorTile,floorTile,floorTile,floorTile,floorTile,floorTile],
            [floorTile,floorTile,floorTile,floorTile,floorTile,floorTile],
            [floorTile,floorTile,floorTile,floorTile,floorTile,floorTile],
            [floorTile,floorTile,floorTile,floorTile,floorTile,floorTile],
            [floorTile,floorTile,floorTile,floorTile,floorTile,floorTile],
            [floorTile,floorTile,floorTile,floorTile,floorTile,floorTile]
          ] 
        },
        obstacles: [{location:{x:0,y:0},type:"bed",data: obstaclesConfig.bed.defaultData},{location:{x:5,y:5},data: exit,type:"mat"},{location:{x:4,y:5},data: exit,type:"mat"}],
      };
    },
    doorLocation: {x: 2, y: 2}, //relative to the top left corner
    insideLocation: {x: 4, y: 4}, //relative to the top left corner
    npcs: [{type: 'romanFarmer', location: {x:1, y:1}}],
  },
  japFarm: {
    key: 'japFarm',
    label: 'Farm',
    imageClass: 'obstacle-3x3 i-jap-farm',
    underConstructionImageClass: 'obstacle-3x3 i-house-in-progress',
    cost: [{resource: resourceConfig.wood.key, amount: 15, has: 0}],
    description: 'A place to grow food.',
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
            [floorTile,floorTile,floorTile,floorTile,floorTile,floorTile],
            [floorTile,floorTile,floorTile,floorTile,floorTile,floorTile],
            [floorTile,floorTile,floorTile,floorTile,floorTile,floorTile],
            [floorTile,floorTile,floorTile,floorTile,floorTile,floorTile],
            [floorTile,floorTile,floorTile,floorTile,floorTile,floorTile],
            [floorTile,floorTile,floorTile,floorTile,floorTile,floorTile]
          ] 
        },
        obstacles: [{location:{x:0,y:0},type:"bed",data: obstaclesConfig.bed.defaultData},{location:{x:5,y:5},data: exit,type:"mat"},{location:{x:4,y:5},data: exit,type:"mat"}],
      };
    },
    doorLocation: {x: 2, y: 2}, //relative to the top left corner
    insideLocation: {x: 4, y: 4}, //relative to the top left corner
    npcs: [{type: 'japFarmer', location: {x:1, y:1}}],
  },
  smithy: {
    key: 'smithy',
    label: 'Smithy',
    imageClass: 'obstacle-3x3 i-smithy',
    underConstructionImageClass: 'obstacle-3x3 i-house-in-progress',
    cost: [{resource: resourceConfig.wood.key, amount: 15, has: 0}],
    description: 'A place to work metal.',
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
            [floorTile,floorTile,floorTile,floorTile,floorTile,floorTile],
            [floorTile,floorTile,floorTile,floorTile,floorTile,floorTile],
            [floorTile,floorTile,floorTile,floorTile,floorTile,floorTile],
            [floorTile,floorTile,floorTile,floorTile,floorTile,floorTile],
            [floorTile,floorTile,floorTile,floorTile,floorTile,floorTile],
            [floorTile,floorTile,floorTile,floorTile,floorTile,floorTile]
          ]
        },
        obstacles: [{location:{x:5,y:0},type:"barrel"},{location:{x:1,y:1},type:"anvil",data: obstaclesConfig.anvil.defaultData},{location:{x:5,y:5},data: exit,type:"mat"},{location:{x:4,y:5},data: exit,type:"mat"}],
      };
    },
    doorLocation: {x: 2, y: 2}, //relative to the top left corner
    insideLocation: {x: 4, y: 4}, //relative to the top left corner
    npcs: [{type: 'romanSmith', location: {x:3, y:1}}],
  },
  japSmithy: {
    key: 'japSmithy',
    label: 'Smithy',
    imageClass: 'obstacle-3x3 i-jap-smithy',
    underConstructionImageClass: 'obstacle-3x3 i-house-in-progress',
    cost: [{resource: resourceConfig.wood.key, amount: 15, has: 0}],
    description: 'A place to work metal.',
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
            [floorTile,floorTile,floorTile,floorTile,floorTile,floorTile],
            [floorTile,floorTile,floorTile,floorTile,floorTile,floorTile],
            [floorTile,floorTile,floorTile,floorTile,floorTile,floorTile],
            [floorTile,floorTile,floorTile,floorTile,floorTile,floorTile],
            [floorTile,floorTile,floorTile,floorTile,floorTile,floorTile],
            [floorTile,floorTile,floorTile,floorTile,floorTile,floorTile]
          ]
        },
        obstacles: [{location:{x:5,y:0},type:"barrel"},{location:{x:1,y:1},type:"anvil",data: obstaclesConfig.anvil.defaultData},{location:{x:5,y:5},data: exit,type:"mat"},{location:{x:4,y:5},data: exit,type:"mat"}],
      };
    },
    doorLocation: {x: 2, y: 2}, //relative to the top left corner
    insideLocation: {x: 4, y: 4}, //relative to the top left corner
    npcs: [{type: 'japSmith', location: {x:3, y:1}}],
  },
//    tannery: 4,
}

export function importRoomObstaclesAndBuildings(roomDefinition, roomId, gameId, Obstacles, Rooms, Buildings, Characters, Items){
  _.each(roomDefinition.obstacles, function(obstacle){
    let data = obstacle.data;
    if (obstaclesConfig[obstacle.type].isDoor) {
      data = {
        id: obstacle.data.id || Rooms.findOne({name: obstacle.data.name, gameId: gameId})._id,
        x: obstacle.data.x,
        y: obstacle.data.y,
        lock: obstacle.data.lock,
        stats: obstacle.data.stats,
        buildingResources: obstacle.data.buildingResources,
      };
    }
    Obstacles.insert({
      location: {
        roomId: roomId,
        x: obstacle.location.x,
        y: obstacle.location.y,
      },
      type: obstacle.type,
      data: data || {},
    })
  })
  _.each(roomDefinition.buildings, function(building){
    const bid = Buildings.insert({
      type: building.type,
      location: {
        roomId: roomId,
        x: building.location.x,
        y: building.location.y,
      },
      underConstruction: false,
      sale: building.sale,
      resources: {
        wood: 0,
        hide: 0,
        leather: 0,
        ore: 0,
        metal: 0,
      }
    })
    const buildingObject = Buildings.findOne(bid);
    if (typeof buildingObject.typeObj().interior === 'function') {
      const newRoomId = buildingObject.createRoom(gameId);
      if (!(buildingObject.ownerId && buildingObject.sale && buildingObject.sale > 0) && buildingConfig[building.type].npcs) {
        importRoomNpcs(buildingConfig[building.type], newRoomId, gameId, Characters, Items);
      }
    }
  })
};
