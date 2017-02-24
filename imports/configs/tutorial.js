import { Meteor } from 'meteor/meteor';
import { EJSON } from 'meteor/ejson';

import { importRoomObstaclesAndBuildings } from './obstacles.js';

export function generateNewTutorial(Games, Rooms, Obstacles, Buildings, Chats, Characters, Items) {
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

  var preMessages = {
    'move-tutorial': [{content:'To move, press W, A, S, or D.', sender:'Tutorial'},{content:'Notice that your energy bar decreases as you move. If it gets to zero, you cannot move anymore until it regenerates.', sender:'Tutorial'}],
    'talk-tutorial': [{content: 'Go stand on top of the NPC (non-player character).', sender: 'Tutorial'},{content: 'Once you buy a sword from him, you will be able to fight the squirrel.', sender: 'Tutorial'}],
    'resources-tutorial': [{content: 'Face the tree to chop it down', sender: 'Tutorial'}],
  };
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
    Chats.insert({scope: "Rooms:"+roomIds[roomName], messages: preMessages[roomName]});
  })

  Chats.insert({scope: "team:japs:"+gameId, messages: []});
  Chats.insert({scope: "team:romans:"+gameId, messages: []});

  // insert NPCs
  const marcoPoloId = Characters.insert({
    gameId: gameId,
    name: 'Marco Polo',
    team: 'romans',
    location: {
      x: 3,
      y: 3, 
      direction: 1,
      classId: 25,
      roomId: roomIds['talk-tutorial'],
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
  /*
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

export function openSquirrel(character, Rooms, Obstacles){
  const room = Rooms.findOne(character.location.roomId);
  Obstacles.remove({'location.x':6, 'location.y':2, 'location.roomId':room._id});
}
