/**
 * Copyright (с) 2015, SoftIndex LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule UIKernel
 */

'use strict';

var url = require('url');
var defaultXhr = require('../common/defaultXhr');
var toPromise = require('../common/toPromise');
var callbackify = require('../common/callbackify');

/**
 * Simple list client model which works via XMLHttpRequest
 *
 * @param {string}    apiURL  API address for list model interaction
 * @param {Function}  [xhr]   XHR wrapper
 * @constructor
 */
function ListXMLHttpRequestModel(apiURL, xhr) {
  this._apiURL = apiURL;
  this._xhr = xhr || defaultXhr;
  this._apiUrl = apiURL
    .replace(/([^/])\?/, '$1/?') // Add "/" before "?"
    .replace(/^[^?]*[^/]$/, '$&/'); // Add "/" to the end
}

/**
 * Get model data
 *
 * @param {string}    search  List search query
 * @param {Function}  cb      CallBack function
 */
ListXMLHttpRequestModel.prototype.read = callbackify(async function (search) {
  var parsedUrl = url.parse(this._apiUrl, true);
  delete parsedUrl.search;
  if (search) {
    parsedUrl.query.v = search;
  }

  var body = await toPromise(this._xhr.bind(this))({
    method: 'GET',
    headers: {
      'Content-type': 'application/json'
    },
    uri: url.format(parsedUrl)
  });

  body = JSON.parse(body);

  return body;
});

/**
 * Get option name using ID
 *
 * @param {*}         id  Option ID
 * @param {Function}  cb  CallBack function
 */
ListXMLHttpRequestModel.prototype.getLabel = callbackify(async function (id) {
  var parsedUrl = url.parse(this._apiUrl, true);
  parsedUrl.pathname = url.resolve(parsedUrl.pathname, 'label/' + JSON.stringify(id));

  var body = await toPromise(this._xhr.bind(this))({
    method: 'GET',
    headers: {
      'Content-type': 'application/json'
    },
    uri: url.format(parsedUrl)
  });

  body = JSON.parse(body);

  return body;
});

module.exports = ListXMLHttpRequestModel;
