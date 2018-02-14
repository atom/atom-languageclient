import { createRunner } from 'atom-mocha-test-runner';

const testRunner = createRunner(
  {
    htmlTitle: `atom-languageclient Tests - pid ${process.pid}`,
    reporter: process.env.MOCHA_REPORTER || 'spec',
  },
  (mocha) => {
    mocha.timeout(parseInt(process.env.MOCHA_TIMEOUT || '5000', 10));
    if (process.env.APPVEYOR_API_URL) {
      mocha.reporter(require('mocha-appveyor-reporter'));
    }
  },
);

export = function runnerWrapper(options) {
  // Replace the test path with the current path since Atom's internal runner
  // picks the wrong one by default
  options.testPaths = [__dirname];
  return testRunner(options);
};
