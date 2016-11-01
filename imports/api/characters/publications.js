import { Meteor } from 'meteor/meteor';

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
