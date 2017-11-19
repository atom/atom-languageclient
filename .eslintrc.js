module.exports = {
  'extends': [
    'fbjs-opensource',
    'prettier',
  ],
  'plugins': [
    'flowtype',
  ],
  'rules': {
    'babel/no-await-in-loop': 0,
    'camelcase': 0,
    'flowtype/no-weak-types': 0,
    'flowtype/object-type-delimiter': 0,
    'no-new': 0,
    'linebreak-style': 0,
  },
};
