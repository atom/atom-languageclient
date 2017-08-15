module.exports = {
  'extends': [
    'fbjs-opensource',
    'prettier',
  ],
  'plugins': [
    'flowtype',
    'prettier',
  ],
  'rules': {
    'babel/no-await-in-loop': 0,
    'camelcase': 0,
    'flowtype/no-weak-types': 0,
    'no-new': 0,
    'linebreak-style': 0,
    'prettier/prettier': [1, {
      'bracketSpacing': false,
      'jsxBracketSameLine': true,
      'parser': 'flow',
      'printWidth': 120,
      'singleQuote': true,
      'trailingComma': 'all',
    }],
  },
};
