define([
        'angular',
        'components/main/main-controllers'
    ],
    function (angular) {
        'use strict';
        console.log("module main");
        var mainApp = angular.module('main', ['mainControllers']);
        return mainApp;
    });