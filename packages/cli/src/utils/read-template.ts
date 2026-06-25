import * as fs from 'fs-extra'
import * as path from 'path'


export function readTemplate(filename: string): string {
  return fs.readFileSync(path.join(__dirname, `../templates/${filename}.hbs`), 'utf-8')
}
