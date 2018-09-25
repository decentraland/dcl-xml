import { DocumentNode, TagNode } from '../nodes'
import { AstNodeError } from './errorHandling'
import { CanonicalPhaseResult } from './canonicalPhase'
import { walker } from '../utils/treeHelpers'
import { tagExists, validateTag } from '../validators/tagValidators'
import { resetUniq } from '../validators/attributeValidators'

export class SemanticPhaseResult {
  document: DocumentNode

  constructor(public canonicalPhaseResult: CanonicalPhaseResult) {
    this.execute()
  }

  protected execute() {
    if (!this.canonicalPhaseResult.document) {
      throw new SyntaxError('Invalid program')
    }

    this.document = validateScene(this.canonicalPhaseResult.document)
  }
}

function validateScene(document: DocumentNode): DocumentNode {
  if (document.getRoot().tagName !== 'scene') {
    document
      .getRoot()
      .errors.push(new AstNodeError('Type error: Invalid document. Scene must start and finish with <scene> tag.', document.getRoot()))
  }

  resetUniq()
  tagsWalker(document.getRoot())
  return document
}

const tagsWalker = root => {
  walker(node => {
    if (node instanceof TagNode) {
      if (!tagExists(node.tagName)) {
        throw new AstNodeError(`Type error: Tag <${node.tagName}> does not exist.`, node)
      }

      validateTag(node)
    }
  })(root)
}
