import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

export const Characters = new Mongo.Collection('characters');

// Deny all client-side updates since we will be using methods to manage this collection
Characters.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});

const LocationSchema = new SimpleSchema({
  x: {type: Number},
  y: {type: Number},
  direction: {type: Number},
  classId: {type: Number},
  roomId: { type: String, regEx: SimpleSchema.RegEx.Id },
  updatedAt: { type: Number },
});

const WeaponStatsSchema = new SimpleSchema({
  hands: {type: Number, defaultValue: 1},
  baseHands: {type: Number, defaultValue: 1},
  smallBlade: {type: Number, defaultValue: 1},
  baseSmallBlade: {type: Number, defaultValue: 1},
  largeBlade: {type: Number, defaultValue: 1},
  baseLargeBlade: {type: Number, defaultValue: 1},
  axe: {type: Number, defaultValue: 1},
  baseAxe: {type: Number, defaultValue: 1},
});

const StatsSchema = new SimpleSchema({
  hp: {type: Number, defaultValue: 30},
  baseHp: {type: Number, defaultValue: 30},
  strength: {type: Number, defaultValue: 1},
  baseStrength: {type: Number, defaultValue: 1},
  accuracy: {type: Number, defaultValue: 1},
  baseAccuracy: {type: Number, defaultValue: 1},
  agility: {type: Number, defaultValue: 1},
  baseAgility: {type: Number, defaultValue: 1},
  toughness: {type: Number, defaultValue: 1},
  baseToughness: {type: Number, defaultValue: 1},
  weapon: {type: WeaponStatsSchema},
  energy: {type: Number, defaultValue: 10000},
  baseEnergy: {type: Number, defaultValue: 10000},
  endurance: {type: Number, defaultValue: 0},
  money: {type: Number, defaultValue: 100},
});

Characters.schema = new SimpleSchema({
  _id: { type: String, regEx: SimpleSchema.RegEx.Id },
  name: { type: String },
  team: {type: String},
  gameId: { type: String, regEx: SimpleSchema.RegEx.Id },
  userId: { type: String, regEx: SimpleSchema.RegEx.Id },
  location: {type: LocationSchema},
  stats: {type: StatsSchema},
  defaultAttackStyle: {type: String, defaultValue: 'quick'},
});

Characters.attachSchema(Characters.schema);

// This represents the keys from Characters objects that should be published
// to the client. If we add secret properties to Character objects, don't list
// them here to keep them private to the server.
Characters.publicFields = {
  name: 1,
  team: 1,
  gameId: 1,
  userId: 1,
  location: 1,
  stats: 1,
};
