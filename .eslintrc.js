module.exports = {
  'extends': [
    'fbjs-opensource',
  ],
  'plugins': [
    'flowtype',
  ],
  'rules': {
    'babel/no-await-in-loop': 0,
    'camelcase': 0,
    'flowtype/no-weak-types': 0,
    'flowtype/object-type-delimiter': 0,
    'max-len': [2, 160],
    'no-new': 0,
    'linebreak-style': 0,
  },
};
