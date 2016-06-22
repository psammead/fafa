/*
    Service Routes
*/

'use strict';

module.exports = function(app) {

    var fs = require("fs");
    var path = require('path');
    var directory = path.join(process.env.ROOT, 'server', 'services');

    // Note: we do not uses console.log here to keep these message after minification
    //process.stdout.write(util.format('\nLoading dynamically all REST APIs in (%s)...\n', directory));

    fs.readdirSync(directory).forEach(function(fileName) {
        //console.log('LISTING : ' + fileName);
        if (fs.statSync(path.join(directory, fileName)).isDirectory()) {
            // require(directory + fileName + '/routes')(app);
            require('./' + fileName + '/routes')(app);
        }
    });
};
