// an Effect is a bonus (or curse) that lingers for a period of time
//   often used to buff a character's stats for a short period

import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

export const Effects = new Mongo.Collection('effects');

// Deny all client-side updates since we will be using methods to manage this collection
Effects.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});

Effects.schema = new SimpleSchema({
  _id: { type: String, regEx: SimpleSchema.RegEx.Id },
  statPath: {type: String}, //eg: 'weapon.axe'
  amount: {type: Number, decimal: true},
  characterId: { type: String, regEx: SimpleSchema.RegEx.Id},
  expiresAt: {type: Number, optional: true}, // timestamp for when this effect wears off
});

Effects.attachSchema(Effects.schema);

// This represents the keys from Effects objects that should be published
// to the client. If we add secret properties to Item objects, don't list
// them here to keep them private to the server.
Effects.publicFields = {
  statPath: 1,
  amount: 1,
  characterId: 1,
  expiresAt: 1,
};

Effects.helpers({
  expired() {
    return Date.now() > this.expiresAt;
  },
})
