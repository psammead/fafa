/**
 * Message notifier directives
 */
define([
        'angular',
        'components/message-notifier/message-notifier-controllers'
    ],
    function(angular) {
        'use strict';
        return angular.module('messageNotifierDirectives', ['messageNotifierControllers'])
            .directive('hpeMessageNotifier', function() {
                return {
                    restrict: 'E',
                    replace: true,
                    scope: {},
                    controller: 'messageNotifierController',
                    templateUrl: '/components/message-notifier/message-notifier.html'
                };
            });
    });
