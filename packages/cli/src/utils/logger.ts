import chalk from 'chalk'


export const logger = {
  log: (str: string) => console.log(chalk.green(str)),
  warn: (str: string) => console.warn(chalk.yellow(str)),
  error: (str: string) => console.error(chalk.red(str)),
}
