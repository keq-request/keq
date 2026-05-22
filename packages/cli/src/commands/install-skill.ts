import { Command } from 'commander'

export function registerInstallSkillCommand(program: Command): void {
  program
    .command('install-skill')
    .description('Install predefined Claude Code skill files into .claude/skills/')
    .action(async () => {
      const { installSkill } = await import('../install-skill.js')
      await installSkill()
    })
}
