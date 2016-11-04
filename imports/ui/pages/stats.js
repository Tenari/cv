import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import { Characters } from '../../api/characters/characters.js'

import '../components/status-bars.js';
import './stats.html';

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

});
