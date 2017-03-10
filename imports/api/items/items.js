import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Notifications } from '../notifications/notifications.js';
import { itemConfigs, effectsDescription } from '../../configs/items.js';

export const Items = new Mongo.Collection('items');

// Deny all client-side updates since we will be using methods to manage this collection
Items.deny({
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

Items.schema = new SimpleSchema({
  _id: { type: String, regEx: SimpleSchema.RegEx.Id },
  key: {type: String}, // like 'rustySword' or 'woodenHelmet'
  type: {type: String}, // like 'weapon' or 'armor'
  equipped: {type: Boolean, defaultValue: false},
  ownerId: { type: String, regEx: SimpleSchema.RegEx.Id, optional: true }, // items do not have this if they are un-owned
  location: {type: LocationSchema, optional: true}, // items only have a location when they are not owned
  condition: {type: Number, optional: true}, //only wearables tend to have condition (0-100)
  usedAt: {type: Number, optional: true}, // marked the last timestamp that this was used at
  foundAt: {type: Number, optional: true}, // marked the first timestamp that this was found
});

Items.attachSchema(Items.schema);

// This represents the keys from Items objects that should be published
// to the client. If we add secret properties to Item objects, don't list
// them here to keep them private to the server.
Items.publicFields = {
  type: 1,
  key: 1,
  equipped: 1,
  ownerId: 1,
  location: 1,
  condition: 1,
};

Items.helpers({
  weight(){
    return itemConfigs[this.type][this.key].weight;
  },
  name(){
    return itemConfigs[this.type][this.key].name;
  },
  img() {
    return itemConfigs[this.type][this.key].img;
  },
  weaponType() {
    return itemConfigs[this.type][this.key].weaponType;
  },
  effects(){
    return itemConfigs[this.type][this.key].effects;
  },
  damageDealt(){
    return _.reduce(itemConfigs[this.type][this.key].effects, function(memo, effect){
      if (effect.type == 'damageDealt') return memo + effect.amount;
      return memo;
    }, 0);
  },
  damageTaken(){
    return _.reduce(itemConfigs[this.type][this.key].effects, function(memo, effect){
      if (effect.type == 'damageTaken') return memo + effect.amount;
      return memo;
    }, 0);
  },
  equipSlot(){
    return itemConfigs[this.type][this.key].equipSlot;
  },
  effectDescription(){
    return effectsDescription(this.effects());
  },
  lowerCondition(){
    if(this.condition) {
      this.condition -= 1;
      // condition at or below 0? item broke.
      if (this.condition <= 0) {
        Items.remove(this._id);
        Notifications.insert({title: 'Item broke!', message: "Your "+itemConfigs[this.type][this.key].name + " has worn out.", characterId: this.ownerId})
      } else {
        Items.update(this._id, {$set: {condition: this.condition}});
      }
    }
  },
})
