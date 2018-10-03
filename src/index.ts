import { CanonicalPhaseResult } from './phases/canonicalPhase'
import { ParsingPhaseResult } from './phases/parsingPhase'
import { SemanticPhaseResult } from './phases/semanticPhase'

export * from './utils/nodeHelpers'
export * from './utils/treeHelpers'

export function parse(input: string): SemanticPhaseResult {
  const parsePhase = new ParsingPhaseResult('file.xml', input)
  const canonicalPhase = new CanonicalPhaseResult(parsePhase)
  const semanticPhase = new SemanticPhaseResult(canonicalPhase)
  return semanticPhase
}
