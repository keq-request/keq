/**
 * File naming style options
 */
export enum FileNamingStyle {
  /** Raw style - keeps the original name without any transformation */
  raw = 'raw',
  /** Camel case style (e.g., myFileName) */
  camelCase = 'camelCase',
  /** Capital case style (e.g., My File Name) */
  capitalCase = 'capitalCase',
  /** Constant case style (e.g., MY_FILE_NAME) */
  constantCase = 'constantCase',
  /** Dot case style (e.g., my.file.name) */
  dotCase = 'dotCase',
  /** Header case style (e.g., My-File-Name) */
  headerCase = 'headerCase',
  /** No case style (e.g., my file name) */
  noCase = 'noCase',
  /** Param case style (e.g., my-file-name) */
  paramCase = 'paramCase',
  /** Pascal case style (e.g., MyFileName) */
  pascalCase = 'pascalCase',
  /** Path case style (e.g., my/file/name) */
  pathCase = 'pathCase',
  /** Sentence case style (e.g., My file name) */
  sentenceCase = 'sentenceCase',
  /** Snake case style (e.g., my_file_name) */
  snakeCase = 'snakeCase',
  /** Kebab case style (e.g., my-file-name) */
  kebabCase = 'kebabCase',
}
