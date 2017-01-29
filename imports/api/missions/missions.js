import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Characters } from '../characters/characters.js';

import { missionsConfig } from '../../configs/missions.js';

export const Missions = new Mongo.Collection('missions');

// Deny all client-side updates since we will be using methods to manage this collection
Missions.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});

Missions.schema = new SimpleSchema({
  _id: { type: String, regEx: SimpleSchema.RegEx.Id },
  gameId: { type: String, regEx: SimpleSchema.RegEx.Id },
  type: {type: String},
  rankPoints: {type: Number},
  team: {type: String},
  creatorId: { type: String, regEx: SimpleSchema.RegEx.Id, optional: true }, // missions do not have this if they are auto-generated
  ownerId: { type: String, regEx: SimpleSchema.RegEx.Id, optional: true }, // missions do not have this if they have not been accepted
  conditions: {type: Object, blackbox: true}, // an object which specifies the details for the successful completion of the mission
  createdAt: {type: Number, optional: true}, // timestamp
  completed: {type: Boolean, defaultValue: false},
});

Missions.attachSchema(Missions.schema);

// This represents the keys from Missions objects that should be published
// to the client. If we add secret properties to Missions objects, don't list
// them here to keep them private to the server.
Missions.publicFields = {
  gameId: 1,
  type: 1,
  rankPoints: 1,
  creatorId: 1,
  ownerId: 1,
  conditions: 1,
  completed: 1,
  team: 1,
};

Missions.helpers({
 title(){
   return missionsConfig[this.type].title;
 },
 description(){
   return missionsConfig[this.type].description(this.conditions, Characters.findOne(this.conditions.turnIn.characterId));
 },
 icon(){
   return missionsConfig[this.type].icon;
 },
 passesConditionsToFinish(character){
   if (this.type == 'collectResources'){
     const receiver = Characters.findOne(this.conditions.turnIn.characterId);
     return receiver && character.stats.resources[this.conditions.resource] >= this.conditions.amount && character.sameLocationAs(receiver);
   }
 },
})
