import { Meteor } from 'meteor/meteor';
import { EJSON } from 'meteor/ejson';
import { Rooms } from '../../api/rooms/rooms.js';
import { Games } from '../../api/games/games.js';
import { Chats } from '../../api/chats/chats.js';
import { Characters } from '../../api/characters/characters.js';
import { Buildings } from '../../api/buildings/buildings.js';

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

Meteor.startup(function (){
  var game = Games.findOne();
  if ( !game ) { // ensure that there is one game with some rooms always
    var gameId = Games.insert({createdAt: Date.now(), startedAt: Date.now()});
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

    // insert NPCs
    Characters.insert({
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
      npc: true
    })
  }

});
