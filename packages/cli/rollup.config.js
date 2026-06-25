// rollup.config.js
import { string } from 'rollup-plugin-string';

export default function getRollupOptions(options) {
  const { plugins = [] } = options;

  return {
    ...options,
    plugins: [
      string({ include: '**/*.hbs' }),
      ...plugins
    ]
  };
}
