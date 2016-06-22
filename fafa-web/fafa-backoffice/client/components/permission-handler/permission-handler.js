define([
        'angular',
        'components/permission-handler/permission-handler-directives',
        'components/permission-handler/permission-handler-services'
    ],
    function (angular) {
        'use strict';
        var permissionHandler = angular.module('permissionHandler', ['permissionHandlerDirectives', 'permissionHandlerServices']);
        return permissionHandler;
    });