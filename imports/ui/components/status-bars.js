import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import { Characters } from '../../api/characters/characters.js';
import { Items } from '../../api/items/items.js';
import { carriedWeight } from '../../configs/game.js';
import { maxWeight } from '../../configs/locations.js';

import './status-bars.html';

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

Template.statusBars.onCreated(function gameOnCreated() {
  this.subscribe('characters.own');
})

Template.statusBars.helpers({
  character : function(){
    return Characters.findOne({userId: Meteor.userId()});
  },

  characterWeight(){
    return carriedWeight(Characters.findOne({userId: Meteor.userId()}), Items);
  },

  maxWeight(character){
    return Math.floor(maxWeight(character));
  },

  weightRatio(character){
    return carriedWeight(Characters.findOne({userId: Meteor.userId()}), Items)/(maxWeight(character)) * 100;
  },

  statPercent(stat){
    const character = Characters.findOne({userId: Meteor.userId()})
    return character.stats[stat] / character.stats['base'+capitalizeFirstLetter(stat)] * 100;
  }

});

Template.hpBar.helpers({
  statPercent(){
    return this.stats.hp / this.stats.baseHp * 100;
  }
})
