import { Meteor } from 'meteor/meteor';

import { Fights } from '../fights/fights.js';
import { Characters } from './characters.js';

Meteor.publish ("characters.room", function() {
  // only get to see users if you're logged in
  if (this.userId) {
    // only publish the users in the same room. Don't need to know about those other fuckers.
    var roomId = Characters.findOne({userId: this.userId}).location.roomId;
    return Characters.find({$or: [{userId: this.userId}, {"location.roomId": roomId}]}, {fields: Characters.publicFields});
  } else {
    this.ready();
  }
});

Meteor.publish ("characters.own", function() {
  if (this.userId) {
    return Characters.find({userId: this.userId}, {fields: Characters.publicFields});
  } else {
    this.ready();
  }
});

// returns the characters involved in the fight that this.userId is involved in.
Meteor.publish ("characters.fight", function() {
  if (!this.userId) this.ready();

  const character = Characters.findOne({userId: this.userId});
  const fight = Fights.findOne({$or: [{attackerId: character._id},{defenderId: character._id}]});
  return Characters.find({_id: {$in: [fight.attackerId, fight.defenderId] } }, {fields: Characters.publicFields});
});
