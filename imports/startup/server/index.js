import { Meteor } from 'meteor/meteor';
import { EJSON } from 'meteor/ejson';
import { Rooms } from '../../api/rooms/rooms.js';
import { Games } from '../../api/games/games.js';
import { Characters } from '../../api/characters/characters.js';

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

Meteor.startup(function (){
  var game = Games.findOne();
  if ( !game ) { // ensure that there is one game with some rooms always
    var gameId = Games.insert({createdAt: Date.now(), startedAt: Date.now()});
    var rome = EJSON.parse(Assets.getText('rome.json'))  ;
    var tokyo = EJSON.parse(Assets.getText('tokyo.json'))  ;
    rome.gameId = gameId;
    tokyo.gameId = gameId;
    Rooms.upsert({name : "rome"}, { $set : rome});
    Rooms.upsert({name : "tokyo"}, { $set : tokyo});
  }

});
