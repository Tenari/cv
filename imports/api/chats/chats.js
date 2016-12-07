import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

export const Chats = new Mongo.Collection('chats');

// Deny all client-side updates since we will be using methods to manage this collection
Chats.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});

Chats.schema = new SimpleSchema({
  _id: { type: String, regEx: SimpleSchema.RegEx.Id },
  scope: { type: String }, // string of the format "#{Model Name}:#{record _id}" like => "Trades:g12hj3hg3j4hg123k4h" 
  messages: {type: [Object]},
  'messages.$.sender': {type: String},
  'messages.$.content': {type: String},
  createdAt: {type: Number, autoValue: function(){
    if (this.isInsert) {
      return Date.now();
    } else if (this.isUpsert) {
      return {$setOnInsert: Date.now()};
    } else {
      this.unset();  // Prevent user from supplying their own value
    }
  } },
});

Chats.attachSchema(Chats.schema);

// This represents the keys from Fights objects that should be published
// to the client. If we add secret properties to Character objects, don't list
// them here to keep them private to the server.
Chats.publicFields = {
  scope: 1,
  messages: 1,
  createdAt: 1,
};

