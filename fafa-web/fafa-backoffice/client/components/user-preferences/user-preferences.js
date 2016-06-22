define([
        'angular',
        'angularCache',
        'components/user-preferences/user-preferences-services'
    ],
    function(angular) {
        'use strict';
        var userPreferencesApp = angular.module('userPreferences', ['userPreferencesServices', 'angular-data.DSCacheFactory']);
        userPreferencesApp.run(['$http', 'DSCacheFactory', function($http, DSCacheFactory) {

            DSCacheFactory('userPreferencesCache', { // jshint ignore:line
                maxAge: 3600000, // cache expire after 60 minutes.
                deleteOnExpire: 'aggressive' // Items will be deleted from this cache right when they expire.
            });
        }]);
        return userPreferencesApp;
    });
