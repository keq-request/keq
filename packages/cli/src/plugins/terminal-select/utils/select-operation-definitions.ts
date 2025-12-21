import { ListrTaskWrapper } from 'listr2'
import { OperationDefinition } from '~/models/index.js'
import { select } from 'inquirer-select-pro'
import { ListrInquirerPromptAdapter } from '@listr2/prompt-adapter-inquirer'
import { CompilerContext } from '~/compiler/index.js'

export async function selectOperationDefinitions(
  task: ListrTaskWrapper<CompilerContext, any, any>,
  operationDefinitions: OperationDefinition[],
): Promise<OperationDefinition[]> {
  const selectedOperationDefinitions = await task.prompt(ListrInquirerPromptAdapter).run(
    select<OperationDefinition>,
    {
      message: 'Select Pathname',
      defaultValue: [],
      options: (input) => {
        const items = operationDefinitions.map((op) => ({ name: `${op.module.name} ${op.method.toUpperCase()} ${op.pathname}`, value: op }))

        if (!input) return items
        const keys = input
          .trim()
          .toLowerCase()
          .split(/\s+/)

        return items.filter((i) => {
          const name = i.name.toLowerCase()
          return keys.every((q) => name.includes(q))
        })
      },
    },
  )

  return selectedOperationDefinitions
}
