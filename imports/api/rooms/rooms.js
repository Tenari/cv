import { Mongo } from 'meteor/mongo';

export const Rooms = new Mongo.Collection('rooms');

// Deny all client-side updates since we will be using methods to manage this collection
Rooms.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});

// This represents the keys from Rooms objects that should be published
// to the client. If we add secret properties to Room objects, don't list
// them here to keep them private to the server.
Rooms.publicFields = {
  name: 1,
};

//Rooms.helpers({});
