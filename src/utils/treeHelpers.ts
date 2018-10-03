import { Node, TagNode, DocumentNode, AttributeNode } from '../nodes'

/**
 * Walk through the tree and exec a function in every Node
 */
export function walker(cb: (x: Node | TagNode | DocumentNode) => void) {
  const ret = (root: Node | TagNode | AttributeNode | DocumentNode) => {
    try {
      cb(root)
    } catch (e) {
      root.errors.push(e)
    }
    if ('attributes' in root) {
      root.attributes.forEach(ret)
    }
    if ('children' in root) {
      root.children.forEach(ret)
    }
  }
  return ret
}
