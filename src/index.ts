import { ISimplifiedNode } from 'decentraland-api'
import { CanonicalPhaseResult } from './phases/canonicalPhase'
import { ParsingPhaseResult } from './phases/parsingPhase'
import * as Nodes from './nodes'

const visitor = {
  DocumentNode(node: Nodes.DocumentNode, errors: Error[]) {
    if (node.children.length) {
      // Should fail in a previous phase if there is no <scene>
      // Other than comments, the scene tag must be the only node
      debugger
      const sceneTag = node.children.find($ => $.type === 'TagNode')
      return visit(sceneTag, errors)
    }
  },
  TagNode(node: Nodes.TagNode, errors: Error[]) {
    errors.push(...(node.errors || []))

    return {
      tag: node.tagName,
      attrs: node.attributes.reduce((acc, node) => ({ ...acc, ...visit(node, errors) }), {}),
      children: node.children.filter($ => $.type !== 'CommentNode').map($ => visit($, errors))
    }
  },
  AttributeNode(node: Nodes.AttributeNode, errors: Error[]) {
    errors.push(...(node.errors || []))

    return {
      [node.key]: node.value
    }
  }
}

function visit(node: Nodes.Node, errs: Error[]): ISimplifiedNode {
  if (visitor[node.type]) {
    return visitor[node.type](node, errs)
  } else {
    throw new Error(`Visitor not implemented for ${node.constructor.name}`)
  }
}

export default function parse(input: string): { nodes: ISimplifiedNode; errors: Error[] } {
  const parsePhase = new ParsingPhaseResult('file.xml', input)
  const canonicalPhase = new CanonicalPhaseResult(parsePhase)
  const errs = []

  return {
    nodes: visit(canonicalPhase.document, errs),
    errors: errs
  }
}
