import { Meteor } from 'meteor/meteor';
import { EJSON } from 'meteor/ejson';

import { importRoomObstaclesAndBuildings } from './obstacles.js';

export function generateNewTutorial(Games, Rooms, Obstacles, Buildings, Chats, Characters, Items) {
  var roomList = ['move-tutorial', 'talk-tutorial', 'resources-tutorial', 'team-tutorial'];
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
    'talk-tutorial': [{content: 'Go stand on top of the NPC (non-player character), and buy a sword from him.', sender: 'Tutorial'}],
    'resources-tutorial': [{content: 'Face the tree to chop it down', sender: 'Tutorial'}],
    'team-tutorial': [{content: 'This game is all about teamwork. Explore the "Team" page, and accept a mission.', sender: 'Tutorial'}],
  };
  var roomSetup = {};
  var roomIds = {};
  _.each(roomList, function(roomName){
    roomSetup[roomName] = EJSON.parse(Assets.getText(roomName+'.json'));
    roomSetup[roomName].room.gameId = gameId;
    roomSetup[roomName].room.name = roomName;

    roomIds[roomName] = Rooms.insert(roomSetup[roomName].room);
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

  Characters.insert({
    gameId: gameId,
    name: 'Marco Polo',
    team: 'romans',
    location: {
      x: 1,
      y: 3, 
      direction: 3,
      classId: 25,
      roomId: roomIds['team-tutorial'],
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

export function openSquirrel(character, Rooms, Obstacles, Chats){
  Chats.update({scope: "Rooms:"+character.location.roomId}, {$push: {messages: {content: 'You\'ll want to equip your sword before you fight the squirrel. Click "Stats" in the top menu, then "Items", then click the sword, and select "EQUIP"', sender: 'Tutorial'}}});
  const room = Rooms.findOne(character.location.roomId);
  Obstacles.remove({'location.x':6, 'location.y':2, 'location.roomId':room._id});
}

export function craftedItem(character, Obstacles, Chats, Rooms){
  const data = {
    id: Rooms.findOne({name: 'team-tutorial', gameId: character.gameId})._id,
    x: 0,
    y: 0,
  };
  Obstacles.insert({
    type: 'mat',
    location: {
      roomId: character.location.roomId,
      x: 2,
      y: 12,
    },
    data: data,
  });
  Obstacles.insert({
    type: 'mat',
    location: {
      roomId: character.location.roomId,
      x: 3,
      y: 12,
    },
    data: data,
  });
  Chats.update({scope: "Rooms:"+character.location.roomId}, {$push:{messages: {content: "Congrats, you may now move to the final stage.", sender: "Tutorial"}}});
}

export function finishTutorial(character, Characters, Rooms, Obstacles, Notifications){
  const gameId = character.gameId;
  const newRoom = Rooms.findOne({name: 'full-rome'});
  Characters.update(character._id, {$set: {gameId: newRoom.gameId, 'location.x': 60, 'location.y':50, 'location.roomId': newRoom._id}});
  Characters.remove({gameId: gameId});
  Rooms.find({gameId: gameId}).forEach(function(room){
    Obstacles.remove({'location.roomId': room._id});
  })
  Rooms.remove({gameId: gameId});

  Notifications.insert({title: 'Congratulations', message: 'You finished the tutorial! If you still need help, read the manual.', characterId: character._id});
}
