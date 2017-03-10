export const obstaclesConfig = {
  tree: {
    key: 'tree',
    passable: false,
    image: '/images/oaktree1.png',
    imageClass: 'i-oaktree1',
    insertEmptyVersion: function(obstacle, Obstacles){
      Obstacles.insert({
        location: obstacle.location,
        type: 'treeStump',
        data: {},
      })
    },
    resourceSource: "Tree",
    resourceCollectionVerb: "Chop",
    defaultData: {
      resources:{type:"wood",amount:10}
    },
  },
  tree2: {
    key: 'tree2',
    passable: false,
    image: '/images/oaktree2.png',
    imageClass: 'i-oaktree2',
    insertEmptyVersion: function(obstacle, Obstacles){
      Obstacles.insert({
        location: obstacle.location,
        type: 'treeStump2',
        data: {},
      })
    },
    resourceSource: "Tree",
    resourceCollectionVerb: "Chop",
    defaultData: {
      resources:{type:"wood",amount:10}
    },
  },
  tree3: {
    key: 'tree3',
    passable: false,
    image: '/images/oaktree3.png',
    imageClass: 'i-oaktree3',
    insertEmptyVersion: function(obstacle, Obstacles){
      Obstacles.insert({
        location: obstacle.location,
        type: 'treeStump3',
        data: {},
      })
    },
    resourceSource: "Tree",
    resourceCollectionVerb: "Chop",
    defaultData: {
      resources:{type:"wood",amount:10}
    },
  },
  treeStump: {
    key: 'treeStump',
    passable: true,
    moveCost: 6,
    image: '/images/oaktree1cut.png',
    imageClass: 'i-oaktree1cut',
  },
  treeStump2: {
    key: 'treeStump2',
    passable: true,
    moveCost: 6,
    image: '/images/oaktree2cut.png',
    imageClass: 'i-oaktree2cut',
  },
  treeStump3: {
    key: 'treeStump3',
    passable: true,
    moveCost: 6,
    image: '/images/oaktree3cut.png',
    imageClass: 'i-oaktree3cut',
  },
  ore: {
    key: 'ore',
    passable: false,
    image: '/images/ore.png',
    imageClass: 'i-ore',
    insertEmptyVersion: function(obstacle, Obstacles){
      // no empty version, it just goes away
    },
    resourceSource: "Stone",
    resourceCollectionVerb: "Mine",
    defaultData: {
      resources:{type:"ore",amount:20}
    },
  },
  bearDead: {
    key: 'bearDead',
    passable: true,
    moveCost: 2,
    image: '/images/dead-squirrel.png',
    imageClass: 'i-dead-squirrel',
    insertEmptyVersion: function(obstacle, Obstacles){
      // no empty version, it just goes away
    },
    resourceSource: "Fresh kill",
    resourceCollectionVerb: "Harvest",
    defaultData: {
      resources:{type:"hide",amount:5}
    },
  },
  squirrelDead: {
    key: 'squirrelDead',
    passable: true,
    moveCost: 2,
    image: '/images/dead-squirrel.png',
    imageClass: 'i-dead-squirrel',
    insertEmptyVersion: function(obstacle, Obstacles){
      // no empty version, it just goes away
    },
    resourceSource: "Fresh kill",
    resourceCollectionVerb: "Harvest",
    defaultData: {
      resources:{type:"hide",amount:2}
    },
  },
  foxDead: {
    key: 'foxDead',
    passable: true,
    moveCost: 2,
    image: '/images/dead-squirrel.png',
    imageClass: 'i-dead-squirrel',
    insertEmptyVersion: function(obstacle, Obstacles){
      // no empty version, it just goes away
    },
    resourceSource: "Fresh kill",
    resourceCollectionVerb: "Harvest",
    defaultData: {
      resources:{type:"hide",amount:3}
    },
  },
  wolfDead: {
    key: 'wolfDead',
    passable: true,
    moveCost: 2,
    image: '/images/dead-squirrel.png',
    imageClass: 'i-dead-squirrel',
    insertEmptyVersion: function(obstacle, Obstacles){
      // no empty version, it just goes away
    },
    resourceSource: "Fresh kill",
    resourceCollectionVerb: "Harvest",
    defaultData: {
      resources:{type:"hide",amount:4}
    },
  },
  fountain: {
    key: 'fountain',
    passable: false,
    imageClass: 'i-fountain',
  },
  barrel: {
    key: 'barrel',
    passable: false,
    imageClass: 'i-barrel',
  },
  stool: {
    key: 'stool',
    passable: true,
    imageClass: 'i-stool',
    moveCost: 1,
  },
  woodenBar: {
    key: 'woodenBar',
    passable: false,
    imageClass: 'obstacle-3x1 i-wooden-bar1',
    width: 3,
  },
  door: {
    key: 'door',
    passable: true,
    imageClass: 'i-door',
    isDoor: true,
    defaultData: {name: "roomname", x:0, y: 0},
  },
  mat: {
    key: 'mat',
    passable: true,
    imageClass: 'i-mat',
    isDoor: true,
    defaultData: {name: "roomname", x:0, y: 0},
  },
  bed: {
    key: 'bed',
    passable: false,
    imageClass: 'obstacle-2x1 i-bed',
    width: 2,
    defaultData:{use:{name:"Wood-working bench",type:"craft",params:{resource:"wood"}}},
  },
  workbench: {
    key: 'workbench',
    passable: false,
    imageClass: 'obstacle-2x1 i-workbench',
    width: 2,
    defaultData:{use:{name:"Bed",type:"sleep"}},
  },
  anvil: {
    key: 'anvil',
    passable: false,
    imageClass: 'i-anvil',
    defaultData:{use:{name:"Anvil",type:"craft",params:{resource:"metal"}}},
  },
  bloomery: {
    key: 'bloomery',
    passable: false,
    imageClass: 'i-bloomery',
    defaultData:{use:{name:"Bloomery",type:"forge",params:{resource:"ore"}}},
  },
  tanningRack: {
    key: 'tanningRack',
    passable: false,
    imageClass: 'i-tanning-rack',
    defaultData:{use:{name:"Tanning rack",type:"forge",params:{resource:"hide"}}},
  },
  verticalWall: {
    key: 'verticalWall',
    passable: false,
    imageClass: 'i-vt-fence',
  },
  horizontalWall: {
    key: 'horizontalWall',
    passable: false,
    imageClass: 'i-hz-fence',
  },
};

export function importRoomObstaclesAndBuildings(roomDefinition, roomId, gameId, Obstacles, Rooms, Buildings){
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
      buildingObject.createRoom(gameId);
    }
  })
}
