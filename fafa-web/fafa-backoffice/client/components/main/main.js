define([
        'angular',
        'components/main/main-controllers'
    ],
    function (angular) {
        'use strict';
        var mainApp = angular.module('main', ['mainControllers']);
        return mainApp;
    });