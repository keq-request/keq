const buka = require('@buka/eslint-config')
// const globals = require('globals')


module.exports = [
  {
    ignores: ['dist'],
  },
  ...buka.typescript.recommended,
  // {
  //   languageOptions: {
  //     globals: {
  //       ...globals.node,
  //     },
  //   },
  // },
]
