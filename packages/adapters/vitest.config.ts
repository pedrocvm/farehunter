import { defineConfig } from 'vitest/config'
import { existsSync } from 'fs'
import { dirname, resolve, isAbsolute } from 'path'
import { fileURLToPath } from 'url'
import type { Plugin } from 'vite'

function jsToTs(): Plugin {
  return {
    name: 'js-to-ts',
    resolveId(id: string, importer?: string) {
      if (!id.endsWith('.js') || !importer) return null
      const base = id.slice(0, -3)
      const candidate = isAbsolute(base) ? `${base}.ts` : resolve(dirname(importer), `${base}.ts`)
      return existsSync(candidate) ? candidate : null
    },
  }
}

const root = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [jsToTs()],
  resolve: {
    alias: {
      '@farehunter/core': resolve(root, '../core/src/index.ts'),
    },
  },
  test: {
    environment: 'node',
  },
})
