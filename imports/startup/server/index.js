import { Meteor } from 'meteor/meteor';
import { EJSON } from 'meteor/ejson';
import { Rooms } from '../../api/rooms/rooms.js';
import { Games } from '../../api/games/games.js';
import { Chats } from '../../api/chats/chats.js';
import { Characters } from '../../api/characters/characters.js';
import { Buildings } from '../../api/buildings/buildings.js';
import { Items } from '../../api/items/items.js';
import { Notifications } from '../../api/notifications/notifications.js';

import './gameLoop.js';

import  '../../api/games/publications.js';
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
      },
      japs: {
        score: 0,
        key: 'japs',
        name: 'Land of the Rising Sun',
        kills: 0,
      },
    });
    var rome = EJSON.parse(Assets.getText('rome.json'))  ;
    var tokyo = EJSON.parse(Assets.getText('tokyo.json'))  ;
    var land = EJSON.parse(Assets.getText('land-sale.json'))  ;
    rome.gameId = gameId;
    tokyo.gameId = gameId;
    land.gameId = gameId;

    const romeId = Rooms.upsert({name : "rome"}, { $set : rome}).insertedId;
    const tokyoId = Rooms.upsert({name : "tokyo"}, { $set : tokyo}).insertedId;
    const landId = Rooms.upsert({name : "land-sale"}, { $set : land}).insertedId;

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
