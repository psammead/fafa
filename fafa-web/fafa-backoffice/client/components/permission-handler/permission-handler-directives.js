/**
 * Permission handler directive
 */

define([
        'angular',
        'lodash',
        'components/permission-handler/permission-handler-services',
        'components/user-preferences/user-preferences-services'
    ],
    function(angular, _) {
        'use strict';
        var permissionHandlerDirectives = angular.module('permissionHandlerDirectives', ['permissionHandlerServices', 'userPreferencesServices']);

        /**
         * Allow to hide HTML content based on user's permissions (tag version)
         */
        permissionHandlerDirectives.directive('hasPermission', ['permissionHandlerService',
            function(permissionHandlerService) {
                return {
                    restrict: 'E',
                    transclude: true,
                    link: function(scope, iElement, iAttrs, controller, transclude) {
                        var permissions = iAttrs.values || '';
                        var transclusionScope;

                        try { //Allow use of array of permissions as parameter (JSON format)
                            var parsed = angular.fromJson(permissions);
                            _.isArray(parsed) ? permissions = parsed.join(',') : angular.noop();
                        }
                        catch (e) {} //if parsing error, use the original parameter

                        if (permissions && !permissionHandlerService.hasPermission(permissions)) {
                            iElement.remove();
                        }
                        else {
                            transclude(function(clone, scope) {
                                iElement.replaceWith(clone);
                                transclusionScope = scope;
                            });
                        }

                        scope.$on('$destroy', function() { //should also destroy the associated transclusion scope
                            transclusionScope ? transclusionScope.$destroy() : angular.noop();
                        });
                    }
                };
            }
        ]);

        /**
         * Allow to hide HTML content based on user's permissions (attribute version)
         */
        permissionHandlerDirectives.directive('hasPermission', ['permissionHandlerService',
            function(permissionHandlerService) {

                return {
                    restrict: 'A',
                    link: function(scope, iElement, iAttrs) {
                        var permissions = iAttrs.hasPermission || '';

                        //Allow use of array of permissions as parameter (JSON format)
                        try {
                            var parsed = angular.fromJson(permissions);
                            _.isArray(parsed) ? permissions = parsed.join(',') : angular.noop();
                        }
                        catch (e) {} //if parsing error, use the original parameter

                        if (permissions && !permissionHandlerService.hasPermission(permissions)) {
                            iElement.remove();
                        }
                        else {
                            iElement.removeAttr('has-permission');
                            iElement.removeAttr('data-has-permission');
                        }
                    }
                };
            }
        ]);

        /**
         * Allow to hide HTML content based on user's permissions (tag version)
         */
        permissionHandlerDirectives.directive('hasRole', ['permissionHandlerService', 'userPreferencesService',
            function(permissionHandlerService, userPreferencesService) {
                return {
                    restrict: 'E',
                    transclude: true,
                    link: function(scope, iElement, iAttrs, controller, transclude) {
                        var roles = iAttrs.values || [];
                        var transclusionScope;

                        try { //Allow use of array of permissions as parameter (JSON format)
                            var parsed = angular.fromJson(roles);
                            _.isArray(parsed) ? roles = parsed : roles = parsed.toString().split(',');
                        }
                        catch (e) { //if parsing error, process the parameter as a simple string
                            roles = roles.split(',');
                        }

                        var user = userPreferencesService.getUser();

                        if (roles.length > 0 && _.intersection(user.roles, roles).length === 0) {
                            iElement.remove();
                        }
                        else {
                            transclude(function(clone, scope) {
                                iElement.replaceWith(clone);
                                transclusionScope = scope;
                            });
                        }

                        scope.$on('$destroy', function() { //should also destroy the associated transclusion scope
                            transclusionScope ? transclusionScope.$destroy() : angular.noop();
                        });
                    }
                };
            }
        ]);

        /**
         * Allow to hide HTML content based on user's roles (attribute version)
         */
        permissionHandlerDirectives.directive('hasRole', ['userPreferencesService',
            function(userPreferencesService) {
                return {
                    restrict: 'A',
                    link: function(scope, iElement, iAttrs) {
                        var roles = iAttrs.hasRole || [];

                        try { //Allow use of array of roles as parameter (JSON format)
                            var parsed = angular.fromJson(roles);
                            _.isArray(parsed) ? roles = parsed : roles = parsed.toString().split(',');
                        }
                        catch (e) { //if parsing error, process the parameter as a simple string
                            roles = roles.split(',');
                        }

                        var user = userPreferencesService.getUser();

                        if (roles.length > 0 && _.intersection(user.roles, roles).length === 0) {
                            iElement.remove();
                        }
                        else {
                            iElement.removeAttr('has-role');
                            iElement.removeAttr('data-has-role');
                        }
                    }
                };
            }
        ]);

        return permissionHandlerDirectives;
    });