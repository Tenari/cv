import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';

import { Characters } from '../../api/characters/characters.js'

import '../components/status-bars.js';
import './stats.html';

Template.stats.onCreated(function gameOnCreated() {
  this.subscribe('characters.own');
  this.state = new ReactiveDict();
  this.state.setDefault({
    page: 'Skills'
  });
})

Template.stats.helpers({
  character : function(){
    return Characters.findOne({userId: Meteor.userId()});
  },

  page: function(key) {
    return Template.instance().state.get('page') == key ? 'active' : false;
  },

  decimal(stat){
    return stat.toFixed(2);
  }

});

Template.stats.events({
  'click .tab-links>a'(e, instance) {
    instance.state.set('page', $(e.target).data('page'));
  }
})
