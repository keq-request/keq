import type { Config } from 'jest'


export default (): Config => ({
  projects: [
    'packages/keq',
    'packages/cli',
    'packages/exception',
    'packages/headers',
    'packages/url',
    'packages/cache',
    'packages/nestjs',
  ],
})
