import { Meteor } from 'meteor/meteor';
import { EJSON } from 'meteor/ejson';
import { Rooms } from '../../api/rooms/rooms.js';
import { Games } from '../../api/games/games.js';
import { Chats } from '../../api/chats/chats.js';
import { Characters } from '../../api/characters/characters.js';
import { Buildings } from '../../api/buildings/buildings.js';
import { Items } from '../../api/items/items.js';
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
import  '../../api/obstacles/methods.js';
import  '../../api/notifications/publications.js';
import  '../../api/notifications/methods.js';
import  '../../api/missions/publications.js';
import  '../../api/missions/methods.js';

import { importRoomObstaclesAndBuildings } from '../../configs/obstacles.js';
import { importRoomNpcs } from '../../configs/ai.js';

Meteor.startup(function (){
  var game = Games.findOne();
  if ( !game ) { // ensure that there is one game with some rooms always
    var roomList = ['rome', 'tokyo', 'land-sale', 'full-rome', 'east-roman-plains', 'north-east-roman-plains'];
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
      name: 'The quest for the macGuffin',
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
      importRoomNpcs(roomSetup[roomName], roomIds[roomName], gameId, Characters, Items);
      Chats.insert({scope: "Rooms:"+roomIds[roomName], messages: []});
    })

    Chats.insert({scope: "team:japs:"+gameId, messages: []});
    Chats.insert({scope: "team:romans:"+gameId, messages: []});

    const bigRomeId = roomIds['full-rome'];

    const maguffinLocation = {
      x: 8,
      y: 6,
      roomId: bigRomeId,
      updatedAt: Date.now()
    };
    Items.insert({key: 'maguffin', type: 'misc', location: maguffinLocation});
  }

});
