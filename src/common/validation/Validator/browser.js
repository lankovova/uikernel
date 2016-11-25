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

var Validator = require('./common');
var ValidationErrors = require('../ValidationErrors');
var defaultXhr = require('../../defaultXhr');
var toPromise = require('../../toPromise');
var callbackify = require('../../callbackify');

/**
 * Get validator.
 *
 * @param {string}  serverValidationUrl
 * @param {Object}  xhr
 *
 * @return {Validator}
 * @type {Module}
 */
var ClientValidator = function (serverValidationUrl, xhr) {
  if (!(this instanceof ClientValidator)) {
    return new ClientValidator(serverValidationUrl, xhr);
  }

  Validator.call(this);
  this._settings.serverValidationUrl = serverValidationUrl;
  this._settings.xhr = xhr || defaultXhr;
};

ClientValidator.prototype = Object.create(Validator.prototype);
ClientValidator.prototype.constructor = ClientValidator;

ClientValidator.prototype.isValidRecord = callbackify(async function (record) {
    if (!this._settings.serverValidationUrl) {
      return Validator.prototype.isValidRecord.call(this, record);
    }

    var xhrResult;
    var validationErrors;
    var body;

    try {
      xhrResult = await toPromise(this._settings.xhr.bind(this._settings))({
        method: 'POST',
        headers: {'Content-type': 'application/json'},
        body: JSON.stringify(record),
        uri: this._settings.serverValidationUrl
      });
    } catch (err) {
      if (err.statusCode === 413) {
        // When request exceeds server limits and
        // client validators are able to find errors,
        // we need to return these errors
        validationErrors = await toPromise(Validator.prototype.isValidRecord).call(this, record);
        if (!validationErrors.isEmpty()) {
          return validationErrors;
        }
      }
      throw err;
    }

    body = JSON.parse(xhrResult);

    return ValidationErrors.createFromJSON(body);

  }
);

module.exports = ClientValidator;
