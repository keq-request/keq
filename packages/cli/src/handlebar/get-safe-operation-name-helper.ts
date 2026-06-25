

import * as Handlebars from 'handlebars'
import { getSafeOperationName } from '../utils/get-safe-operation-name.js'


Handlebars.registerHelper('h__get-safe-operation-name', getSafeOperationName)
