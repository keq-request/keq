/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import * as changeCase from 'change-case'
import * as Handlebars from 'handlebars'


Handlebars.registerHelper('h__change-case', (fileNamingStyle: string, filename: string) => changeCase[fileNamingStyle](filename))
