import { CanonicalPhaseResult } from './phases/canonicalPhase'
import { ParsingPhaseResult } from './phases/parsingPhase'
import { camelCase } from './utils/formatHelpers'
import { SemanticPhaseResult } from './phases/semanticPhase'
import * as Nodes from './nodes'

export type SimplifiedNode = {
  tag: string
  children: SimplifiedNode[]
  attrs: {
    [name: string]: string | number[] | object | boolean | number
  }
}

const visitor = {
  DocumentNode(node: Nodes.DocumentNode, errors: Error[]) {
    if (node.children.length) {
      // Should fail in a previous phase if there is no <scene>
      // Other than comments, the scene tag must be the only node
      const sceneTag = node.children.find($ => $.type === 'TagNode')
      return visit(sceneTag, errors)
    }
  },
  TagNode(node: Nodes.TagNode, errors: Error[]) {
    errors.unshift(...node.errors)

    return {
      tag: node.tagName,
      attrs: node.attributes.reduce((acc, node) => ({ ...acc, ...visit(node, errors) }), {}),
      children: node.children.filter($ => $.type !== 'CommentNode').map($ => visit($, errors))
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

function visit(node: Nodes.Node, errs: Error[]): SimplifiedNode {
  if (visitor[node.type]) {
    return visitor[node.type](node, errs)
  } else {
    throw new Error(`Visitor not implemented for ${node.constructor.name}`)
  }
}

export function parse(input: string): SemanticPhaseResult {
  const parsePhase = new ParsingPhaseResult('file.xml', input)
  const canonicalPhase = new CanonicalPhaseResult(parsePhase)
  const semanticPhase = new SemanticPhaseResult(canonicalPhase)
  return semanticPhase
}

export function getSimplifiedNode(ast: SemanticPhaseResult): { nodes: SimplifiedNode; errors: Error[] } {
  const errs = []

  return {
    nodes: visit(ast.document, errs),
    errors: errs
  }
}
