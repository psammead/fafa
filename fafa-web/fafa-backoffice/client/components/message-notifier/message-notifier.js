/**
 * Message Notifier module
 */
define([
    'angular',
    'components/language-config/language-config',
    'components/message-notifier/message-notifier-services',
    'components/message-notifier/message-notifier-directives',
    'components/message-notifier/message-notifier-controllers'
  ],
  function(angular) {
    'use strict';
    var messageNotifierModule = angular.module('messageNotifier', ['messageNotifierServices', 'messageNotifierDirectives', 'messageNotifierControllers', 'pascalprecht.translate']);
    messageNotifierModule.run(['$translatePartialLoader',
    	function($translatePartialLoader) {
    		// Load module translation data
    		$translatePartialLoader.addPart('/components/message-notifier');
    	}]);
    return messageNotifierModule;
  }
);
