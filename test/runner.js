const { TestRunnerParams } = require("atom");
const { createRunner } = require('@atom/mocha-test-runner');

module.exports = createRunner({
    htmlTitle: `atom-languageclient Tests - pid ${process.pid}`,
    reporter: process.env.MOCHA_REPORTER || 'list',
  },
  (mocha) => {
    mocha.timeout(parseInt(process.env.MOCHA_TIMEOUT || '5000', 10));
    if (process.env.APPVEYOR_API_URL) {
      mocha.reporter(require('mocha-appveyor-reporter'));
    }
  },
);
