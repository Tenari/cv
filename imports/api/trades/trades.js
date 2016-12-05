import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

export const Trades = new Mongo.Collection('trades');

// Deny all client-side updates since we will be using methods to manage this collection
Trades.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});

Trades.schema = new SimpleSchema({
  _id: { type: String, regEx: SimpleSchema.RegEx.Id },
  sellerId: { type: String, regEx: SimpleSchema.RegEx.Id },
  buyerId: { type: String, regEx: SimpleSchema.RegEx.Id },
  sellerOffer: {type: [Object], blackbox: true}, // blackbox option means we don't have to specify the schema inside this object--anything is valid
  buyerOffer: {type: [Object], blackbox: true},
  sellerAccepts: {type: Boolean, defaultValue: false},
  buyerAccepts: {type: Boolean, defaultValue: false},
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

Trades.attachSchema(Trades.schema);

// This represents the keys from Fights objects that should be published
// to the client. If we add secret properties to Character objects, don't list
// them here to keep them private to the server.
Trades.publicFields = {
  sellerId: 1,
  buyerId: 1,
  createdAt: 1,
  sellerOffer: 1,
  buyerOffer: 1,
  sellerAccepts: 1,
  buyerAccepts: 1,
};

