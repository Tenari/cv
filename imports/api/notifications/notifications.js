import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Characters } from '../characters/characters.js';

export const Notifications = new Mongo.Collection('notifications');

// Deny all client-side updates since we will be using methods to manage this collection
Notifications.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});


Notifications.schema = new SimpleSchema({
  _id: { type: String, regEx: SimpleSchema.RegEx.Id },
  characterId: {type: String},
  title: {type: String, optional: true},
  message: {type: String, optional: true},
  duration: {type: Number, optional: true}, //in ms, if blank, user must dismiss
});

Notifications.attachSchema(Notifications.schema);

// This represents the keys from Notifications objects that should be published
// to the client. If we add secret properties to Item objects, don't list
// them here to keep them private to the server.
Notifications.publicFields = {
  characterId: 1,
  title: 1,
  message: 1,
  duration: 1,
};

Notifications.insertAsyncByQuery = function(notification, query){
  Meteor.setTimeout(function(){
    Characters.find(query).forEach(function(character){
      let notif = _.clone(notification);
      notif.characterId = character._id;
      Notifications.insert(notif);
    });
  },1);
}

//Notifications.helpers({
//})
