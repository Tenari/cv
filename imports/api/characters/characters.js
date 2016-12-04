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
  hands: {type: Number, defaultValue: 1, decimal: true},
  handsBase: {type: Number, defaultValue: 1, decimal: true},
  smallBlade: {type: Number, defaultValue: 1, decimal: true},
  smallBladeBase: {type: Number, defaultValue: 1, decimal: true},
  largeBlade: {type: Number, defaultValue: 1, decimal: true},
  largeBladeBase: {type: Number, defaultValue: 1, decimal: true},
  axe: {type: Number, defaultValue: 1, decimal: true},
  axeBase: {type: Number, defaultValue: 1, decimal: true},
});

const ResourcesSchema = new SimpleSchema({
  wood: {type: Number, defaultValue: 0},
  hide: {type: Number, defaultValue: 0},
  leather: {type: Number, defaultValue: 0},
  ore: {type: Number, defaultValue: 0},
  metal: {type: Number, defaultValue: 0},
});

const CollectingSchema = new SimpleSchema({
  wood: {type: Number, defaultValue: 1, decimal: true},
  woodBase: {type: Number, defaultValue: 1, decimal: true},
  hide: {type: Number, defaultValue: 1, decimal: true},
  hideBase: {type: Number, defaultValue: 1, decimal: true},
  leather: {type: Number, defaultValue: 1, decimal: true},
  leatherBase: {type: Number, defaultValue: 1, decimal: true},
  ore: {type: Number, defaultValue: 1, decimal: true},
  oreBase: {type: Number, defaultValue: 1, decimal: true},
  metal: {type: Number, defaultValue: 1, decimal: true},
  metalBase: {type: Number, defaultValue: 1, decimal: true},
});

const StatsSchema = new SimpleSchema({
  hp: {
    type: Number, 
    // this fucntion will overwrite the value of the hp to never be more than the baseHp of the same document
    autoValue: function(){
      //default to 30
      if (!this.isSet && this.isInsert) {
        return 30;
      }
      const doc = Characters.findOne(this.docId);
      if (!doc) return undefined;

      if (this.isSet && doc.stats.baseHp && this.operator == '$set' && this.value > doc.stats.baseHp) {
        return doc.stats.baseHp;
      }
      if (this.isSet && doc.stats.baseHp && this.operator == '$inc') {
        if (doc.stats.hp + this.value > doc.stats.baseHp) {
          return this.value - ((doc.stats.hp + this.value) - doc.stats.baseHp);
        }
      }
    }
  },
  baseHp: {type: Number, defaultValue: 30},
  strength: {type: Number, defaultValue: 1, decimal: true},
  baseStrength: {type: Number, defaultValue: 1, decimal: true},
  accuracy: {type: Number, defaultValue: 1, decimal: true},
  baseAccuracy: {type: Number, defaultValue: 1, decimal: true},
  agility: {type: Number, defaultValue: 1, decimal: true},
  baseAgility: {type: Number, defaultValue: 1, decimal: true},
  toughness: {type: Number, defaultValue: 1, decimal: true},
  baseToughness: {type: Number, defaultValue: 1, decimal: true},
  weapon: {type: WeaponStatsSchema},
  resources: { type: ResourcesSchema },
  collecting: { type: CollectingSchema },
  energy: {type: Number, decimal: true, autoValue: function(){
    // this fucntion will overwrite the value of the energy to never be more than the baseEnergy of the same document
    //default to 10000
    if (!this.isSet && this.isInsert) {
      return 10000;
    }
    const doc = Characters.findOne(this.docId);
    if (!doc) return undefined;

    if (this.isSet && doc.stats.baseEnergy && this.operator == '$set' && this.value > doc.stats.baseEnergy) {
      return doc.stats.baseEnergy;
    }
    if (this.isSet && doc.stats.baseEnergy && this.operator == '$inc') {
      if (doc.stats.energy + this.value > doc.stats.baseEnergy) {
        return this.value - ((doc.stats.energy + this.value) - doc.stats.baseEnergy);
      }
    }
  }},
  baseEnergy: {type: Number, defaultValue: 10000},
  endurance: {type: Number, defaultValue: 1, decimal: true},
  money: {type: Number, defaultValue: 100},
});

const DeathsSchema = new SimpleSchema({
  recentlyDead: {type: Boolean, defaultValue: false},
  diedAt: {type: Number, optional: true},// initally doesn't exist
  count: {type: Number, defaultValue: 0}
});

Characters.schema = new SimpleSchema({
  _id: { type: String, regEx: SimpleSchema.RegEx.Id },
  name: { type: String },
  team: {type: String},
  gameId: { type: String, regEx: SimpleSchema.RegEx.Id },
  userId: { type: String, regEx: SimpleSchema.RegEx.Id, optional: true },
  location: {type: LocationSchema},
  stats: {type: StatsSchema},
  defaultAttackStyle: {type: String, defaultValue: 'quick'},
  deaths: { type: DeathsSchema },
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
  deaths: 1,
};
