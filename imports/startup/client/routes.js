import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

// Import to load these templates
import '../../ui/layouts/app.js';
import '../../ui/pages/root.js';
import '../../ui/pages/game.js';
import '../../ui/pages/not-found.js';

// Import to override accounts templates
import '../../ui/components/accounts.js';

FlowRouter.route('/', {
  name: 'App.home',
  action() {
    BlazeLayout.render('app', { main: 'rootPage' });
  },
});

FlowRouter.route('/game/:gameId', {
  name: 'game.play',
  action() {
    BlazeLayout.render('app', { main: 'game' });
  },
});

// the notFound template is used for unknown routes and missing lists
FlowRouter.notFound = {
  action() {
    BlazeLayout.render('app', { main: 'notFound' });
  },
};
