import { Meteor } from 'meteor/meteor';
import { EJSON } from 'meteor/ejson';
import { Rooms } from '../../api/rooms/rooms.js';
import { Games } from '../../api/games/games.js';

import './gameLoop.js';

import  '../../api/games/publications.js';
import  '../../api/rooms/publications.js';
import  '../../api/characters/methods.js';
import  '../../api/characters/publications.js';
import  '../../api/fights/methods.js';
import  '../../api/fights/publications.js';

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
