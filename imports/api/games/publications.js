import { Meteor } from 'meteor/meteor';

import { Games } from './games.js';

Meteor.publish ("games", function() {
  // only get to see games if you're logged in
  if (this.userId) {
    return Games.find({});
  } else {
    this.ready();
  }
});
