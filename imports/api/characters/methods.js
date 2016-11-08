import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';

import { Games } from '../games/games.js';
import { Rooms } from '../rooms/rooms.js';
import { Fights } from '../fights/fights.js';
import { Items } from '../items/items.js';
import { Characters } from './characters.js';

import { moveCost, teamCode, doors, movableSpots, equipSlots } from '../../configs/game.js';

Meteor.methods({
  'characters.insert'(obj) {
    if (!this.userId) {
      throw new Meteor.Error('todos.insert.accessDenied',
        'Gotta be logged in to create a character');
    }

    const character = Characters.findOne({userId: this.userId, 'stats.hp': {$gt: 0}});

    if (character) {
      throw new Meteor.Error('todos.insert.alreadyThere',
        'You already have a character, bro');
    }

    const room = Rooms.findOne({name: 'tokyo'});
    const location = {
      x: 3,
      y: 5,
      direction: 1,
      classId: obj.team == 'romans' ? 20 : 30,
      roomId: room._id,
      updatedAt: Date.now(),
    };

    obj.gameId = obj.gameId || Games.findOne({})._id;
    obj.userId = this.userId;
    obj.location = location;

    const id = Characters.insert(obj);
    Items.insert({ // everyon gets an item to start with
      name: 'Shitty sword',
      type: 'large blade',
      img: '/images/shitty-sword.png',
      weight: 10,
      equipped: false,
      equipSlot: equipSlots.hand,
      ownerId: id,
    });
    return obj.gameId; //return the gameId so the ui knows what url to go to
  },

  'characters.move'(directionInt) {
    var character = Characters.findOne({userId: this.userId, 'stats.hp':{$gt: 0}});
    var room = Rooms.findOne(character.location.roomId);
    var nextSpotChar, moveObject;
    directionInt = parseInt(directionInt);

    if( Date.now() <= character.location.updatedAt + 300)
      return false;
    if (Fights.find({$or: [{attackerId: character._id},{defenderId: character._id}]}).count() > 0)
      return false;

    switch(directionInt) {
      case 1:
        nextSpotChar = room.map[character.location.y-1] && room.map[character.location.y-1][character.location.x] ? room.map[character.location.y-1][character.location.x].type : "out of bounds";
        moveObject = {'location.y':-1};
        break;
      case 2:
        nextSpotChar = room.map[character.location.y+1] && room.map[character.location.y+1][character.location.x] ? room.map[character.location.y+1][character.location.x].type : "out of bounds";
        moveObject = {'location.y': 1};
        break;
      case 3:
        nextSpotChar = room.map[character.location.y] && room.map[character.location.y][character.location.x+1] ? room.map[character.location.y][character.location.x+1].type : "out of bounds";
        moveObject = {'location.x': 1};
        break;
      case 4:
      default:
        nextSpotChar = room.map[character.location.y] && room.map[character.location.y][character.location.x-1] ? room.map[character.location.y][character.location.x-1].type : "out of bounds";
        moveObject = {'location.x': -1};
        break;
    }

    var newEnergy = character.stats.energy - (moveCost[nextSpotChar] || 0);

    if (movableSpots[nextSpotChar] && character.location.direction == directionInt) {
      Characters.update(character._id, {
        $inc: moveObject, 
        $set: {'location.direction': directionInt, 'location.updatedAt': Date.now(), 'stats.energy': newEnergy}
      });
    } else if (doors[nextSpotChar] && character.location.direction == directionInt) {
      changeRoom(character, room, directionInt, newEnergy);
    } else {
      Characters.update(character._id, {
        $set: {'location.direction': directionInt, 'location.updatedAt': Date.now()} 
      });
    }
  },

  'characters.sawDeathNotification'(characterId) {
    console.log('setting recentlyDead to false due to method call');
    if (this.userId != Characters.findOne(characterId).userId) throw new Meteor.Error('characters.sawDeathNotification', 'not your character dude');
    Characters.update(characterId, {$set: {recentlyDead: false}});
  }
});


var changeRoom = function(user, room, dirInt, newEnergy){
  var spot;

  switch(dirInt) {
    case 1:
      spot = room.map[user.location.y-1] && room.map[user.location.y-1][user.location.x] ? room.map[user.location.y-1][user.location.x] : "out of bounds";
      break;
    case 2:
      spot = room.map[user.location.y+1] && room.map[user.location.y+1][user.location.x] ? room.map[user.location.y+1][user.location.x] : "out of bounds";
      break;
    case 3:
      spot = room.map[user.location.y] && room.map[user.location.y][user.location.x+1] ? room.map[user.location.y][user.location.x+1] : "out of bounds";
      break;
    case 4:
    default:
      spot = room.map[user.location.y] && room.map[user.location.y][user.location.x-1] ? room.map[user.location.y][user.location.x-1] : "out of bounds";
      break;
  }

  if (spot == "out of bounds")
    return;

  const roomId = Rooms.findOne({gameId: room.gameId, name: spot.data.name})._id;

  Characters.update(user._id, {
    $set: {
      'location.direction': dirInt, 
      'location.updatedAt': Date.now(),
      'location.roomId': roomId,
      'location.x': spot.data.x,
      'location.y': spot.data.y,
      'stats.energy': newEnergy,
    } 
  });
};
