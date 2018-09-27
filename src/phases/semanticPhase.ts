import { DocumentNode, TagNode, AttributeNode } from '../nodes'
import { AstNodeError } from './errorHandling'
import { CanonicalPhaseResult } from './canonicalPhase'
import { walker } from '../utils/treeHelpers'
import { tagExists, validateTag } from '../validators/tagValidators'

type TagAttribute = {
  tag: TagNode
  attribute: AttributeNode
}

export class SemanticPhaseResult {
  document: DocumentNode
  idRegistry: Map<string, TagAttribute>

  constructor(public canonicalPhaseResult: CanonicalPhaseResult) {
    this.idRegistry = new Map<string, TagAttribute>()
    this.execute()
  }

  protected execute() {
    if (!this.canonicalPhaseResult.document) {
      throw new SyntaxError('Invalid program')
    }

    this.document = validateScene(this.canonicalPhaseResult.document, this.idRegistry)
  }
}

function validateScene(document: DocumentNode, idRegistry: Map<string, TagAttribute>): DocumentNode {
  if (document.getRoot().tagName !== 'scene') {
    document
      .getRoot()
      .errors.push(new AstNodeError('Type error: Invalid document. Scene must start and finish with <scene> tag.', document.getRoot()))
  }

  tagsWalker(document.getRoot())
  idWalker(idRegistry, document.getRoot())
  return document
}

const tagsWalker = walker(node => {
  if (node instanceof TagNode) {
    if (!tagExists(node.tagName)) {
      throw new AstNodeError(`Type error: Tag <${node.tagName}> does not exist.`, node)
    }

    validateTag(node)
  }
})

const idWalker = (idRegistry, root) => {
  walker(node => {
    if (node instanceof TagNode) {
      // validate uniq IDs
      node.attributes.filter(n => n.key === 'id').forEach(n => {
        if (!idRegistry.has(n.value)) {
          idRegistry.set(n.value, { tag: node, attribute: n })
          return
        }
        const msg = 'Invalid attribute id. Value must be uniq and is duplicated on this document.'
        const { attribute } = idRegistry.get(n.value)
        attribute.errors.push(new AstNodeError(msg, attribute))
        node.errors.push(new AstNodeError(msg, attribute))
      })

      // validate that references to materials exists
      node.attributes.filter(n => n.key === 'material').forEach(n => {
        if (idRegistry.has(n.value.substring(1)) && idRegistry.get(n.value.substring(1)).tag.tagName === 'material') {
          return
        }
        n.errors.push(
          new AstNodeError(
            `Invalid attribute material "${
              n.value
            }". Value must be a uniq ID referenced with preffix "#" and must be declared in the same document as <material />.`,
            n
          )
        )
      })
    }
  })(root)
}
