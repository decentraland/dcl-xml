import { DocumentNode, TagNode, AttributeNode } from '../nodes'
import { AstNodeError } from './errorHandling'
import { CanonicalPhaseResult } from './canonicalPhase'
import { walker } from '../utils/treeHelpers'
import { tagExists, validateTag } from '../validators/tagValidators'

export class SemanticPhaseResult {
  document: DocumentNode
  idRegistry: Map<string, AttributeNode>

  constructor(public canonicalPhaseResult: CanonicalPhaseResult) {
    this.idRegistry = new Map<string, AttributeNode>()
    this.execute()
  }

  protected execute() {
    if (!this.canonicalPhaseResult.document) {
      throw new SyntaxError('Invalid program')
    }

    this.document = validateScene(this.canonicalPhaseResult.document, this.idRegistry)
  }
}

function validateScene(document: DocumentNode, idRegistry: Map<string, AttributeNode>): DocumentNode {
  if (document.getRoot().tagName !== 'scene') {
    document
      .getRoot()
      .errors.push(new AstNodeError('Type error: Invalid document. Scene must start and finish with <scene> tag.', document.getRoot()))
  }

  tagsWalker(document.getRoot())
  idWalker(idRegistry, document.getRoot())
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

const idWalker = (idRegistry, root) => {
  walker(node => {
    if (node instanceof TagNode) {
      node.attributes.filter(node => node.key === 'id').forEach(node => {
        if (!idRegistry.has(node.value)) {
          idRegistry.set(node.value, node)
          return
        }
        const msg = 'Invalid attribute id. Value must be uniq and is duplicated on this document.'
        const firstNode = idRegistry.get(node.value)
        firstNode.errors.push(new AstNodeError(msg, firstNode))
        node.errors.push(new AstNodeError(msg, firstNode))
      })
    }
  })(root)
}
