import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Items } from '../items/items.js';
import { itemConfigs } from '../../configs/items.js';
import { ranksConfig } from '../../configs/ranks.js';
import { nextSpotXY } from '../../configs/locations.js';

export const Characters = new Mongo.Collection('characters');

// Deny all client-side updates since we will be using methods to manage this collection
Characters.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});

const LocationSchema = new SimpleSchema({
  x: {type: Number},
  y: {type: Number},
  direction: {type: Number},
  classId: {type: Number},
  roomId: { type: String, regEx: SimpleSchema.RegEx.Id },
  updatedAt: { type: Number, autoValue: function() { return Date.now(); } },
});

const WeaponStatsSchema = new SimpleSchema({
  hands: {type: Number, defaultValue: 1, decimal: true},
  handsBase: {type: Number, defaultValue: 1, decimal: true},
  smallBlade: {type: Number, defaultValue: 1, decimal: true},
  smallBladeBase: {type: Number, defaultValue: 1, decimal: true},
  largeBlade: {type: Number, defaultValue: 1, decimal: true},
  largeBladeBase: {type: Number, defaultValue: 1, decimal: true},
  axe: {type: Number, defaultValue: 1, decimal: true},
  axeBase: {type: Number, defaultValue: 1, decimal: true},
});

const ResourcesSchema = new SimpleSchema({
  wood: {type: Number, defaultValue: 0},
  hide: {type: Number, defaultValue: 0},
  leather: {type: Number, defaultValue: 0},
  ore: {type: Number, defaultValue: 0},
  metal: {type: Number, defaultValue: 0},
});

const CollectingSchema = new SimpleSchema({
  wood: {type: Number, defaultValue: 1, decimal: true},
  woodBase: {type: Number, defaultValue: 1, decimal: true},
  hide: {type: Number, defaultValue: 1, decimal: true},
  hideBase: {type: Number, defaultValue: 1, decimal: true},
  leather: {type: Number, defaultValue: 1, decimal: true},
  leatherBase: {type: Number, defaultValue: 1, decimal: true},
  ore: {type: Number, defaultValue: 1, decimal: true},
  oreBase: {type: Number, defaultValue: 1, decimal: true},
  metal: {type: Number, defaultValue: 1, decimal: true},
  metalBase: {type: Number, defaultValue: 1, decimal: true},
  crafting: {type: Number, defaultValue: 1, decimal: true},
  craftingBase: {type: Number, defaultValue: 1, decimal: true},
});

const StatsSchema = new SimpleSchema({
  hp: {
    type: Number, 
    // this fucntion will overwrite the value of the hp to never be more than the hpBase of the same document
    autoValue: function(){
      //default to 30
      if (!this.isSet && this.isInsert) {
        return 30;
      }
      const doc = Characters.findOne(this.docId);
      if (!doc) return undefined;

      if (this.isSet && doc.stats.hpBase && this.operator == '$set' && this.value > doc.stats.hpBase) {
        return doc.stats.hpBase;
      }
      if (this.isSet && doc.stats.hpBase && this.operator == '$inc') {
        if (doc.stats.hp + this.value > doc.stats.hpBase) {
          return this.value - ((doc.stats.hp + this.value) - doc.stats.hpBase);
        }
      }
    }
  },
  hpBase: {type: Number, defaultValue: 30},
  strength: {type: Number, defaultValue: 1, decimal: true},
  strengthBase: {type: Number, defaultValue: 1, decimal: true},
  accuracy: {type: Number, defaultValue: 1, decimal: true},
  accuracyBase: {type: Number, defaultValue: 1, decimal: true},
  agility: {type: Number, defaultValue: 1, decimal: true},
  agilityBase: {type: Number, defaultValue: 1, decimal: true},
  toughness: {type: Number, defaultValue: 1, decimal: true},
  toughnessBase: {type: Number, defaultValue: 1, decimal: true},
  weapon: {type: WeaponStatsSchema},
  resources: { type: ResourcesSchema },
  collecting: { type: CollectingSchema },
  energy: {type: Number, decimal: true, autoValue: function(){
    // this fucntion will overwrite the value of the energy to never be more than the energyBase of the same document
    //default to 10000
    if (!this.isSet && this.isInsert) {
      return 10000;
    }
    const doc = Characters.findOne(this.docId);
    if (!doc) return undefined;

    if (this.isSet && doc.stats.energyBase && this.operator == '$set' && this.value > doc.stats.energyBase) {
      return doc.stats.energyBase;
    }
    if (this.isSet && doc.stats.energyBase && this.operator == '$inc') {
      if (doc.stats.energy + this.value > doc.stats.energyBase) {
        return this.value - ((doc.stats.energy + this.value) - doc.stats.energyBase);
      }
    }
  }},
  energyBase: {type: Number, defaultValue: 10000},
  endurance: {type: Number, defaultValue: 1, decimal: true},
  money: {type: Number, defaultValue: 100, decimal: true},
  rank: {type: String, defaultValue: 'peasant'},
  rankPoints: {type: Number, defaultValue: 1},
});

const DeathsSchema = new SimpleSchema({
  recentlyDead: {type: Boolean, defaultValue: false},
  diedAt: {type: Number, optional: true},// initally doesn't exist
  count: {type: Number, defaultValue: 0}
});

const CountsSchema = new SimpleSchema({
  missionsCompleted: {type: Number, defaultValue: 0},
})

