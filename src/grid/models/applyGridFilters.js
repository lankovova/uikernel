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

var utils = require('../../common/utils');
var callbackify = require('../../common/callbackify');
var toPromise = require('../../common/toPromise');

/**
 * Defines filter values while reading Grid model data
 *
 * @param {AbstractGridModel} model       Grid model
 * @param {Object}            filters     Filter values
 */
function applyGridFilters(model, filters) {
  return utils.decorate(model, {
    read: callbackify(function (options) {
        options.filters = filters;
        return toPromise(model.read.bind(model))(options);
      })
  });
}

module.exports = applyGridFilters;
