import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import 'meteor/brentjanderson:buzz';

import './music.html';

Template.music.onCreated(function() {
  this.play = new ReactiveVar(false);
  buzz.defaults.loop = true;
  this.m = new buzz.sound('/sounds/anguish-of-consciousness.mp3');
  if (Template.currentData().music) {
    this.play.set(true);
    this.m.play();
  }
})

Template.music.helpers({
  playing(){
    return Template.instance().play.get();
  },
})

Template.music.events({
  'click .music-control': function(e, instance){
    Meteor.call('characters.toggleMusic', Template.currentData()._id, function(){
      instance.m.togglePlay();
      instance.play.set(!instance.play.get());
    })
  },
})

Template.music.onDestroyed(function() {
  this.m.stop();
})

