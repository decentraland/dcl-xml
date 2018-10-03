import { SemanticPhaseResult } from '../phases/semanticPhase'
import { camelCase } from '../utils/formatHelpers'
import * as Nodes from '../nodes'

export type SimplifiedNode = {
  tag: string
  children: SimplifiedNode[]
  attrs: {
    [name: string]: string | number[] | object | boolean | number
  }
}

const simpleNodeVisitor = {
  DocumentNode(node: Nodes.DocumentNode, errors: Error[]) {
    if (node.children.length) {
      // Should fail in a previous phase if there is no <scene>
      // Other than comments, the scene tag must be the only node
      const sceneTag = node.children.find($ => $.type === 'TagNode')
      return visitSimpleNodes(sceneTag, errors)
    }
  },
  TagNode(node: Nodes.TagNode, errors: Error[]) {
    errors.unshift(...node.errors)

    return {
      tag: node.tagName,
      attrs: node.attributes.reduce((acc, node) => ({ ...acc, ...visitSimpleNodes(node, errors) }), {}),
      children: node.children.filter($ => $.type !== 'CommentNode').map($ => visitSimpleNodes($, errors))
    }
  },
  AttributeNode(node: Nodes.AttributeNode, errors: Error[]) {
    errors.unshift(...node.errors)
    if (node.key && node.value) {
      return {
        [camelCase(node.key)]: node.value
      }
    }
    return null
  }
}

function visitSimpleNodes(node: Nodes.Node, errs: Error[]): SimplifiedNode {
  if (simpleNodeVisitor[node.type]) {
    return simpleNodeVisitor[node.type](node, errs)
  } else {
    throw new Error(`Visitor not implemented for ${node.constructor.name}`)
  }
}

export function getSimplifiedNode(ast: SemanticPhaseResult): { nodes: SimplifiedNode; errors: Error[] } {
  const errs = []

  return {
    nodes: visitSimpleNodes(ast.document, errs),
    errors: errs
  }
}
