'use strict';

/**
 * REST API managing module dependencies
 * @module Dependency Manager
 * @class DependencyManager
 * @constructor
 */
function DependencyManager() {

    // Return the list of dependencies(for requireJS)
    this.getDependencies = function(req, res) {
        var fs = require("fs"),
            path = require('path');

        var CLIENT_DIRECTORY = path.join(process.env.ROOT, 'client'),
            COMPONENTS_DIRECTORY = path.join(process.env.ROOT, 'client', 'components'),
            COMPONENTS_MAX_DEPTH = 2,
            ADDONS_MAX_DEPTH = 3;

        // COMMONS_DIRECTORY = path.join('client', 'commons');

        var commonsDirectory = path.join(process.env.ROOT, 'client', 'commons');

        var dependencyJSON = {};
        var scriptList = [];
        var moduleList = [];

        //Scan modules under commons -- Kept for compatibility
        //FIXME Any directory under commons is considered as an angular module. Different convention ...
        fs.readdirSync(commonsDirectory).forEach(function(fileName) {
            if (fs.statSync(path.join(commonsDirectory, fileName)).isDirectory()) {
                scriptList.push("commons/" + fileName + "/" + "commons-" + fileName);
                moduleList.push(("commons-" + fileName).replace(/(\-[a-z])/g, function($1) {
                    return $1.toUpperCase().replace('-', '');
                }));
            }
        });

        //Return whether a path denote a valid directory (i.e. exclude lib, bower_components and example)
        var isValidDirectory = function(currentPath) {
            var blacklistedDirectories = ['lib', 'bower_components'];
            return fs.statSync(currentPath).isDirectory() && blacklistedDirectories.indexOf(path.basename(currentPath)) === -1;
        };

        //Return whether a directory is an angular module. (i.e. convention: test the presence of a js file inside the directory having the same name as the latter)
        var isModule = function(currentPath) {
            return isValidDirectory(currentPath) && fs.existsSync(path.join(currentPath, path.basename(currentPath) + '.js'));
        };

        //Scan a directory for angular modules
        var browseDirectory = function(currentPath, maxDepth) {
            if (isModule(currentPath)) {
                var directoryName = path.basename(currentPath);

                //RequireJS path
                var script = path.relative(CLIENT_DIRECTORY, path.join(currentPath, directoryName)).split(path.sep).join('/');

                //Angular module name (name of directory camel case style)
                var module = directoryName.replace(/(\-[a-z])/g, function($1) {
                    return $1.toUpperCase().replace('-', '');
                });

                scriptList.push(script);
                moduleList.push(module);
            }

            if (maxDepth !== 0 && isValidDirectory(currentPath)) {
                fs.readdirSync(currentPath).forEach(function(file) {
                    browseDirectory(path.join(currentPath, file), maxDepth ? maxDepth - 1 : maxDepth);
                });
            }
        };

        // browseDirectory(COMMONS_DIRECTORY);
        browseDirectory(COMPONENTS_DIRECTORY, COMPONENTS_MAX_DEPTH);

        dependencyJSON.scriptList = scriptList;
        dependencyJSON.moduleList = moduleList;

        res.send(dependencyJSON);
    };
}

module.exports = new DependencyManager();
