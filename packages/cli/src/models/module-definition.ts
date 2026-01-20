import { Address } from '~/types/address.js'


export class ModuleDefinition {
  name: string
  address: Address

  constructor(name: string, address: string | Address) {
    this.name = name

    if (typeof address === 'string') {
      this.address = { url: address, headers: {}, encoding: 'utf8' }
    } else {
      this.address = address
    }
  }

  static unknown(): ModuleDefinition {
    return new ModuleDefinition('', { url: '', headers: {}, encoding: 'utf8' })
  }
}
