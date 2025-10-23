import buka from '@buka/eslint-config';
import { defineConfig } from "eslint/config";


export default defineConfig([
  {
    ignores: ["**/node_modules/**", "**/dist/**"],
  },
  {
    files: ["**/*.ts"],
    extends: [buka.typescript.recommended],
  },
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
]);
