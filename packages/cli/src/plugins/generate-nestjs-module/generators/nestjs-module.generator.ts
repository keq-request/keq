import * as path from 'path'
import * as changeCase from 'change-case'
import { Compiler, TaskWrapper } from '~/compiler/index.js'
import { ApiDocumentV3_1, Artifact } from '~/models/index.js'
import { MetadataStorage } from '../constants/metadata-storage.js'
import { FileNamingStyle } from '~/constants/index.js'
import { Generator, RuntimeConfig } from '~/types/index.js'
import { ApiDocumentTransformer } from '~/transformers/index.js'
import { OperationDeclarationGenerator } from '~/plugins/generate-declaration/index.js'


const NESTJS_MODULE_GENERATOR = 'nestjs-module-generator'

export class NestjsModuleGenerator implements Generator {
  private generateNestjsModuleArtifact(document: ApiDocumentV3_1, rc: RuntimeConfig): Artifact {
    const filepath = NestjsModuleGenerator.getNestjsModuleArtifactFilepath(document, rc.fileNamingStyle)
    const dirname = path.dirname(filepath)

    const artifact = new Artifact({
      id: NestjsModuleGenerator.getNestjsModuleArtifactId(document),
      filepath,
      content: ApiDocumentTransformer.toNestjsModule(document, {
        esm: rc.esm,
        getNestjsClientFilepath(document) {
          const relativePath = path.relative(
            dirname,
            NestjsModuleGenerator.getNestjsClientArtifactFilepath(document, rc.fileNamingStyle),
          )

          return relativePath.startsWith('.') ? relativePath : `./${relativePath}`
        },
      }),
    })

    return artifact
  }

  private generateNestjsClientArtifact(document: ApiDocumentV3_1, rc: RuntimeConfig): Artifact {
    const filepath = NestjsModuleGenerator.getNestjsClientArtifactFilepath(document, rc.fileNamingStyle)
    const dirpath = path.dirname(filepath)

    const artifact = new Artifact({
      id: NestjsModuleGenerator.getNestjsClientArtifactId(document),
      filepath,
      content: ApiDocumentTransformer.toNestjsClient(document, {
        esm: rc.esm,
        getOperationDefinitionDeclarationFilepath(operationDefinition) {
          const relativePath = path.relative(
            dirpath,
            OperationDeclarationGenerator.getOperationDefinitionArtifactFilepath(operationDefinition, rc.fileNamingStyle),
          )

          return relativePath.startsWith('.') ? relativePath : `./${relativePath}`
        },
      }),
    })

    return artifact
  }

  async compile(compiler: Compiler, task: TaskWrapper): Promise<Artifact[]> {
    const metadata = MetadataStorage.get(compiler)!
    const rc = compiler.context.rc!
    const documents = compiler.context.documents!

    const nestjsModuleArtifacts = await Promise.all(
      documents.map((document) => metadata.hooks.afterNestjsModuleArtifactGenerated.promise(
        this.generateNestjsModuleArtifact(document, rc),
        document,
        task,
      )),
    )

    const nestjsClientArtifacts = await Promise.all(
      documents.map((document) => metadata.hooks.afterNestjsModuleArtifactGenerated.promise(
        this.generateNestjsClientArtifact(document, rc),
        document,
        task,
      )),
    )

    return [...nestjsModuleArtifacts, ...nestjsClientArtifacts]
  }

  static getNestjsModuleArtifactFilepath(document: ApiDocumentV3_1, fileNamingStyle: FileNamingStyle): string {
    const filename = `${changeCase[fileNamingStyle](document.module.name)}.module.ts`

    const filepath = [
      '.',
      changeCase[fileNamingStyle](document.module.name),
      filename,
    ]

    return filepath.join('/')
  }

  static getNestjsModuleArtifactId(document: ApiDocumentV3_1): string {
    return `${document.module.address}?generate=${NESTJS_MODULE_GENERATOR}`
  }

  static getNestjsClientArtifactFilepath(document: ApiDocumentV3_1, fileNamingStyle: FileNamingStyle): string {
    const filename = `${changeCase[fileNamingStyle](document.module.name)}.client.ts`

    const filepath = [
      '.',
      changeCase[fileNamingStyle](document.module.name),
      filename,
    ]

    return filepath.join('/')
  }

  static getNestjsClientArtifactId(document: ApiDocumentV3_1): string {
    return `${document.module.address}?generate=${NESTJS_MODULE_GENERATOR}-client`
  }
}
