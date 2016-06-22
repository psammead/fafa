/**
 * Message notifier controller
 */

define([
    'angular',
    'components/message-notifier/message-notifier-services'
], function(angular) {
    'use strict';

    return angular.module('messageNotifierControllers', ['messageNotifierServices']).controller('messageNotifierController', ['$scope', 'messageNotifierService',
        function($scope, messageNotifierService) {
            $scope.messages = messageNotifierService.getMessages(true);
            $scope.parameters = messageNotifierService.getParameters();

            $scope.clearAll = function() {
                messageNotifierService.clearAll();
            };

            $scope.delete = function(message) {
                messageNotifierService.delete(message);
            };

            $scope.setInfoEnabled = function(enabled) {
                messageNotifierService.setInfoEnabled(enabled);
            };

            $scope.setSuccessEnabled = function(enabled) {
                messageNotifierService.setSuccessEnabled(enabled);
            };

            $scope.setWarningEnabled = function(enabled) {
                messageNotifierService.setWarningEnabled(enabled);
            };

            $scope.setDangerEnabled = function(enabled) {
                messageNotifierService.setDangerEnabled(enabled);
            };
        }
    ]);
});