Characters.schema = new SimpleSchema({
  _id: { type: String, regEx: SimpleSchema.RegEx.Id },
  name: { type: String },
  team: {type: String},
  gameId: { type: String, regEx: SimpleSchema.RegEx.Id },
  userId: { type: String, regEx: SimpleSchema.RegEx.Id, optional: true },
  location: {type: LocationSchema},
  stats: {type: StatsSchema},
  defaultAttackStyle: {type: String, defaultValue: 'quick'},
  deaths: { type: DeathsSchema },
  lastFightEndedAt: { type: Number, optional: true },
  npc: {type: Boolean, defaultValue: false},
  npcKey: {type: String, optional: true },
  monsterKey: {type: String, optional: true },
  aiIndex: {type: Number, optional: true }, // referrs to the index in the room config for which this ai should be spawned
  aiBounds: {type: Object, optional: true, blackbox: true},
  music: {type: Boolean, defaultValue: true},
  counts: {type: CountsSchema},
});

Characters.attachSchema(Characters.schema);

// This represents the keys from Characters objects that should be published
// to the client. If we add secret properties to Character objects, don't list
// them here to keep them private to the server.
Characters.publicFields = {
  name: 1,
  team: 1,
  gameId: 1,
  userId: 1,
  location: 1,
  stats: 1,
  deaths: 1,
  lastFightEndedAt: 1,
  npc: 1,
  npcKey: 1,
  monsterKey: 1,
  music: 1,
  counts: 1,
};

Characters.helpers({
  maxWeight() {
    // with endurance of 100, you can carry 200
    // with endurance of 1, you can carry 20
    // ish
    return 40*Math.log(this.stats.endurance) + 20;
  },
  carriedWeight() {
    let weight = 0;
    Items.find({ownerId: this._id}).forEach(function(item){weight += itemConfigs[item.type][item.key].weight;});
    _.each(this.stats.resources, function(amount){weight += amount})
    return weight;
  },
  canCarry(weight) {
    return this.maxWeight() > (this.carriedWeight() + weight);
  },
  power(){
    const that = this;
    const moneyPower = (this.stats.money / 10);
    const collectingPower = _.reduce(['woodBase','oreBase','leatherBase', 'hideBase', 'metalBase'], function(memo, key){return memo + that.stats.collecting[key];}, 0);
    const fightingPower = _.reduce(['strengthBase','agilityBase','toughnessBase', 'accuracyBase'], function(memo, key){return memo + that.stats[key];}, 0);
    const weaponPower = _.reduce(['handsBase','smallBladeBase','largeBladeBase', 'axeBase'], function(memo, key){return memo + that.stats.weapon[key];}, 0);
    return moneyPower + collectingPower + fightingPower + weaponPower;
  },
  image(){
    return '/images/' + (this.location.classId + this.location.direction) + '.png';
  },
  sameLocationAs(otherCharacter){
    return this.location.roomId == otherCharacter.location.roomId &&
           this.location.x == otherCharacter.location.x &&
           this.location.y == otherCharacter.location.y;
  },
  canBePromoted(newRankPoints) {
    const newRankPointTotal = this.stats.rankPoints + newRankPoints;
    const next = ranksConfig[this.stats.rank].next
    if (!next) return false;
    const nextLimit = ranksConfig[next].power;
    if (newRankPointTotal > nextLimit && Characters.find({team: this.team, 'stats.rank': next}).count() < ranksConfig[next].number) {
      return next;
    }
    return false;
  },
  createableMissionCount(Missions) {
    const rank = this.stats.rank;
    const createableMissions = ranksConfig[rank].createableMissions;
    return createableMissions - Missions.find({creatorId: this._id, completed: false}).count();
  },
  getFacingObstacle(Obstacles) {
    const xy = nextSpotXY(this);
    const obstacles = Obstacles.find({'location.roomId': this.location.roomId, 'location.x': {$gte: xy.x - 4}, 'location.y':{$gte: xy.y - 4}}).fetch();
    return _.find(obstacles, function(obstacle){
      return _.find(obstacle.locations(), function(loc){ return loc.x == xy.x && loc.y == xy.y; });
    })
  },
  getFacingBuilding(Buildings) {
    const xy = nextSpotXY(this);
    const buildings = Buildings.find({'location.roomId': this.location.roomId, 'location.x': {$gte: xy.x - 4}, 'location.y':{$gte: xy.y - 4}}).fetch();
    return _.find(buildings, function(building){
      return _.find(building.locations(), function(loc){ return loc.x == xy.x && loc.y == xy.y; });
    })
  },
  getCurrentTileObstacle(Obstacles) {
    return Obstacles.findOne({'location.roomId': this.location.roomId, 'location.x': this.location.x, 'location.y': this.location.y});
  },
  limitBounds(){
    if (this.aiBounds) {
      const bounds = this.aiBounds;
      const updatedChar = Characters.findOne(this._id);
      let setObj = {};
      if (updatedChar.location.x > bounds.bottomRight.x) {
        setObj['location.x'] = bounds.bottomRight.x;
      }
      if (updatedChar.location.x < bounds.topLeft.x) {
        setObj['location.x'] = bounds.topLeft.x;
      }
      if (updatedChar.location.y > bounds.bottomRight.y) {
        setObj['location.y'] = bounds.bottomRight.y;
      }
      if (updatedChar.location.y < bounds.topLeft.y) {
        setObj['location.y'] = bounds.topLeft.y;
      }
      if (_.keys(setObj).length > 0)
        Characters.update(this._id, {$set: setObj});
    }
  },
})
