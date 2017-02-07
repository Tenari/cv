import { Meteor } from 'meteor/meteor';
import { EJSON } from 'meteor/ejson';
import { Rooms } from '../../api/rooms/rooms.js';
import { Games } from '../../api/games/games.js';
import { Chats } from '../../api/chats/chats.js';
import { Characters } from '../../api/characters/characters.js';
import { Buildings } from '../../api/buildings/buildings.js';
import { Items } from '../../api/items/items.js';
import { Notifications } from '../../api/notifications/notifications.js';
import { Missions } from '../../api/missions/missions.js';
import { Obstacles } from '../../api/obstacles/obstacles.js';

import './gameLoop.js';

import  '../../api/games/publications.js';
import  '../../api/games/methods.js';
import  '../../api/rooms/publications.js';
import  '../../api/rooms/methods.js';
import  '../../api/characters/methods.js';
import  '../../api/characters/publications.js';
import  '../../api/items/publications.js';
import  '../../api/items/methods.js';
import  '../../api/fights/methods.js';
import  '../../api/fights/publications.js';
import  '../../api/trades/methods.js';
import  '../../api/trades/publications.js';
import  '../../api/chats/methods.js';
import  '../../api/chats/publications.js';
import  '../../api/buildings/publications.js';
import  '../../api/buildings/methods.js';
import  '../../api/notifications/publications.js';
import  '../../api/notifications/methods.js';
import  '../../api/missions/publications.js';
import  '../../api/missions/methods.js';

function importRoomObstacles(name, roomId, gameId){
  var roomDefinition = EJSON.parse(Assets.getText(name+'.json'));
  _.each(roomDefinition.doors, function(door){
    Obstacles.insert({
      location: {
        roomId: roomId,
        x: door.location.x,
        y: door.location.y,
      },
      type: door.type,
      data: {
        id: Rooms.findOne({name: door.data.name, gameId: gameId})._id,
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
}
Meteor.startup(function (){
  var game = Games.findOne();
  if ( !game ) { // ensure that there is one game with some rooms always
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
    });
    var rome = EJSON.parse(Assets.getText('rome.json')).room;
    var tokyo = EJSON.parse(Assets.getText('tokyo.json')).room;
    var land = EJSON.parse(Assets.getText('land-sale.json')).room;
    rome.gameId = gameId;
    tokyo.gameId = gameId;
    land.gameId = gameId;

    const romeId = Rooms.upsert({name : "rome"}, { $set : rome}).insertedId;
    const tokyoId = Rooms.upsert({name : "tokyo"}, { $set : tokyo}).insertedId;
    const landId = Rooms.upsert({name : "land-sale"}, { $set : land}).insertedId;

    importRoomObstacles('rome', romeId, gameId);
    importRoomObstacles('tokyo', tokyoId, gameId);
    importRoomObstacles('land-sale', landId, gameId);

    Chats.insert({scope: "Rooms:"+romeId, messages: []});
    Chats.insert({scope: "Rooms:"+tokyoId, messages: []});
    Chats.insert({scope: "Rooms:"+landId, messages: []});

    Chats.insert({scope: "team:japs", messages: []});
    Chats.insert({scope: "team:romans", messages: []});

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
        roomId: tokyoId,
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
      roomId: romeId,
      updatedAt: Date.now()
    };
    Items.insert({key: 'maguffin', type: 'misc', location: maguffinLocation});
  }

});
