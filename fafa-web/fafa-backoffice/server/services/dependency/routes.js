/*
    Dependency Routes
*/

'use strict';

var dependency = require('./dependency');
var api =  '/dependency';

module.exports = function(app) {

    // Note: we do not uses console.log here to keep these message after minification
    // process.stdout.write('- REST API: Dependency Management...\n');
    // process.stdout.write(util.format('\t- GET %s\n', api));

    // Return a list of all dependency
    app.get(api, dependency.getDependencies);

};
