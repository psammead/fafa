/**
 * Main controller
 * This module will apply some style to the main page (user preference,...)
 */

define([
        'angular',
        'components/user-preferences/user-preferences-services'        
    ],
    function(angular) {
        'use strict';
        return angular.module('mainControllers', ['userPreferencesServices']).
        controller('mainController',  ['$scope', '$window', 'userPreferencesService',
            function($scope, $window, userPreferencesService) {
                // this option turn on/off the workspace manager in the main page
            $scope.showWorkspaceManager = userPreferencesService.getShowWorkspaceManager();

            var wks = userPreferencesService.getInitialWorkspace();

            if (wks) {
                $window.location.href = '/workspaces/' + wks;
            }

        }]);
    });
