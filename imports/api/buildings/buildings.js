import { Mongo } from 'meteor/mongo';

import { Characters } from '../characters/characters.js';

export const Buildings = new Mongo.Collection('buildings');

/*
{
  ownerId: characterIdStr,
  roomId: '',
  upperLeft: {
    x: 1,
    y: 2
  },
  bottomRight: {
    x: 2,
    y: 3
  },
  type: ENUM,
  underConstruction: Boolean,
  resources: {
    wood: 0,
    hide: 0,
    leather: 0,
    ore: 0,
    metal: 0,
  },
  level: Number,
  settings: {
    door: {
      lock: {
        type: ENUM ('team', 'all'),
        team: optional ENUM team code,
      }
    },
    trade: {
      buy: {
        wood: Number (price)
        etc...
      },
      sell: {
        wood: Number (price)
        etc...
      },
      max: {
        wood: Number (price)
        etc...
      },
      min: {
        wood: Number (price)
        etc...
      }
    }
  }
}
*/

// Deny all client-side updates since we will be using methods to manage this collection
Buildings.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});

// This represents the keys from Rooms objects that should be published
// to the client. If we add secret properties to Room objects, don't list
// them here to keep them private to the server.
Buildings.publicFields = {
  ownerId: 1,
};

Buildings.helpers({
  character() {
    return Characters.findOne(this.ownerId);
  },
  dimensions() {
    return {
      x: this.bottomRight.x - this.upperLeft.x,
      y: this.bottomRight.y - this.upperLeft.x
    };
  },
  capacity() {
    return this.level * 100;
  }
})