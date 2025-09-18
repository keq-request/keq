const buka = require('@buka/eslint-config')


module.exports = [
  {
    ignores: ['dist'],
  },
  ...buka.typescript.recommended,
]
