import Handlebars from 'handlebars'
import * as R from 'ramda'
import { dropLastArguments } from '../utils/drop-last-arguments.js'


Handlebars.registerHelper('h__ref-name', dropLastArguments(R.curry((ref: string) => R.last(ref.split('/')))))
