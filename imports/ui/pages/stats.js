import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import { Characters } from '../../api/characters/characters.js'
import { Rooms } from '../../api/rooms/rooms.js'

import './stats.html';
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

Template.stats.onCreated(function gameOnCreated() {
  this.subscribe('characters.own');
})

Template.stats.helpers({
  character : function(){
    return Characters.findOne({userId: Meteor.userId()});
  },

  showSkills: function(){
    return true
  },

  statPercent(stat){
    const character = Characters.findOne({userId: Meteor.userId()})
    return character.stats[stat] / character.stats['base'+capitalizeFirstLetter(stat)] * 100;
  }

});
