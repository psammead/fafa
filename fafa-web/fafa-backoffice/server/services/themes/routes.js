/*
 Themes Routes
 */

'use strict';

var themes = require('./themes');
var api =  '/themes';

// var path = require('path');
//var accessControl = require(path.join(process.env.ROOT, 'server', 'access-control', 'access-control'));

module.exports = function (app) {

   // Note: we do not uses console.log here to keep these message after minification
    // process.stdout.write('- REST API: Themes Management...\n');
    // process.stdout.write(util.format('\t- GET %s\n', api ));
    // process.stdout.write(util.format('\t- GET %s\n', api + '/:themeId'));
    // process.stdout.write(util.format('\t- GET %s\n', api + '/:themeId/css'));

    // SDK - Return a list of all Themes
    app.get(api, themes.getThemes);

    // SDK - Return a unique Theme using the ID
    app.get(api + '/:themeId',  themes.getThemeById);
    
    // SDK - Return a list of CSS filenames for a unique theme using the ID
    app.get(api + '/:themeId/css', themes.getThemeCSS);

};