import { Mongo } from 'meteor/mongo';

import { Characters } from '../characters/characters.js';
import { Rooms } from '../rooms/rooms.js';
import { Obstacles } from '../obstacles/obstacles.js';
import { Chats } from '../chats/chats.js';

import { buildingConfig } from '../../configs/buildings.js';
import { teamConfigs } from '../../configs/ranks.js';
import { importRoomObstaclesAndBuildings } from '../../configs/obstacles.js';

export const Buildings = new Mongo.Collection('buildings');

/*
{
  ownerId: characterIdStr,
  roomId: '',
  topLeft: {
    x: 1,
    y: 2
  },
  bottomRight: {
    x: 2,
    y: 3
  },
  type: ENUM,
  underConstruction: Boolean,
  resources: {
    wood: 0,
    hide: 0,
    leather: 0,
    ore: 0,
    metal: 0,
  },
  level: Number,
  settings: {
    door: {
      lock: {
        type: ENUM ('team', 'all'),
        team: optional ENUM team code,
      }
    },
    trade: {
      buy: {
        wood: Number (price)
        etc...
      },
      sell: {
        wood: Number (price)
        etc...
      },
      max: {
        wood: Number (price)
        etc...
      },
      min: {
        wood: Number (price)
        etc...
      }
    }
  }
}
*/

// Deny all client-side updates since we will be using methods to manage this collection
Buildings.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});

// This represents the keys from Rooms objects that should be published
// to the client. If we add secret properties to Room objects, don't list
// them here to keep them private to the server.
Buildings.publicFields = {
  ownerId: 1,
};

Buildings.helpers({
  character() {
    return Characters.findOne(this.ownerId);
  },
  dimensions() {
    return {
      x: this.bottomRight.x - this.topLeft.x,
      y: this.bottomRight.y - this.topLeft.x
    };
  },
  capacity() {
    return this.level * 100;
  },
  roomName() {
    return Rooms.findOne(this.location.roomId).name;
  },
  image() {
    return buildingConfig[this.type].image;
  },
  typeLabel() {
    return buildingConfig[this.type].label;
  },
  canStartBuilding() {
    return this.type == buildingConfig.open.key;
  },
  typeObj() {
    return buildingConfig[this.type];
  },
  doorLockTeam(team) {
    return this.data && this.data.lock && this.data.lock.team == team;
  },
  doorLockType(type) {
    return this.data && this.data.lock && this.data.lock.type == type;
  },
  imageClass(){
    if (this.underConstruction)
      return buildingConfig[this.type].underConstructionImageClass;
    return buildingConfig[this.type].imageClass;
  },
  height(){
    return buildingConfig[this.type].height || 3;
  },
  width(){
    return buildingConfig[this.type].width || 3;
  },
  locations(){
    var locations = [];
    for (var i = 0; i < this.width(); i++) {
      for (var j = 0; j < this.height(); j++) {
        locations.push({x: this.location.x+i, y: this.location.y+j});
      }
    }
    return locations;
  },
  isDoor(xy){
    const loc = buildingConfig[this.type].doorLocation;
    return loc && loc.x + this.location.x == xy.x && loc.y + this.location.y == xy.y;
  },
  useObject(){
    if (this.sale.available) {
      return {
        message:"Buy this parcel of land?",
        verb:"Buy",
        action:"rooms.buy",
        cost: this.sale.cost,
      };
    } else if (this.ownerId) {
      const owner = Characters.findOne(this.ownerId);
      return {message: "Owned by "+owner.name+" ("+teamConfigs[owner.team].name+")"}
    }
    return false;
  },
  createRoom(gameId){
    const newRoomName = this.type+":"+this._id;
    const interior = buildingConfig[this.type].interior(gameId, newRoomName, this)
    const newRoomId = Rooms.insert(interior.room);
    importRoomObstaclesAndBuildings(interior, newRoomId, gameId, Obstacles, Rooms, Buildings);
    // create the chat
    Chats.insert({scope: "Rooms:"+newRoomId, messages: []});
    // update the building
    Buildings.update(this._id, {$set: {interiorRoomId: newRoomId, underConstruction: false, data: {id: newRoomId, x: buildingConfig[this.type].insideLocation.x, y: buildingConfig[this.type].insideLocation.y}}});
  }
})
