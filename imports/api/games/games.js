import { Mongo } from 'meteor/mongo';

export const Games = new Mongo.Collection('Games');

// Deny all client-side updates since we will be using methods to manage this collection
Games.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});

// This represents the keys from Games objects that should be published
// to the client. If we add secret properties to Game objects, don't list
// them here to keep them private to the server.
Games.publicFields = {
};

//Games.helpers({});
