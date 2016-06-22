/**
 * Message Notifier Services
 */
define([
        'angular',
        'angularBootstrap',
        'commons/events/commons-events'
    ],
    function(angular) {
        'use strict';

        // Controller used by error modal windows
        var errorNotificationController = function($scope, $modalInstance, error) {
            if (error && typeof error === 'string') {
                $scope.error = {
                    status: '',
                    data: error
                };
            } else {
                $scope.error = error;
            }
            $scope.isString = function(obj) {
                return typeof obj === 'string';
            };
            $scope.ok = function() {
                $modalInstance.close();
            };
            $scope.cancel = function() {
                $modalInstance.dismiss();
            };
        };

        // Controller used by warning modal windows
        var warningNotificationController = function($scope, $modalInstance, warning) {
            $scope.warning = warning;
            $scope.ok = function() {
                $modalInstance.close();
            };
            $scope.cancel = function() {
                $modalInstance.dismiss();
            };
        };

        var messageNotifierServices = angular.module('messageNotifierServices', ['ui.bootstrap', 'commonsEvents']);

        messageNotifierServices.service('messageNotifierService', ['$timeout', '$modal',
            function($timeout, $modal) {
                // The list of all notification messages
                var messages = [];
                // The filtered list of messages, depending on parameters
                var filteredMessages = [];
                // parameters defining UI filtering
                var parameters = {
                    infoEnabled: true,
                    successEnabled: true,
                    warningEnabled: true,
                    dangerEnabled: true
                };

                // empty an array without recreating it
                var empty = function(array) {
                    while (array.length > 0) {
                        array.pop();
                    }
                };

                // actualize filteredMessages depending on parameters (empty the list and refill it)
                var buildFilteredMessages = function() {
                    empty(filteredMessages);
                    messages.forEach(function(m) {
                        if (parameters[m.type + 'Enabled']) {
                            filteredMessages.push(m);
                        }
                    });
                };

                /**
                 * Return the list of all notification messages
                 * @method getMessages
                 * @return list of all notification messages
                 */
                this.getMessages = function(filtered) {
                    return filtered ? filteredMessages : messages;
                };

                /**
                 * Return a copy of the parameters of the message-notifier-service (like enableInfo/Success/Warning/Danger)
                 * @method getParameters
                 * @return parameters object
                 */
                this.getParameters = function() {
                    return angular.copy(parameters);
                };

                /**
                 * Change the parameter infoEnabled, and update the filteredMessages list consequently
                 * @method setInfoEnabled
                 * @param enabled
                 */
                this.setInfoEnabled = function(enabled) {
                    if (parameters.infoEnabled !== enabled) {
                        parameters.infoEnabled = enabled;
                        buildFilteredMessages();
                    }
                };

                /**
                 * Change the parameter successEnabled, and update the filteredMessages list consequently
                 * @method setInfoEnabled
                 * @param enabled
                 */
                this.setSuccessEnabled = function(enabled) {
                    if (parameters.successEnabled !== enabled) {
                        parameters.successEnabled = enabled;
                        buildFilteredMessages();
                    }
                };

                /**
                 * Change the parameter warningEnabled, and update the filteredMessages list consequently
                 * @method setInfoEnabled
                 * @param enabled
                 */
                this.setWarningEnabled = function(enabled) {
                    if (parameters.warningEnabled !== enabled) {
                        parameters.warningEnabled = enabled;
                        buildFilteredMessages();
                    }
                };

                /**
                 * Change the parameter dangerEnabled, and update the filteredMessages list consequently
                 * @method setInfoEnabled
                 * @param enabled
                 */
                this.setDangerEnabled = function(enabled) {
                    if (parameters.dangerEnabled !== enabled) {
                        parameters.dangerEnabled = enabled;
                        buildFilteredMessages();
                    }
                };

                /**
                 * Set the default parameters and update the filteredMessages list consequently
                 * @method setDefaultParameters
                 */
                this.setDefaultParameters = function() {
                    parameters.infoEnabled = false;
                    parameters.successEnabled = true;
                    parameters.warningEnabled = true;
                    parameters.dangerEnabled = true;
                    buildFilteredMessages();
                };

                /**
                 * Alias to setDangerEnabled
                 * @method setInfoEnabled
                 * @param enabled
                 */
                this.setErrorEnabled = this.setDangerEnabled;

                /** 
                 * Remove all messages from the list
                 * @method clearAll
                 */
                this.clearAll = function() {
                    empty(messages);
                    empty(filteredMessages);
                };

                /**
                 * Remove a specific element of the list of messages (based on its index)
                 * @method delete
                 * @param index The index of the message to remove
                 */
                this.delete = function(message) {
                    messages.splice(message.index, 1);
                    for (var i = 0; i < filteredMessages.length; i++) {
                        if (filteredMessages[i].index === message.index) {
                            filteredMessages.splice(i, 1);
                        }
                    }
                };

                /**
                 * Notify an info message
                 * @method info
                 * @param text
                 * @param params
                 */
                this.info = function(text, params) {
                    var message = {
                        index: messages.length,
                        type: 'info',
                        text: text,
                        parameters: params
                    };
                    messages.push(message);
                    if (parameters.infoEnabled) {
                        filteredMessages.push(message);
                    }
                };

                /**
                 * Notify a success message
                 * @method success
                 * @param text
                 * @param params
                 */
                this.success = function(text, params) {
                    var message = {
                        index: messages.length,
                        type: 'success',
                        text: text,
                        parameters: params
                    };
                    messages.push(message);
                    if (parameters.successEnabled) {
                        filteredMessages.push(message);
                    }
                };

                /**
                 * Notify a warning message
                 * @method warning
                 * @param text
                 * @param params
                 */
                this.warning = function(text, params) {
                    var message = {
                        index: messages.length,
                        type: 'warning',
                        text: text,
                        parameters: params
                    };
                    messages.push(message);
                    if (parameters.warningEnabled) {
                        filteredMessages.push(message);
                    }
                };

                /**
                 * Notify a danger message
                 * @method danger
                 * @param text
                 * @param params
                 */
                this.danger = function(text, params) {
                    var message = {
                        index: messages.length,
                        type: 'danger',
                        text: text,
                        parameters: params
                    };
                    messages.push(message);
                    if (parameters.dangerEnabled) {
                        filteredMessages.push(message);
                    }
                };

                /**
                 * Notify a danger/error message (alias)
                 * @method error
                 * @param text
                 * @param parameters
                 */
                this.error = this.danger;

                /**
                 * Create a modal window to display an error
                 * @method notifyError
                 * @param error
                 */
                this.notifyError = function(error) {
                    $timeout(function() {
                        var modalInstance = $modal.open({
                            templateUrl: 'components/message-notifier/message-notifier-popup.html',
                            controller: ['$scope', '$modalInstance', 'error', errorNotificationController],
                            resolve: {
                                error: function() {
                                    return error;
                                }
                            }
                        });
                        // Handle result
                        modalInstance.result.then(function() {
                            // Nothing to do
                        });
                    });
                };

                /**
                 * Create a modal window to display a warning message
                 * @method notifyWarning
                 * @param warning
                 */
                this.notifyWarning = function(warning) {
                    $timeout(function() {
                        var modalInstance = $modal.open({
                            templateUrl: 'components/message-notifier/message-notifier-popup.html',
                            controller: ['$scope', '$modalInstance', 'warning', warningNotificationController],
                            resolve: {
                                warning: function() {
                                    return warning;
                                }
                            }
                        });
                        // Handle result
                        modalInstance.result.then(function() {
                            // Nothing to do
                        });
                    });
                };
            }
        ]);

        return messageNotifierServices;
    }
);