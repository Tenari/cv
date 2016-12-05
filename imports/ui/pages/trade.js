import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { ReactiveVar } from 'meteor/reactive-var';

import { Characters } from '../../api/characters/characters.js'
import { Trades } from '../../api/trades/trades.js'

import './trade.html';

Template.trade.onCreated(function tradeOnCreated() {
  this.subscribe('characters.trade', FlowRouter.getParam('gameId'));
  this.subscribe('trades.own', FlowRouter.getParam('gameId'));
  this.trade = new ReactiveVar(null);

  this.autorun( () => {
    if (this.subscriptionsReady()) {
      if (Trades.find().count() == 0) // if there is no trade, go to the main world page
        FlowRouter.go('game.world', {gameId: FlowRouter.getParam('gameId')});
      else
        this.trade.set(Trades.findOne());
    }
  })
})

Template.trade.helpers({
  trade(){
    return Template.instance().trade.get();
  },
  seller(){
    return Characters.findOne(Template.instance().trade.get().sellerId);
  },
  buyer(){
    return Characters.findOne(Template.instance().trade.get().buyerId);
  }
})

Template.trade.events({
})
