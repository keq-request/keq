// rollup.config.js
import { typescriptPaths } from 'rollup-plugin-typescript-paths';


export default function getRollupOptions(options) {
  const { plugins = [] } = options;

  console.log(plugins)

  return {
    ...options,
    plugins: [
      typescriptPaths({
        preserveExtensions: true,
        tsConfigPath: 'tsconfig.json'
      }),
      ...plugins.filter(plugin => plugin.name !== 'dts-bundle')
    ]
  };
}
