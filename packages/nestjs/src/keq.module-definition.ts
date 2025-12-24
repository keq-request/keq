
import { ConfigurableModuleBuilder } from '@nestjs/common'
import { KeqModuleOptions } from './types/keq-module-options'


export const {
  ConfigurableModuleClass: KeqModuleClass,
  MODULE_OPTIONS_TOKEN,
  OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<KeqModuleOptions>().build()
