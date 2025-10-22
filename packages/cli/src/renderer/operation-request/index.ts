import { OperationDefinition } from '~/tasks/utils/operation-definition.js'
import { typeNameFactory } from '../operation-type/index.js'


export function operationRequestRenderer(operationDefinition: OperationDefinition): string {
  const { operation, operationId, method, pathname } = operationDefinition

  if (!operation.responses) return ''

  const typeName = typeNameFactory(operationDefinition)
  const moduleName = operationDefinition.module.name


  return [
    `const method = "${method}"`,
    `const pathname = "${pathname}"`,
    '',
    `export function ${operationId}<STATUS extends keyof ${typeName('ResponseBodies')}>(args?: ${typeName('RequestParameters')}): Keq<${typeName('ResponseBodies')}[STATUS], Operation<STATUS>> {`,
    `  const req = request.post<${typeName('ResponseBodies')}[STATUS]>("${pathname}")`,
    '    .option(\'module\', {',
    `      name: "${moduleName}",`,
    '      pathname,',
    '      method',
    '    })',
    '',
    '  return req',
    '}',
    '',
    `${operationId}.pathname = pathname`,
    `${operationId}.method = method`,
  ].join('\n')
}
