import { TagNode } from '../nodes'
import { AstNodeError } from '../phases/errorHandling'
import { attributeValidators } from './attributeValidators'

export function tagExists(key: string): boolean {
  return tagValidators.has(key)
}

export function validateTag(node: TagNode): void {
  if (tagValidators.has(node.tagName)) {
    tagValidators.get(node.tagName)(node)
  }
}

const validatorFunctions = {
  basicEntityValidator(node: TagNode) {
    validateAttributes(node, ['id', 'position', 'scale', 'rotation', 'look-at', 'key', 'visible', 'billboard'])
  },
  materialEntityValidator(node: TagNode) {
    validatorFunctions.basicEntityValidator(node)
    validateAttributes(node, ['color', 'material', 'with-collisions'])
  },
  circleEntityValidator(node: TagNode) {
    validatorFunctions.materialEntityValidator(node)
    validateAttributes(node, ['segments', 'arc'])
  },
  planeEntityValidator(node: TagNode) {
    validatorFunctions.materialEntityValidator(node)
    validate(node, 'uvs')
  },
  cylinderEntityValidator(node: TagNode) {
    validatorFunctions.materialEntityValidator(node)
    validateAttributes(node, ['radius', 'arc', 'radiusTop', 'radiusBottom', 'segmentsRadial', 'segmentsHeight', 'openEnded'])
  },
  textEntityValidator(node: TagNode) {
    validatorFunctions.basicEntityValidator(node)
    validateAttributes(node, [
      'outline-width',
      'outline-color',
      'color',
      'font-family',
      'font-size',
      'font-weight',
      'opacity',
      'value',
      'line-spacing',
      'text-wrapping',
      'h-align',
      'v-align',
      'width',
      'height',
      'line-count',
      'resize-to-fit',
      'shadow-blur',
      'shadow-offset-x',
      'shadow-offset-y',
      'z-index',
      'shadow-color',
      'padding-top',
      'padding-right',
      'padding-bottom',
      'padding-left'
    ])
  },
  videoEntityValidator(node: TagNode) {
    validatorFunctions.basicEntityValidator(node)
    validateAttributes(node, ['src', 'height', 'width', 'play', 'loop', 'volume'])
  },
  gltfEntityValidator(node: TagNode) {
    validatorFunctions.basicEntityValidator(node)
    validate(node, 'src')
  },
  objEntityValidator(node: TagNode) {
    validatorFunctions.basicEntityValidator(node)
    validate(node, 'src')
  },
  inputTextEntityValidator(node: TagNode) {
    validatorFunctions.basicEntityValidator(node)
    validateAttributes(node, [
      'color',
      'font-family',
      'font-size',
      'value',
      'width',
      'height',
      'background',
      'focused-background',
      'outline-width',
      'max-length',
      'placeholder'
    ])
  }
}

function validateAttributes(node: TagNode, attributes: string[]): void {
  attributes.forEach(attribute => {
    validate(node, attribute)
  })
}

const validate = (node: TagNode, name: string) => {
  const attributeNode = node.attributes.find(node => node.key === name)
  if (attributeNode && attributeValidators.has(attributeNode.key)) {
    try {
      attributeValidators.get(attributeNode.key)(attributeNode.value)
    } catch (e) {
      attributeNode.errors.push(new AstNodeError(`Invalid attribute ${attributeNode.key}. ${e.message}.`, attributeNode))
    }
  }
}

const tagValidators = new Map<string, (node: TagNode) => void>([
  ['scene', validatorFunctions.basicEntityValidator],
  ['entity', validatorFunctions.basicEntityValidator],
  ['box', validatorFunctions.materialEntityValidator],
  ['sphere', validatorFunctions.materialEntityValidator],
  ['circle', validatorFunctions.circleEntityValidator],
  ['plane', validatorFunctions.planeEntityValidator],
  ['cylinder', validatorFunctions.cylinderEntityValidator],
  ['cone', validatorFunctions.cylinderEntityValidator],
  ['text', validatorFunctions.textEntityValidator],
  ['video', validatorFunctions.videoEntityValidator],
  ['gltf-model', validatorFunctions.gltfEntityValidator],
  ['obj-model', validatorFunctions.objEntityValidator],
  ['input-text', validatorFunctions.inputTextEntityValidator]
])
