

import * as Handlebars from 'handlebars'
import * as R from 'ramda'
import { dropLastArguments } from '../utils/drop-last-arguments.js'


Handlebars.registerHelper('h__is-local-ref-name', dropLastArguments(R.curry((ref: string) => !!ref.startsWith('#/'))))
