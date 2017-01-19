import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session';

import { npcConfig } from '../../configs/ai.js';

import './npcTalk.html';

Template.npcTalk.onCreated(function(){
  const npc = Template.currentData();
  this.dialog = new ReactiveVar(npcConfig[npc.npcKey].dialog);
})

Template.npcTalk.helpers({
  dialog(){
    return Template.instance().dialog.get();
  },
  encode(obj){
    return JSON.stringify(obj);
  },
})

Template.npcTalk.events({
  'click li.response-option'(e, instance){
    const option = JSON.parse($(e.currentTarget).attr('data-option'));
    const action = option.action;
    if (action == 'dialog') {
      instance.dialog.set(option.dialog);
    } else if (action == 'cancel') {
      Session.set('npcTalkingTo', null);
    } else if (action == 'npc trade') {
      Session.set('npcTalkingTo', null);
      FlowRouter.go("/game/"+FlowRouter.getParam('gameId')+"/npc/"+Template.currentData()._id);
    }
  },
})
