import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { ReactiveVar } from 'meteor/reactive-var';
import { ReactiveDict } from 'meteor/reactive-dict';

import { Characters } from '../../api/characters/characters.js'
import { Trades } from '../../api/trades/trades.js'
import { Items } from '../../api/items/items.js'
import { Chats } from '../../api/chats/chats.js'
import { getCharacter } from '../../configs/game.js';

import '../components/item.js';
import '../components/chat.js';
import './trade.html';

Template.trade.onCreated(function tradeOnCreated() {
  this.subscribe('items.own');
  this.subscribe('characters.trade', FlowRouter.getParam('gameId'));
  var trade = this.subscribe('trades.own', FlowRouter.getParam('gameId'));
  this.myOffer = new ReactiveVar(null);
  this.me = () => getCharacter(Meteor.userId(), FlowRouter.getParam('gameId'), Characters);
  this.editing = new ReactiveDict();

  this.autorun( () => {
    if (trade.ready()) {
      if (Trades.find().count() == 0) // if there is no trade, go to the main world page
        FlowRouter.go('game.world', {gameId: FlowRouter.getParam('gameId')});
      else {
        this.subscribe('chats.scope', "Trades:"+Trades.findOne()._id);
        if (Trades.findOne().sellerId == this.me()._id) {
          this.myOffer.set(Trades.findOne().sellerOffer);
        } else {
          this.myOffer.set(Trades.findOne().buyerOffer);
        }
      }
    }
  })
})

Template.trade.helpers({
  trade(){
    console.log(Trades.findOne());
    return Trades.findOne();
  },
  seller(){
    return Characters.findOne(Trades.findOne().sellerId);
  },
  buyer(){
    return Characters.findOne(Trades.findOne().buyerId);
  },
  offerIs(offer, type){
    return offer.type == type;
  },
  ownOffer(){
    return Template.instance().myOffer.get();
  },
  me() {
    return Template.instance().me();
  },
  editing(key){
    return Template.instance().editing.get(key);
  },
  resources(){
    return _.map(Template.instance().me().stats.resources, function(amount, resource) {
      return {key: resource, amount: amount};
    });
  },
  iAm(character){
    return character._id == Template.instance().me()._id;
  },
  tradeChat(){
    return Chats.findOne();
  },
  items(){
    return Items.find();
  }
})

Template.trade.events({
  'click .resources .edit-resource'(event, instance) {
    instance.editing.set($(event.currentTarget).data('editing'), true);
  },
  'click button.offer'(event, instance){
    Meteor.call('trades.updateOffer', FlowRouter.getParam('tradeId'), instance.me()._id, {
      type: $(event.currentTarget).data('type'),
      resource: $(event.currentTarget).data('resource'),
      amount: parseInt($(event.currentTarget).parent().find('input.amount-to-add').val()),
    }, function(error, result) {
      console.log(error, result);
      instance.editing.set($(event.currentTarget).data('resource'), null);
    });
  },
  'click .items-list .item'(event, instance){
    Meteor.call('trades.updateOffer', FlowRouter.getParam('tradeId'), instance.me()._id, {
      type: 'item',
      item: Items.findOne($(event.currentTarget).data('id')),
    })
  },
  'click ul.remove-offer li'(event, instance){
    Meteor.call('trades.removeOffer', FlowRouter.getParam('tradeId'), instance.me()._id, $(event.currentTarget).data('index'));
  },
  'click .accept-trade-container button.cancel'(event, instance) {
    Meteor.call('trades.end', FlowRouter.getParam('gameId'), FlowRouter.getParam('tradeId'));
  },
  'click .accept-trade-container button.accept'(event, instance) {
    Meteor.call('trades.accept', FlowRouter.getParam('gameId'), FlowRouter.getParam('tradeId'));
  },
})
