import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { Chats } from '../../api/chats/chats.js'

import './chat.html';

Template.chat.onRendered(function(){
  var that = this;
  var oldMessages = (this.data && this.data.messages.length) || 0;
  this.autorun(function(){
    console.log('asdf');
    if (Template.currentData() && Template.currentData().messages.length > oldMessages) {
      oldMessages = Template.currentData().messages.length;
      const box = that.$('.chat-messages');
      box.animate({scrollTop: box.get(0).scrollHeight}, 1000);
    }
  })
})

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
