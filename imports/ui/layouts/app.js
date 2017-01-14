/* global alert */

import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Template } from 'meteor/templating';
import { ActiveRoute } from 'meteor/zimme:active-route';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { _ } from 'meteor/underscore';
import { $ } from 'meteor/jquery';

import { Characters } from '../../api/characters/characters.js';
import { Notifications } from '../../api/notifications/notifications.js';
import { Fights } from '../../api/fights/fights.js';

import '../components/loading.js';
import './app.html';

const CONNECTION_ISSUE_TIMEOUT = 5000;

// A store which is local to this file?
const showConnectionIssue = new ReactiveVar(false);

Meteor.startup(() => {
  // Only show the connection error box if it has been 5 seconds since
  // the app started
  setTimeout(() => {
    // FIXME:
    // Launch screen handle created in lib/router.js
    // dataReadyHold.release();

    // Show the connection error box
    showConnectionIssue.set(true);
  }, CONNECTION_ISSUE_TIMEOUT);
});

Template.app.onCreated(function appBodyOnCreated() {
  this.subscribe('characters.own');
  this.subscribe('fights.own');

  this.state = new ReactiveDict();
  this.state.setDefault({
    menuOpen: false,
    userMenuOpen: false,
  });

  this.autorun(() => {
    console.log(Notifications.find().fetch());
    if (FlowRouter.getParam('gameId')) {
      this.subscribe('notifications.own', FlowRouter.getParam('gameId'));
    }
  })
});

Template.app.helpers({
  menuOpen() {
    const instance = Template.instance();
    return instance.state.get('menuOpen') && 'menu-open';
  },
  emailLocalPart() {
    const email = Meteor.user().emails[0].address;
    return email.substring(0, email.indexOf('@'));
  },
  userMenuOpen() {
    const instance = Template.instance();
    return instance.state.get('userMenuOpen');
  },
  connected() {
    if (showConnectionIssue.get()) {
      return Meteor.status().connected;
    }

    return true;
  },
  character() {
    return Characters.findOne({userId: Meteor.userId(), 'stats.hp':{$gt: 0}});
  },
  isActive(name) {
    if (FlowRouter.getRouteName().match(name)) return "active";
    return "";
  },
  fight() {
    return Fights.findOne();
  },
  notification(){
    return Notifications.findOne();
  },
});

Template.app.events({
  'click .js-menu'(event, instance) {
    instance.state.set('menuOpen', !instance.state.get('menuOpen'));
  },

  'click .content-overlay'(event, instance) {
    instance.state.set('menuOpen', false);
    event.preventDefault();
  },

  'click .js-user-menu'(event, instance) {
    instance.state.set('userMenuOpen', !instance.state.get('userMenuOpen'));
    // stop the menu from closing
    event.stopImmediatePropagation();
  },

  'click #menu a'(event, instance) {
    instance.state.set('menuOpen', false);
  },

  'click .js-logout'() {
    Meteor.logout();
    FlowRouter.go('App.home');
  },

  'click .global-notification .dismiss-container .fa'() {
    Meteor.call('notifications.dismiss', FlowRouter.getParam('gameId'), Notifications.findOne()._id);
  },
});
