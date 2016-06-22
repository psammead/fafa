/*
    Server Routes
*/

'use strict';

/**
 * Application routes
 */

var index = require('./index');

module.exports = function(app) {

  //Authentication
  require('./authentication/routes')(app);

  //REST API Routing
  require('./services/routes')(app);

  // All other routes to use Angular routing in app/scripts/app.js
  app.get('/partials/*', index.partials);
  app.get('/*', index.index);
};