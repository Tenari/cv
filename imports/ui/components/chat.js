import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { Chats } from '../../api/chats/chats.js'

import './chat.html';

Template.chat.events({
  'click button.send-message': sendMessage,
  'keypress .send-message-container input.new-message'(event, instance) {
    if (event.keyCode == 13) // 'ENTER'
      sendMessage(event, instance);
  }
})

function sendMessage(event, instance){
  var $input = $(event.currentTarget).closest('.send-message-container').find('input.new-message');
  Meteor.call('chats.newMessage', FlowRouter.getParam('gameId'), instance.data._id, $input.val(), function(){
    $input.val('');
  });
}
