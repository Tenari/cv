import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

export const Fights = new Mongo.Collection('fights');

// Deny all client-side updates since we will be using methods to manage this collection
Fights.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});

Fights.schema = new SimpleSchema({
  _id: { type: String, regEx: SimpleSchema.RegEx.Id },
  attackerId: { type: String, regEx: SimpleSchema.RegEx.Id },
  defenderId: { type: String, regEx: SimpleSchema.RegEx.Id },
  createdAt: {type: Number },
  round: {type: Number, defaultValue: 0},
  rounds: {type: [Object]},
  'rounds.$.round': {type: Number},
  'rounds.$.defenderHit': {type: Boolean},
  'rounds.$.defenderDealt': {type: Number},
  'rounds.$.attackerHit': {type: Boolean},
  'rounds.$.attackerDealt': {type: Number},
  attackerStyle: {type: String},
  defenderStyle: {type: String},
});

Fights.attachSchema(Fights.schema);

// This represents the keys from Fights objects that should be published
// to the client. If we add secret properties to Character objects, don't list
// them here to keep them private to the server.
Fights.publicFields = {
  attackerId: 1,
  defenderId: 1,
  createdAt: 1,
  round: 1,
  rounds: 1,
  attackerStyle: 1,
  defenderStyle: 1,
};

