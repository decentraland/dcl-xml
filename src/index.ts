import { ISimplifiedNode } from 'decentraland-api'
import { CanonicalPhaseResult } from './phases/canonicalPhase'
import { ParsingPhaseResult } from './phases/parsingPhase'
import * as Nodes from './nodes'

function mapAttributes(node: Nodes.TagNode) {
  return node.attributes.reduce((acc, attr) => ({ ...acc, [attr.key]: attr.value }), {})
}

function getChildren(node: Nodes.TagNode) {
  const children = []

  for (let i = 0; i < node.children.length; i++) {
    const n = node.children[i]
    if (n instanceof Nodes.TagNode) {
      children.push(getSimplifiedNode(n))
    }
  }

  return children
}

function getSimplifiedNode(node: Nodes.TagNode): ISimplifiedNode {
  return {
    tag: node.tagName,
    attrs: mapAttributes(node),
    children: getChildren(node)
  }
}

function getSimplifiedNodeTree(result: CanonicalPhaseResult): ISimplifiedNode {
  const rootScene = result.document.children[0] as Nodes.TagNode

  return {
    tag: 'scene',
    attrs: mapAttributes(rootScene),
    children: getChildren(rootScene)
  }
}

export default function parse(input: string): ISimplifiedNode {
  const parsePhase = new ParsingPhaseResult('file.xml', input)
  const canonicalPhase = new CanonicalPhaseResult(parsePhase)
  return getSimplifiedNodeTree(canonicalPhase)
}
