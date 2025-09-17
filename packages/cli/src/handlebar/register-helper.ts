import './change-case-helper.js'
import './get-safe-operation-name-helper.js'
import './dereference-helper.js'
import './is-ref-helper.js'
import './json-path-helper.js'
import './newline-helper.js'
import './or-helper.js'
import './ref-name-helper.js'
import './regexp-helper.js'
import './stringify-helper.js'
import './indent-helper.js'
import './is-local-ref-name-helper.js'

import * as Handlebars from 'handlebars'
import * as HandlebarsRamdaHelpers from 'handlebars-ramda-helpers'

HandlebarsRamdaHelpers.register(Handlebars)
