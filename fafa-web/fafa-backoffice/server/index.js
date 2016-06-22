'use strict';

var path = require('path');
var nconf = require('nconf');
var serverLogger = require('./logger/server-logger');

/**
 * Send partial, or 404 if it doesn't exist
 */
exports.partials = function(req, res) {
  var stripped = req.url.split('.')[0];
  var requestedView = path.join('./', stripped);
  res.render(requestedView, function(err, html) {
    if(err) {
      console.error("Error rendering partial '" + requestedView + "'\n", err);
      res.status(404);
      res.send(404);
    } else {
      res.send(html);
    }
  });
};

/**
 * Send our single page app
 */
exports.index = function(req, res) {
  res.render('index');
};

/**
 * Sends 404 instead of the index page
 */
exports.catchAll = function(req, res, next) {
  var disableIndexRedirect = nconf.get('disableIndexRedirect') || false;

  if (disableIndexRedirect) {
    //Heuristic: If there is an extension, we consider that this is a resource and not an Angular route. Send 404 in this case.
    if (path.extname(req.originalUrl)) {
      serverLogger.warn('Caught request ' + req.originalUrl + '. Send 404');
      res.status(404).end();
    }
    //Heuristic 2: If the URL starts by /<RESTAPI_VERSION>, we consider that this is a request for the REST API. Send 404 in this case.
    else if (req.originalUrl.indexOf('/') === 0) {
      serverLogger.warn('Caught request ' + req.originalUrl + '. Send 404');
      res.status(404).end();
    }
    //Else send index (Angular routing)
    else {
      next();
    }
  }
  else {
    next();
  }
};
