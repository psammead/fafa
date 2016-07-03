'use strict';

/**
 * REST API managing the themes access
 * @module Theme Manager
 * @class ThemeManager
 * @constructor
 */
function ThemeManager() {

    var path = require('path'),
        fs = require('fs'),
        _ = require('lodash'),
        util = require('util');

    var ADDONS_PATH = path.join(process.env.ROOT, 'client', 'addons'),
        THEMES_DIRECTORY_NAME = 'themes',
        CSS_DIRECTORY_NAME = 'css',
        DESCRIPTOR_NAME = 'themes.json',
        securityLogger = require(path.join(process.env.ROOT, 'server', 'logger', 'security-logger'));

    var themes = null;
    var themesCSSFileNames = null;

    //Returns whether a path denote a directory
    var isDirectory = function(currentPath) {
        return fs.statSync(currentPath).isDirectory();
    };

    //Returns whether a path denote a valid addon directory (i.e. exclude lib, bower_components and example)
    var isValidAddonDirectory = function(currentPath) {
        var blacklistedDirectories = ['lib', 'bower_components'];
        return isDirectory(currentPath) && blacklistedDirectories.indexOf(path.basename(currentPath)) === -1;
    };

    //Returns whether a path has a themes directory
    var hasThemesDirectory = function(currentPath) {
        var dir = path.join(currentPath, THEMES_DIRECTORY_NAME);
        return fs.existsSync(dir) && isDirectory(dir);
    };

    var hasCSSDirectory = function(currentPath) {
        var dir = path.join(currentPath, CSS_DIRECTORY_NAME);
        return fs.existsSync(dir) && isDirectory(dir);
    };

    //Returns whether a directory has a theme descriptor
    var hasThemeDescriptor = function(currentPath) {
        return fs.existsSync(path.join(currentPath, DESCRIPTOR_NAME));
    };

    //Browse addons for themes descriptors
    var browseAddons = function() {
        var extension = 'css';
        fs.readdirSync(ADDONS_PATH).forEach(function(file) {
            var addonPath = path.join(ADDONS_PATH, file);

            if (isValidAddonDirectory(addonPath) && hasThemesDirectory(addonPath)) {
                var addonThemes = path.join(addonPath, THEMES_DIRECTORY_NAME);

                // tracking activities for security purpose
                securityLogger.logTheme(null, util.format('Browse all themes (path:%s)', addonThemes));

                fs.readdirSync(addonThemes).forEach(function(_file) {
                    var addonThemePath = path.join(addonThemes, _file);

                    if (hasThemeDescriptor(addonThemePath)) {
                        var descriptor = require(path.join(addonThemePath, DESCRIPTOR_NAME));
                        if (!themes) {
                            themes = [];
                        }
                        if (descriptor instanceof Array) {
                            themes = themes.concat(descriptor);
                        } else {
                            themes.push(descriptor);
                        }
                        if (hasCSSDirectory(addonThemePath)) {
                            if (!themesCSSFileNames) {
                                themesCSSFileNames = {};
                            }
                            themesCSSFileNames[_file] = _.filter(fs.readdirSync(path.join(addonThemePath, CSS_DIRECTORY_NAME)), function(f) {
                                return f.substr(-extension.length).toLowerCase() === extension;
                            });
                        }
                    }
                });
            }
        });
    };

    /**
     * Returns all themes descriptors under the addons directory
     * @return {Array} All theme descriptors
     */
    this.getThemes = function(req, res) {
        // tracking activities for security purpose
        securityLogger.logTheme(req, 'All themes has been accessed');

        if (!themes) {
            //browseAddons();
        }

        res.status(200).send(themes);
    };

    /**
     * Returns a theme descriptor with a given id else 404
     * @return {Object} theme descriptor if it exists else 404
     */
    this.getThemeById = function(req, res) {
        // tracking activities for security purpose
        securityLogger.logTheme(req, util.format('Theme %s has been accessed', req.params.themeId));

        if (!themes) {
            //browseAddons();
        }

        var theme = _.find(themes, {
            'themeId': req.params.themeId
        });

        if (theme) {
            res.status(200).send(theme);
        } else {
            res.status(404).send('Not found');
        }
    };

    /**
     * Returns a list of CSS filenames for a theme with a given id
     * @return {Object} list of CSS filenames
     */
    this.getThemeCSS = function(req, res) {
        // tracking activities for security purpose
        securityLogger.logTheme(req, util.format('Theme %s has been accessed', req.params.themeId));

        if (!themes) {
            browseAddons();
        }

        var theme = _.find(themes, {
            'themeId': req.params.themeId
        });

        if (theme && themesCSSFileNames) {
            res.status(200).send(themesCSSFileNames[theme.themeId]);
        } 
    };

}

module.exports = new ThemeManager();
