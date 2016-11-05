import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { ReactiveDict } from 'meteor/reactive-dict';

import { Characters } from '../../api/characters/characters.js'
import { Fights } from '../../api/fights/fights.js'

import '../components/status-bars.js';
import './fight.html';

Template.fight.onCreated(function fightOnCreated() {
  this.state = new ReactiveDict();
  this.state.setDefault({
    menu: 'base',
    next: 'quick',
  })
  this.subscribe('fights.own');
  this.subscribe('characters.fight');
  this.character = () => Characters.findOne({userId: Meteor.userId()});
})

function nextAttack() {
  const character = Template.instance().character();
  const fight = Fights.findOne();
  let style = fight.defenderStyle;
  if (fight.attackerId == character._id) {
    style = fight.attackerStyle;
  }
  return style;
}

Template.fight.helpers({
  menu(key){
    return key == Template.instance().state.get('menu');
  },
  nextAttack: nextAttack,
  nextIsAttack(){
    const style = nextAttack();
    return style == 'flee' || style == 'block' ? false : style;
  },
  enemy(){
    return Characters.findOne({userId: {$ne: Meteor.userId()}});
  },
  enemyMainImage() {
    const enemy = Characters.findOne({userId: {$ne: Meteor.userId()}});
    return enemy.location.classId + 2;
  },
  ownMainImage() {
    return Template.instance().character().location.classId + 1;
  }
})

Template.fight.events({
  'click .fight-option'(e, instance){
    instance.state.set('menu', 'attack');
  },
  'click .option.attack'(e, instance){
    Meteor.call('fights.changeStyle', Fights.findOne()._id, instance.character()._id, $(e.target).data('style'));
    instance.state.set('menu', 'base');
  },
})
