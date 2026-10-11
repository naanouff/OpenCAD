/**
 * Sequential op batch for occt-kernel (Worker-friendly).
 * History stays out of band; this only evaluates B-Rep ops against one wasm arena.
 *
 * Ops: { op, args?, as? }
 * Handle refs in args: { handle: "alias" } or { handle: 3 }
 */

function resolveArg(arg, aliases) {
  if (arg && typeof arg === 'object' && 'handle' in arg) {
    const ref = arg.handle;
    if (typeof ref === 'string') {
      if (!aliases.has(ref)) throw new Error(`unknown alias: ${ref}`);
      return aliases.get(ref);
    }
    return ref;
  }
  return arg;
}

function resolveArgs(args, aliases) {
  return (args ?? []).map((arg) => resolveArg(arg, aliases));
}

function writeDoubles(occt, values) {
  const arr = Float64Array.from(values);
  const ptr = occt._malloc(arr.byteLength);
  occt.HEAPU8.set(new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength), ptr);
  return { ptr, count: arr.length / 3 };
}

function writeI32(occt, values) {
  const arr = Int32Array.from(values);
  const ptr = occt._malloc(arr.byteLength);
  occt.HEAPU8.set(new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength), ptr);
  return ptr;
}

function readCString(occt, ptr) {
  const text = occt.UTF8ToString(ptr);
  occt._occt_free(ptr);
  return text;
}

function tessellate(occt, handle, preset = 'normal') {
  const encoded = new TextEncoder().encode(preset);
  const presetPtr = occt._malloc(encoded.length + 1);
  occt.HEAPU8.set(encoded, presetPtr);
  occt.HEAPU8[presetPtr + encoded.length] = 0;
  const outPtr = occt._occt_tessellate(handle, presetPtr);
  occt._free(presetPtr);
  return JSON.parse(readCString(occt, outPtr));
}

function exportBytes(occt, fn, handle) {
  const lenPtr = occt._malloc(4);
  const buf = fn(handle, lenPtr);
  const length = buf ? occt.HEAP32[lenPtr >> 2] : 0;
  occt._free(lenPtr);
  if (!buf || !(length > 0)) return null;
  const bytes = occt.HEAPU8.slice(buf, buf + length);
  occt._occt_free(buf);
  return bytes;
}

/**
 * @param {import('../types/occt-kernel.d.ts').OcctKernelModule} occt
 * @param {import('../types/occt-kernel.d.ts').KernelBatchOp[]} ops
 */
export function runBatch(occt, ops) {
  const aliases = new Map();
  const results = [];
  try {
    for (const step of ops) {
      const args = resolveArgs(step.args, aliases);
      let value;
      switch (step.op) {
        case 'make_box':
          value = occt._occt_make_box(args[0], args[1], args[2]);
          break;
        case 'make_cylinder':
          value = occt._occt_make_cylinder(args[0], args[1]);
          break;
        case 'make_sphere':
          value = occt._occt_make_sphere(args[0]);
          break;
        case 'make_cone':
          value = occt._occt_make_cone(args[0], args[1], args[2]);
          break;
        case 'make_wire_polyline': {
          const { ptr, count } = writeDoubles(occt, args[0]);
          value = occt._occt_make_wire_polyline(ptr, count);
          occt._free(ptr);
          break;
        }
        case 'make_face_from_wire':
          value = occt._occt_make_face_from_wire(args[0]);
          break;
        case 'extrude':
          value = occt._occt_extrude(args[0], args[1], args[2], args[3]);
          break;
        case 'revolve':
          value = occt._occt_revolve(
            args[0],
            args[1],
            args[2],
            args[3],
            args[4],
            args[5],
            args[6],
            args[7],
          );
          break;
        case 'boolean_fuse':
          value = occt._occt_boolean_fuse(args[0], args[1]);
          break;
        case 'boolean_cut':
          value = occt._occt_boolean_cut(args[0], args[1]);
          break;
        case 'boolean_common':
          value = occt._occt_boolean_common(args[0], args[1]);
          break;
        case 'fillet_edges': {
          const indices = args[2];
          if (indices == null) {
            value = occt._occt_fillet_edges(args[0], args[1], 0, -1);
          } else {
            const ptr = writeI32(occt, indices);
            value = occt._occt_fillet_edges(args[0], args[1], ptr, indices.length);
            occt._free(ptr);
          }
          break;
        }
        case 'chamfer_edges': {
          const indices = args[2];
          if (indices == null) {
            value = occt._occt_chamfer_edges(args[0], args[1], 0, -1);
          } else {
            const ptr = writeI32(occt, indices);
            value = occt._occt_chamfer_edges(args[0], args[1], ptr, indices.length);
            occt._free(ptr);
          }
          break;
        }
        case 'list_edges':
          value = JSON.parse(readCString(occt, occt._occt_list_edges(args[0])));
          break;
        case 'list_faces':
          value = JSON.parse(readCString(occt, occt._occt_list_faces(args[0])));
          break;
        case 'tessellate':
          value = tessellate(occt, args[0], args[1] ?? 'normal');
          break;
        case 'shape_release':
          occt._occt_shape_release(args[0]);
          value = true;
          break;
        case 'arena_clear':
          occt._occt_arena_clear();
          value = true;
          break;
        case 'export_brep':
          value = exportBytes(occt, occt._occt_export_brep, args[0]);
          break;
        case 'export_step':
          value = exportBytes(occt, occt._occt_export_step, args[0]);
          break;
        case 'import_brep': {
          const bytes = args[0];
          const ptr = occt._malloc(bytes.length);
          occt.HEAPU8.set(bytes, ptr);
          value = occt._occt_import_brep(ptr, bytes.length);
          occt._free(ptr);
          break;
        }
        case 'import_step': {
          const bytes = args[0];
          const ptr = occt._malloc(bytes.length);
          occt.HEAPU8.set(bytes, ptr);
          value = occt._occt_import_step(ptr, bytes.length);
          occt._free(ptr);
          break;
        }
        default:
          throw new Error(`unsupported op: ${step.op}`);
      }
      if (
        typeof value === 'number' &&
        value === 0 &&
        !['shape_release', 'arena_clear'].includes(step.op)
      ) {
        return {
          ok: false,
          error: `${step.op} returned 0`,
          code: 'BatchFailed',
          results,
        };
      }
      if (step.as != null) aliases.set(step.as, value);
      results.push({ op: step.op, as: step.as ?? null, result: value });
    }
    return {
      ok: true,
      results,
      aliases: Object.fromEntries(aliases),
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
      code: 'BatchFailed',
      results,
    };
  }
}
