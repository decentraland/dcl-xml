import { DocumentNode, TagNode } from '../nodes'
import { AstNodeError } from './errorHandling'

export type SemanticPhaseResult = {
  document: DocumentNode
}

function forEachTag(nodes: TagNode[], cb: (element: TagNode) => void): void {
  if (nodes.length === 0) {
    return
  }

  const targets = nodes.filter(node => node instanceof TagNode)
  targets.forEach(cb)
  const next = targets
    .map(node => node.children)
    .reduce((acc, hon) => [...acc, ...hon], [])
    .filter(node => node instanceof TagNode) as TagNode[]
  forEachTag(next, cb)
}

const tagNames = new Set(['scene', 'box', 'sphere', 'plane', 'entity', 'glft'])

const attributeValidators = new Map<string, (value: string) => void>([
  ['position', value => isVector3(value)],
  ['rotation', value => isVector3(value)],
  ['color', value => isColor(value)],
  ['scale', value => isVector3(value) || isOneNumber(value)]
])

const attributeErrorMessages = new Map<string, string>([
  ['position', 'Type error: Invalid attribute position. Must be Vector3Component type'],
  ['rotation', 'Type error: Invalid attribute rotation. Must be Vector3Component type'],
  ['color', 'Type error: Invalid attribute color. Must be hex number color type'],
  ['scale', 'Type error: Invalid attribute scale. Must be 1 digit number or a vector type']
])

function validateTag(node: TagNode) {
  if (!tagNames.has(node.tagName)) {
    node.errors.push(new AstNodeError(`Type error: Tag <${node.tagName}> does not exist.`, node))
  }

  node.attributes.forEach(attribute => {
    if (!isValidAttributeName(attribute.key)) {
      attribute.errors.push(new AstNodeError(`Type error: attribute "${attribute.key}" is not valid.`, attribute))
      return
    }

    if (!attributeValidators.get(attribute.key)(attribute.value)) {
      attribute.errors.push(new AstNodeError(attributeErrorMessages.get(attribute.key), attribute))
    }
  })
}

function isValidAttributeName(attribute: string): boolean {
  return [...attributeValidators.keys()].some(allowedAttribute => allowedAttribute === attribute)
}

export function validateScene(document: DocumentNode): SemanticPhaseResult {
  if (document.getRoot().tagName !== 'scene') {
    document
      .getRoot()
      .errors.push(new AstNodeError('Type error: Invalid document. Scene must start and finish with <scene> tag.', document.getRoot()))
  }

  forEachTag([document.getRoot()], validateTag)
  return { document }
}

function isVector3(value: string): boolean {
  const variables = value.split(' ')
  return variables.length === 3 && variables.every(variable => Number.isInteger(parseInt(variable, 10)))
}

function isColor(value: string): boolean {
  return !!value.match(/^#(?:[0-9a-f]{3}){1,2}$/i)
}

function isOneNumber(value: string): boolean {
  const variables = value.split(' ')
  return variables.length === 1 && Number.isInteger(parseInt(variables[0], 10))
}
