import { Meteor } from 'meteor/meteor';

import { Games } from './games.js';

Meteor.publish ("games", function(limit) {
  // only get to see games if you're logged in
  if (this.userId) {
    if(limit)
      return Games.find({tutorial: {$exists: false}});
    else
      return Games.find({});
  } else {
    this.ready();
  }
});
