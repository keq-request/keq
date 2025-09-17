/* eslint-disable @typescript-eslint/no-unsafe-return */
import * as Handlebars from 'handlebars'
import * as R from 'ramda'
import { JSONPath } from 'jsonpath-plus'
import { dropLastArguments } from '../utils/drop-last-arguments.js'


Handlebars.registerHelper('h__json-path', dropLastArguments(R.curry((path, json) => JSONPath({ path, json }))))
