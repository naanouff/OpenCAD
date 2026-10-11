import { runBatch } from './kernel-batch.mjs'

export type OcctKernelModule = {
  HEAPU8: Uint8Array
  HEAP32: Int32Array
  UTF8ToString(ptr: number): string
  _malloc(size: number): number
  _free(ptr: number): void
  _occt_free(ptr: number): void
  _occt_make_box(dx: number, dy: number, dz: number): number
  [key: string]: unknown
}

/** Load occt-kernel.wasm (run `pnpm fetch:occt` first). */
export async function chargerKernel(): Promise<OcctKernelModule> {
  const factory = (await import('../occt/occt-kernel.js')).default as (options?: {
    locateFile?: (path: string) => string
  }) => Promise<OcctKernelModule>
  const wasmUrl = new URL('../occt/occt-kernel.wasm', import.meta.url).href
  return factory({
    locateFile: (fichier) => (fichier.endsWith('.wasm') ? wasmUrl : fichier),
  })
}

export { runBatch }
