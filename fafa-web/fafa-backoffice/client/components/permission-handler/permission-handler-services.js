define([
        'angular',
        'lodash',
        'commons/restapi/commons-restapi'
    ],
    function(angular, _) {
        'use strict';

        var permissionHandlerServices = angular.module('permissionHandlerServices', ['commonsRestapi']);

        permissionHandlerServices.service('permissionHandlerService', ['$http', '$q', 'restapiService', '$rootScope',
            function($http, $q, restapiService, $rootScope) {
                // User permission List object
                var userPermissions;

                // Store all permissions (DB clone) and user roles to limit server + DB access
                var allPermissions;
                var userRoles;

                this.initialize = function() {
                    userRoles = _.cloneDeep($rootScope.user.roles);

                    var deferredPermissionsByRoles = $http.get(restapiService.restapi.permissions.USER_PERMISSIONS).then(function(data) {
                        userPermissions = data.data;
                    });

                    var deferredAllPermissions = $http.get(restapiService.restapi.permissions.PERMISSIONS).then(function(data) {
                        allPermissions = data.data;
                    });

                    return $q.all([deferredPermissionsByRoles, deferredAllPermissions]);
                };

                this.hasPermission = function(values) {
                    var requestedPermissionsList = values.split(',');

                    // Boolean parameter to be returned (by default is false)
                    var hasPermissionResponse = false;

                    /*jshint -W083 */   // remove jshint Don't make functions within a loop.
                    for (var i = 0; i < requestedPermissionsList.length; i++) {
                        requestedPermissionsList[i] = requestedPermissionsList[i].split(' ');

                        // For requestedPermissionsList[i] : index 0 => operation, index 1 => object
                        // Specific treatment for operation '*' : check if user have any operation permission in the object
                        if (requestedPermissionsList[i][0] === '*') {
                            if (!_.isEmpty(_.find(userPermissions, function(permission) {
                                    return permission[1] === requestedPermissionsList[i][1];
                                }))) {
                                hasPermissionResponse = true;
                                break;
                            }
                            // Specific treatment for operation '&' : check if user have all operation permission in the object
                        } else if (requestedPermissionsList[i][0] === '&') {
                            // All current object permissions
                            var allObjectPermissions = _.filter(allPermissions, function(permission) {
                                return permission[1] === requestedPermissionsList[i][1];
                            });

                            // User current object permissions
                            var objectUserPermissions = _.filter(userPermissions, function(permission) {
                                return permission[1] === requestedPermissionsList[i][1];
                            });

                            if (_.isEmpty(_.difference(_.flatten(allObjectPermissions), _.flatten(objectUserPermissions)))) {
                                hasPermissionResponse = true;
                                break;
                            }
                        } else {
                            if (!_.isEmpty(_.where(userPermissions, [requestedPermissionsList[i][0], requestedPermissionsList[i][1]]))) {
                                hasPermissionResponse = true;
                                break;
                            }
                        }
                    }
                    /*jshint +W083 */ 

                    return hasPermissionResponse;
                };

                this.getUserRoles = function() {
                    return userRoles.slice();
                };
            }
        ]);

        return permissionHandlerServices;
    });