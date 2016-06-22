define([
        'angular',
        'angularCache',
        'components/theme-config/theme-config-services'
    ],
    function(angular) {
        'use strict';
        var themeConfigApp = angular.module('themeConfig', ['themeConfigServices', 'angular-data.DSCacheFactory']);
        themeConfigApp.run(['$http', 'DSCacheFactory', function($http, DSCacheFactory) {

            DSCacheFactory('themeCache', { // jshint ignore:line
                maxAge: 3600000, // cache expire after 60 minutes.
                deleteOnExpire: 'aggressive' // Items will be deleted from this cache right when they expire.
            });
        }]);
        return themeConfigApp;
    });
