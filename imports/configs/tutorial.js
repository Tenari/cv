import { importRoomObstaclesAndBuildings } from './obstacles.js';

export function generateNewTutorial(Games, Rooms, Obstacles, Buildings, Chats) {
  var roomList = ['move-tutorial', 'talk-tutorial', 'resources-tutorial'];
  var gameId = Games.insert({
    createdAt: Date.now(),
    startedAt: Date.now(),
    romans: {
      score: 0,
      key: 'romans',
      name: 'The Roman Empire',
      kills: 0,
      kingMessage: 'no king message yet',
    },
    japs: {
      score: 0,
      key: 'japs',
      name: 'Land of the Rising Sun',
      kills: 0,
    },
    rooms: roomList,
    name: 'The tutorial',
    tutorial: true,
  });

  var roomSetup = {};
  var roomIds = {};
  _.each(roomList, function(roomName){
    roomSetup[roomName] = EJSON.parse(Assets.getText(roomName+'.json'));
    roomSetup[roomName].room.gameId = gameId;
    roomSetup[roomName].room.name = roomName;

    roomIds[roomName] = Rooms.upsert({name : roomName}, { $set : roomSetup[roomName].room}).insertedId;
  })
  // these must be separate loops b/c importRoomObstaclesAndBuildings relies on the rooms ALL being created to work. (doors)
  _.each(roomList, function(roomName){
    importRoomObstaclesAndBuildings(roomSetup[roomName], roomIds[roomName], gameId, Obstacles, Rooms, Buildings);
    Chats.insert({scope: "Rooms:"+roomIds[roomName], messages: []});
  })

  Chats.insert({scope: "team:japs:"+gameId, messages: []});
  Chats.insert({scope: "team:romans:"+gameId, messages: []});

  /*
  const bigRomeId = roomIds['full-rome'];
  // insert NPCs
  const marcoPoloId = Characters.insert({
    gameId: gameId,
    name: 'Marco Polo',
    team: 'romans',
    location: {
      x: 3,
      y: 5, 
      direction: 1,
      classId: 25,
      roomId: bigRomeId,
      updatedAt: Date.now(),
    },
    npc: true,
    npcKey: 'marcoPolo',
    stats: {
      money: 10000,
      resources: {
        metal: 5,
      }
    }
  })
  Items.insert({key: 'rustySword', type: 'weapon', ownerId: marcoPoloId, condition: 100});
  Items.insert({key: 'rustySword', type: 'weapon', ownerId: marcoPoloId, condition: 100});

  const maguffinLocation = {
    x: 8,
    y: 6,
    roomId: bigRomeId,
    updatedAt: Date.now()
  };
  Items.insert({key: 'maguffin', type: 'misc', location: maguffinLocation});
  */
  return roomIds['move-tutorial'];
}
