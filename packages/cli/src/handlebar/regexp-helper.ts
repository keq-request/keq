import * as Handlebars from 'handlebars'

Handlebars.registerHelper('h__regexp', (str, options: Handlebars.HelperOptions) => new RegExp(str, options.hash.flags))
