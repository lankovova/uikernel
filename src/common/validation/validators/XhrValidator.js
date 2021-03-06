/**
 * Copyright (с) 2015-present, SoftIndex LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import defaultXhr from '../../defaultXhr';
import ValidationErrors from '../ValidationErrors';

class XhrValidator {
  /**
   * Get validator.
   *
   * @param {string}        validationUrl
   * @param {Validator}     validator
   * @param {{}}      xhr
   *
   * @return {Validator}
   */
  constructor(validationUrl, validator, xhr) {
    this._validationUrl = validationUrl;
    this._validator = validator;
    this._xhr = xhr || defaultXhr;
  }

  static create(validationUrl, validator, xhr) {
    return new XhrValidator(validationUrl, validator, xhr);
  }

  async isValidRecord(record) {
    let xhrResult;
    try {
      xhrResult = await this._xhr({
        method: 'POST',
        headers: {
          'Content-type': 'application/json'
        },
        body: JSON.stringify(record),
        uri: this._validationUrl
      });
    } catch (err) {
      if (err.statusCode === 413) {
        // When request exceeds server limits and
        // client validators are able to find errors,
        // we need to return these errors
        const validationErrors = await this._validator.isValidRecord(record);
        if (!validationErrors.isEmpty()) {
          return validationErrors;
        }
      }
      throw err;
    }

    return ValidationErrors.createFromJSON(JSON.parse(xhrResult));
  }

  getValidationDependency(fields) {
    return this._validator.getValidationDependency(fields);
  }
}

export default XhrValidator;
