import { Mongo } from 'meteor/mongo';

import { Characters } from '../characters/characters.js';
import { Rooms } from '../rooms/rooms.js';

import { obstaclesConfig } from '../../configs/obstacles.js';

export const Obstacles = new Mongo.Collection('obstacles');

const LocationSchema = new SimpleSchema({
  x: {type: Number},
  y: {type: Number},
  roomId: { type: String, regEx: SimpleSchema.RegEx.Id },
});

Obstacles.schema = new SimpleSchema({
  _id: { type: String, regEx: SimpleSchema.RegEx.Id },
  location: {type: LocationSchema},
  type: { type: String },
  data: { type: Object, blackbox: true }, // type-specific instance data
});

Obstacles.attachSchema(Obstacles.schema);

// Deny all client-side updates since we will be using methods to manage this collection
Obstacles.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});

// This represents the keys from Rooms objects that should be published
// to the client. If we add secret properties to Room objects, don't list
// them here to keep them private to the server.
Obstacles.publicFields = {
  location: 1,
  type: 1,
  data: 1,
};

Obstacles.helpers({
  image() {
    return obstaclesConfig[this.type].image;
  },
  imageClass() {
    return obstaclesConfig[this.type].imageClass;
  },
  passable(){
    return obstaclesConfig[this.type].passable;
  },
  roomName() {
    return Rooms.findOne(this.location.roomId).name;
  },
  typeObj() {
    return obstaclesConfig[this.type];
  },
  insertEmptyVersion(){
    return (typeof obstaclesConfig[this.type].insertEmptyVersion === 'function') && obstaclesConfig[this.type].insertEmptyVersion(this, Obstacles);
  }
})
