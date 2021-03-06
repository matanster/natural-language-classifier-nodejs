/**
 * Copyright 2015 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

var express    = require('express'),
  app          = express(),
  bluemix      = require('./config/bluemix'),
  extend       = require('util')._extend,
  NLClassifier = require('./natural-language-classifier');

// Bootstrap application settings
require('./config/express')(app);

// if bluemix credentials exists, then override local
var credentials = extend({
  url : '<url>',
  username : '<username>',
  password : '<password>',
  classifier_id: '<classifier-id>' // pre-trained classifier
}, bluemix.getServiceCreds('natural_language_classifier')); // VCAP_SERVICES


// Create the service wrapper
var nlClassifier = new NLClassifier(credentials);

// render index page
app.get('/', function(req, res) {
  res.render('index');
});

app.post('/', function(req, res, next) {
  nlClassifier.classify(req.body, function(err, results) {
    if (err)
      return next(err);
    else
      res.json(results);
  });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.code = 404;
  err.message = 'Not Found';
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  var error = {
    code: err.code || 500,
    error: err.message || err.error
  };
  console.log('error:', error);

  res.status(error.code).json(error);
});

var port = process.env.VCAP_APP_PORT || 3000;
app.listen(port);
console.log('listening at:', port);
