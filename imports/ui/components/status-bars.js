import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import { Characters } from '../../api/characters/characters.js'

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
