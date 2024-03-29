import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { Characters } from '../../api/characters/characters.js';
import { Items } from '../../api/items/items.js';
import { getCharacter } from '../../configs/game.js';

import './status-bars.html';

Template.statusBars.onCreated(function gameOnCreated() {
  this.subscribe('characters.own');
  this.me = () => getCharacter(Meteor.userId(), FlowRouter.getParam('gameId'), Characters);
})

Template.statusBars.helpers({
  character : function(){
    return Template.instance().me();
  },

  characterWeight(){
    return Template.instance().me().carriedWeight();
  },

  maxWeight(character){
    return Math.floor(character.maxWeight());
  },

  weightRatio(character){
    return character.carriedWeight() / character.maxWeight() * 100;
  },

  statPercent(stat){
    const character = Template.instance().me();
    return Math.max(character.stats[stat] / character.stats[stat+'Base'] * 100, 0);
  }

});

Template.hpBar.helpers({
  statPercent(){
    return this.stats.hp / this.stats.hpBase * 100;
  }
})
