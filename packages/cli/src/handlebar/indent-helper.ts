import * as Handlebars from 'handlebars'


Handlebars.registerHelper('h__indent', (num, str) => {
  const indent = ' '.repeat(num)
  return str.split('\n')
    .map((line) => `${indent}${line}`)
    .join('\n')
})
