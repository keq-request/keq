declare module 'ajv/dist/2020.js' {
  import type {
    Options,
    AnySchema,
    AnyValidateFunction,
    ErrorObject,
  } from 'ajv'

  class Ajv2020 {
    constructor(opts?: Options)
    getSchema<T = unknown>(keyRef: string): AnyValidateFunction<T> | undefined
    validateSchema(schema: AnySchema, throwOrLogError?: boolean): boolean | Promise<unknown>
    errors?: ErrorObject[] | null
  }

  export default Ajv2020
  export type { Options, AnyValidateFunction, ErrorObject }
}
