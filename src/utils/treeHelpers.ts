import { Node, TagNode, DocumentNode } from '../nodes'

/**
 * Walk through the tree and exec a function in every Node
 */
export function walker(cb: (x: Node | TagNode | DocumentNode) => void) {
  const ret = (root: Node | TagNode | DocumentNode) => {
    try {
      cb(root)
    } catch (e) {
      root.errors.push(e)
    }
    if ('children' in root) {
      root.children.forEach(ret)
    }
  }
  return ret
}
