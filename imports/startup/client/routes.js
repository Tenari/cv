import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

// Import to load these templates
import '../../ui/layouts/app.js';
import '../../ui/pages/root.js';
import '../../ui/pages/new-character.js';
import '../../ui/pages/game.js';
import '../../ui/pages/stats.js';
import '../../ui/pages/fight.js';
import '../../ui/pages/death.js';
import '../../ui/pages/craft.js';
import '../../ui/pages/not-found.js';

import '../../ui/pages/mapbuilder.js';

// Import to override accounts templates
import '../../ui/components/accounts.js';

FlowRouter.route('/', {
  name: 'App.home',
  action() {
    BlazeLayout.render('app', { main: 'rootPage' });
  },
});

FlowRouter.route('/new', {
  name: 'characters.new',
  action() {
    BlazeLayout.render('app', { main: 'newCharacter' });
  },
});

FlowRouter.route('/game/:gameId/world', {
  name: 'game.world',
  action() {
    BlazeLayout.render('app', { main: 'game' });
  },
});

FlowRouter.route('/game/:gameId/stats', {
  name: 'game.stats',
  action() {
    BlazeLayout.render('app', { main: 'stats' });
  },
});

FlowRouter.route('/game/:gameId/fight', {
  name: 'game.fight',
  action() {
    BlazeLayout.render('app', { main: 'fight' });
  },
});

FlowRouter.route('/character/:characterId/craft', {
  name: 'character.craft',
  action() {
    BlazeLayout.render('app', { main: 'craft' });
  },
});

FlowRouter.route('/character/:characterId/death', {
  name: 'character.death',
  action() {
    BlazeLayout.render('app', { main: 'death' });
  },
});

FlowRouter.route('/mapbuilder', {
  name: 'tools.mapbuilder',
  action() {
    BlazeLayout.render('app', { main: 'mapbuilder' });
  },
});

// the notFound template is used for unknown routes and missing lists
FlowRouter.notFound = {
  action() {
    BlazeLayout.render('app', { main: 'notFound' });
  },
};
