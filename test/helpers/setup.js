/* global beforeEach */

const chai = require('chai')
const sinon = require('sinon')
global.expect = chai.expect

// eslint-disable-next-line jasmine/no-global-setup
beforeEach(function() {
  global.sinon = sinon.sandbox.create();
});

// eslint-disable-next-line jasmine/no-global-setup
afterEach(function() {
  global.sinon.restore();
});
