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
    validate(node, 'id')
    validate(node, 'position')
    validate(node, 'scale')
    validate(node, 'rotation')
    validate(node, 'look-at')
    validate(node, 'key')
    validate(node, 'visible')
    validate(node, 'billboard')
  },
  materialEntityValidator(node: TagNode) {
    validatorFunctions.basicEntityValidator(node)
    validate(node, 'color')
    validate(node, 'material')
    validate(node, 'with-collisions')
  },
  circleEntityValidator(node: TagNode) {
    validatorFunctions.materialEntityValidator(node)
    validate(node, 'segments')
    validate(node, 'arc')
  },
  planeEntityValidator(node: TagNode) {
    validatorFunctions.materialEntityValidator(node)
    validate(node, 'uvs')
  },
  cylinderEntityValidator(node: TagNode) {
    validatorFunctions.materialEntityValidator(node)
    validate(node, 'radius')
    validate(node, 'arc')
    validate(node, 'radiusTop')
    validate(node, 'radiusBottom')
    validate(node, 'segmentsRadial')
    validate(node, 'segmentsHeight')
    validate(node, 'openEnded')
  },
  textEntityValidator(node: TagNode) {
    validatorFunctions.basicEntityValidator(node)
    validate(node, 'outline-width')
    validate(node, 'outline-color')
    validate(node, 'color')
    validate(node, 'font-family')
    validate(node, 'font-size')
    validate(node, 'font-weight')
    validate(node, 'opacity')
    validate(node, 'value')
    validate(node, 'line-spacing')
    validate(node, 'text-wrapping')
    validate(node, 'h-align')
    validate(node, 'v-align')
    validate(node, 'width')
    validate(node, 'height')
    validate(node, 'line-count')
    validate(node, 'resize-to-fit')
    validate(node, 'shadow-blur')
    validate(node, 'shadow-offset-x')
    validate(node, 'shadow-offset-y')
    validate(node, 'z-index')
    validate(node, 'shadow-color')
    validate(node, 'padding-top')
    validate(node, 'padding-right')
    validate(node, 'padding-bottom')
    validate(node, 'padding-left')
  },
  videoEntityValidator(node: TagNode) {
    validatorFunctions.basicEntityValidator(node)
    validate(node, 'src')
    validate(node, 'height')
    validate(node, 'width')
    validate(node, 'play')
    validate(node, 'loop')
    validate(node, 'volume')
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
    validate(node, 'color')
    validate(node, 'font-family')
    validate(node, 'font-size')
    validate(node, 'value')
    validate(node, 'width')
    validate(node, 'height')
    validate(node, 'background')
    validate(node, 'focused-background')
    validate(node, 'outline-width')
    validate(node, 'max-length')
    validate(node, 'placeholder')
  }
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
