import * as Handlebars from 'handlebars'

Handlebars.registerHelper('h__stringify', (value) => JSON.stringify(value, null, 2))
