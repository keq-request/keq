import * as changeCase from 'change-case'
import Handlebars from 'handlebars'


Handlebars.registerHelper('h__change-case', (fileNamingStyle: string, filename: string) => changeCase[fileNamingStyle](filename))
