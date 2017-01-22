import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { missionsConfig } from '../../configs/missions.js';

export const Missions = new Mongo.Collection('missions');

// Deny all client-side updates since we will be using methods to manage this collection
Missions.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});

const LocationSchema = new SimpleSchema({
  x: {type: Number},
  y: {type: Number},
  roomId: { type: String, regEx: SimpleSchema.RegEx.Id },
  updatedAt: { type: Number },
});

Missions.schema = new SimpleSchema({
  _id: { type: String, regEx: SimpleSchema.RegEx.Id },
  type: {type: String},
  rankPoints: {type: Number},
  creatorId: { type: String, regEx: SimpleSchema.RegEx.Id, optional: true }, // missions do not have this if they are auto-generated
  ownerId: { type: String, regEx: SimpleSchema.RegEx.Id, optional: true }, // missions do not have this if they have not been accepted
  conditions: {type: Object, blackbox: true}, // an object which specifies the details for the successful completion of the mission
  createdAt: {type: Number, optional: true}, // timestamp
});

Missions.attachSchema(Missions.schema);

// This represents the keys from Missions objects that should be published
// to the client. If we add secret properties to Missions objects, don't list
// them here to keep them private to the server.
Missions.publicFields = {
  type: 1,
  rankPoints: 1,
  creatorId: 1,
  ownerId: 1,
  conditions: 1,
};

Missions.helpers({
})
