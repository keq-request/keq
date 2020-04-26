// const readOnly = (target: any, key: any, descriptor: any): any => ({
//   ...descriptor, writable: false, configurable: false,
// })


export default <T>(target: T, key: keyof T): void => {
  Object.defineProperty(target, key, {
    configurable: false,
    writable: false,
    enumerable: true,
  })
}
