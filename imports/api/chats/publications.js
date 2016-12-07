import { Meteor } from 'meteor/meteor';

import { Chats } from './chats.js';

Meteor.publish ("chats.scope", function(scope) {
  if (!this.userId) {return this.ready();}

  return Chats.find({scope: scope}, {fields: Chats.publicFields});
});

