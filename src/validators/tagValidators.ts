import { TagNode } from '../nodes'
import { AstNodeError } from '../phases/errorHandling'
import { attributeValidators } from './attributeValidators'

type AttributeOptions = {
  attribute: string
  required?: boolean
}

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
    validateAttributes(node, [
      { attribute: 'id' },
      { attribute: 'position' },
      { attribute: 'scale' },
      { attribute: 'rotation' },
      { attribute: 'look-at' },
      { attribute: 'key' },
      { attribute: 'visible' },
      { attribute: 'billboard' }
    ])
  },
  materialEntityValidator(node: TagNode) {
    validatorFunctions.basicEntityValidator(node)
    validateAttributes(node, [{ attribute: 'color' }, { attribute: 'material' }, { attribute: 'with-collisions' }])
  },
  circleEntityValidator(node: TagNode) {
    validatorFunctions.materialEntityValidator(node)
    validateAttributes(node, [{ attribute: 'segments' }, { attribute: 'arc' }])
  },
  planeEntityValidator(node: TagNode) {
    validatorFunctions.materialEntityValidator(node)
    validate(node, 'uvs')
  },
  cylinderEntityValidator(node: TagNode) {
    validatorFunctions.materialEntityValidator(node)
    validateAttributes(node, [
      { attribute: 'radius' },
      { attribute: 'arc' },
      { attribute: 'radiusTop' },
      { attribute: 'radiusBottom' },
      { attribute: 'segmentsRadial' },
      { attribute: 'segmentsHeight' },
      { attribute: 'openEnded' }
    ])
  },
  textEntityValidator(node: TagNode) {
    validatorFunctions.basicEntityValidator(node)
    validateAttributes(node, [
      { attribute: 'outline-width' },
      { attribute: 'outline-color' },
      { attribute: 'color' },
      { attribute: 'font-family' },
      { attribute: 'font-size' },
      { attribute: 'font-weight' },
      { attribute: 'opacity' },
      { attribute: 'value', required: true },
      { attribute: 'line-spacing' },
      { attribute: 'text-wrapping' },
      { attribute: 'h-align' },
      { attribute: 'v-align' },
      { attribute: 'width' },
      { attribute: 'height' },
      { attribute: 'line-count' },
      { attribute: 'resize-to-fit' },
      { attribute: 'shadow-blur' },
      { attribute: 'shadow-offset-x' },
      { attribute: 'shadow-offset-y' },
      { attribute: 'z-index' },
      { attribute: 'shadow-color' },
      { attribute: 'padding-top' },
      { attribute: 'padding-right' },
      { attribute: 'padding-bottom' },
      { attribute: 'padding-left' }
    ])
  },
  videoEntityValidator(node: TagNode) {
    validatorFunctions.basicEntityValidator(node)
    validateAttributes(node, [
      { attribute: 'src', required: true },
      { attribute: 'height' },
      { attribute: 'width' },
      { attribute: 'play' },
      { attribute: 'loop' },
      { attribute: 'volume' }
    ])
  },
  gltfEntityValidator(node: TagNode) {
    validatorFunctions.basicEntityValidator(node)
    validate(node, 'src', true)
  },
  objEntityValidator(node: TagNode) {
    validatorFunctions.basicEntityValidator(node)
    validate(node, 'src', true)
  },
  inputTextEntityValidator(node: TagNode) {
    validatorFunctions.basicEntityValidator(node)
    validateAttributes(node, [
      { attribute: 'color' },
      { attribute: 'font-family' },
      { attribute: 'font-size' },
      { attribute: 'value' },
      { attribute: 'width' },
      { attribute: 'height' },
      { attribute: 'background' },
      { attribute: 'focused-background' },
      { attribute: 'outline-width' },
      { attribute: 'max-length' },
      { attribute: 'placeholder' }
    ])
  },
  materialDescriptorEntityValidator(node: TagNode) {
    validateAttributes(node, [
      { attribute: 'id', required: true },
      { attribute: 'alpha' },
      { attribute: 'ambient-color' },
      { attribute: 'albedo-color' },
      { attribute: 'reflectivity-color' },
      { attribute: 'reflection-color' },
      { attribute: 'metallic' },
      { attribute: 'roughness' },
      { attribute: 'albedo-texture' },
      { attribute: 'alpha-texture' },
      { attribute: 'emisive-texture' },
      { attribute: 'bump-texture' },
      { attribute: 'refraction-texture' },
      { attribute: 'direct-intensity' },
      { attribute: 'emissive-intensity' },
      { attribute: 'environment-intensity' },
      { attribute: 'specular-intensity' },
      { attribute: 'micro-surface' },
      { attribute: 'disable-lighting' },
      { attribute: 'transparency-mode' },
      { attribute: 'has-alpha' }
    ])
  }
}

function validateAttributes(node: TagNode, attributes: AttributeOptions[]): void {
  attributes.forEach(({ attribute, required }) => {
    validate(node, attribute, required)
  })
}

const validate = (node: TagNode, name: string, required: boolean = false) => {
  const attributeNode = node.attributes.find(node => node.key === name)

  if (!attributeNode) {
    if (required) {
      node.errors.push(new AstNodeError(`Missing attribute ${name} in ${node.tagName}.`, node))
    }
    return
  }

  if (attributeValidators.has(attributeNode.key)) {
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
  ['input-text', validatorFunctions.inputTextEntityValidator],
  ['material', validatorFunctions.materialDescriptorEntityValidator]
])
