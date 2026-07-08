import { CONFIG_FILENAMES } from '~/constants/index.js'

export class ConfigNotFoundException extends Error {
  constructor(searchDir: string) {
    const filenames = CONFIG_FILENAMES.map((f) => `  - ${f}`).join('\n')
    super(
      'Cannot find keq config file.\n\n'
      + `Searched from: ${searchDir}\n\n`
      + `Expected one of:\n${filenames}\n\n`
      + 'To create a config file, run: keq init\n'
      + 'Or specify an explicit path with: --config <path>',
    )
    this.name = 'ConfigNotFoundException'
  }
}
