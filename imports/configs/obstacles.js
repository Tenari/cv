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
  door: {
    key: 'door',
    passable: true,
    imageClass: 'i-door',
    isDoor: true,
  },
  mat: {
    key: 'mat',
    passable: true,
    imageClass: 'i-mat',
    isDoor: true,
  },
  workbench: {
    key: 'workbench',
    passable: false,
    imageClass: 'obstacle-2x1 i-workbench',
    width: 2,
    //"use":{"name":"Wood-working bench","type":"craft","params":{"resource":"wood"}}
  },
};

export function importRoomObstaclesAndBuildings(roomDefinition, roomId, gameId, Obstacles, Rooms, Buildings){
  _.each(roomDefinition.doors, function(door){
    Obstacles.insert({
      location: {
        roomId: roomId,
        x: door.location.x,
        y: door.location.y,
      },
      type: door.type,
      data: {
        id: door.data.id || Rooms.findOne({name: door.data.name, gameId: gameId})._id,
        x: door.data.x,
        y: door.data.y,
        lock: door.data.lock,
        stats: door.data.stats,
        buildingResources: door.data.buildingResources,
      },
    })
  })
  _.each(roomDefinition.generics, function(obstacle){
    Obstacles.insert({
      location: {
        roomId: roomId,
        x: obstacle.location.x,
        y: obstacle.location.y,
      },
      type: obstacle.type,
      data: obstacle.data,
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
