import { Meteor } from 'meteor/meteor';

import { Rooms } from './rooms.js';

Meteor.publish ("game.rooms", function(gameId) {
  if (!this.userId) {
    return this.ready();
  }

  return Rooms.find({gameId: gameId});
});

