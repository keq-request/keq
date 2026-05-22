import { Command } from 'commander'

export function registerMockCommand(program: Command): void {
  program
    .command('mock')
    .description('Start a mock server based on OpenAPI specifications')
    .option('-c --config <config>', 'The keq-cli config file')
    .option('-p --port <port>', 'Port to listen on', '3939')
    .option('--host <host>', 'Host to bind to', 'localhost')
    .option('--module <modules...>', 'Filter module(s) to mock')
    .option('--cors', 'Enable CORS headers', true)
    .option('--delay <delay>', 'Response delay in ms (or min-max range like "100-500")')
    .option('--max-depth <depth>', 'Max schema depth for mock data generation', '10')
    .option('--ref-depth <depth>', 'Max $ref recursion depth for circular schemas', '5')
    .option('--debug', 'Print debug information')
    .option('--tolerant', 'Tolerate wrong swagger/openapi structure')
    .action(async (options) => {
      const { mockCommand } = await import('../mock/mock-command.js')
      await mockCommand(options)
    })
}
