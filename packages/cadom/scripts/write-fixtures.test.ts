/**
 * Regenerates binary fixtures under fixtures/cadom/.
 * `pnpm --filter @opencad/cadom exec vitest run scripts/write-fixtures.test.ts`
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, it } from 'vitest'
import { encode } from '../src/codec.ts'
import { exampleA, exampleB, exampleC } from '../src/examples.ts'

const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', 'fixtures', 'cadom')

describe('write SPEC-10 binary fixtures', () => {
  it('writes example A/B/C .cadom', () => {
    mkdirSync(outDir, { recursive: true })
    const files: Array<[string, ReturnType<typeof exampleA>]> = [
      ['example-a-three-level-assembly.cadom', exampleA()],
      ['example-b-visibility-override.cadom', exampleB()],
      ['example-c-passthrough-extension.cadom', exampleC()],
    ]
    for (const [name, doc] of files) {
      writeFileSync(join(outDir, name), encode(doc))
    }
  })
})
