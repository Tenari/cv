import { Meteor } from 'meteor/meteor';

import { Characters } from '../characters/characters.js';
import { Fights } from './fights.js';

Meteor.publish ("fights.own", function() {
  if (!this.userId) {this.ready();}

  const characterId = Characters.findOne({userId: this.userId})._id;
  return Fights.find({$or: [{attackerId: characterId}, {defenderId: characterId}]}, {fields: Fights.publicFields});
});

