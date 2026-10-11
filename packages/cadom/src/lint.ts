import { CadomDocument } from './document.ts'

/** Writer-truth lint finding (P0-K.5 / doctrine: STEP out of truth model). */
export type LintIssue = {
  code: 'step_as_truth' | 'exact_bound_to_step' | 'missing_asset'
  message: string
  nodeId?: string
  assetId?: string
}

/**
 * Lint a document as if an OpenCAD **writer** emitted it.
 * Readers MAY round-trip STEP; writers MUST NOT emit STEP as product truth
 * and MUST NOT bind EXACT → STEP.
 */
export function lintWriterTruth(doc: CadomDocument): LintIssue[] {
  const issues: LintIssue[] = []
  for (const [id, asset] of doc.assets) {
    if (asset.kind === 'step') {
      issues.push({
        code: 'step_as_truth',
        message: `Asset ${id} kind=STEP — writers MUST NOT emit STEP as product truth`,
        assetId: id,
      })
    }
  }
  for (const n of doc.nodes.values()) {
    for (const b of n.assetBindings) {
      const asset = doc.assets.get(b.assetId)
      if (!asset) {
        issues.push({
          code: 'missing_asset',
          message: `Node ${n.id} binds missing asset ${b.assetId}`,
          nodeId: n.id,
          assetId: b.assetId,
        })
        continue
      }
      if (b.role === 'exact' && asset.kind === 'step') {
        issues.push({
          code: 'exact_bound_to_step',
          message: `Node ${n.id} EXACT → STEP — writers MUST NOT bind EXACT to STEP`,
          nodeId: n.id,
          assetId: b.assetId,
        })
      }
    }
    if (n.assetId && !doc.assets.has(n.assetId)) {
      issues.push({
        code: 'missing_asset',
        message: `Node ${n.id} legacy asset_id missing ${n.assetId}`,
        nodeId: n.id,
        assetId: n.assetId,
      })
    }
  }
  return issues
}
