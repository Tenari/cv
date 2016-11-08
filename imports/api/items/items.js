import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

export const Items = new Mongo.Collection('items');

// Deny all client-side updates since we will be using methods to manage this collection
Items.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});

Items.schema = new SimpleSchema({
  _id: { type: String, regEx: SimpleSchema.RegEx.Id },
  name: {type: String},
  type: {type: String},
  img: {type: String},
  weight: {type: Number},
  equipped: {type: Boolean},
  equipSlot: {type: Number},
  ownerId: { type: String, regEx: SimpleSchema.RegEx.Id },
});

Items.attachSchema(Items.schema);

// This represents the keys from Items objects that should be published
// to the client. If we add secret properties to Character objects, don't list
// them here to keep them private to the server.
Items.publicFields = {
  name: 1,
  type: 1,
  img: 1,
  weight: 1,
  equipped: 1,
  equipSlot: 1,
  ownerId: 1,
};
