import SceneWriter from 'dcl-scene-writer'
import * as DCL from 'decentraland-ecs'

import { SemanticPhaseResult } from '../phases/semanticPhase'
import { walker } from '../utils/treeHelpers'
import { TagNode } from '../nodes'
import { toVector3, toQuaternion, hasDefaultValues } from '../utils/transforms'
import { tagCategories, EntityCategory } from '../validators/tagValidators'

export default function transpile({ document }: SemanticPhaseResult): string {
  const entities: string[] = []
  const sceneWriter = new SceneWriter(DCL)

  walker(node => {
    if (!(node instanceof TagNode) || node.tagName === 'scene') {
      return
    }
    const countElement = entities.filter(e => e === node.tagName).length
    const tag = node.tagName.replace('-model', '')
    const name = countElement === 0 ? tag : `${tag}${countElement}`
    entities.push(name)

    const entity = new DCL.Entity()
    const components = getComponents(node)
    components.forEach(c => entity.set(c))

    const transform = new DCL.Transform()
    node.attributes.forEach(attribute => {
      switch (attribute.key) {
        case 'position':
          transform.position = toVector3(attribute.value)
          break
        case 'scale':
          transform.scale = toVector3(attribute.value)
          break
        case 'rotation':
          transform.rotation = toQuaternion(attribute.value)
          break
      }
    })

    if (!hasDefaultValues(transform)) {
      entity.set(transform)
    }

    sceneWriter.addEntity(name, entity)
  })(document.getRoot())

  return sceneWriter.emitCode()
}

function getComponents(node: TagNode): DCL.ObservableComponent[] {
  if (!tagCategories.has(node.tagName)) {
    return []
  }
  const category = tagCategories.get(node.tagName)

  switch (category) {
    case EntityCategory.BASIC:
    case EntityCategory.MATERIAL:
      const className = node.tagName.charAt(0).toUpperCase() + node.tagName.slice(1) + 'Shape'
      const shape = addBillboard(node, new DCL[className]())
      return [shape]
    case EntityCategory.MODEL:
      const src = getSrc(node)
      const gltf = addBillboard(node, new DCL.GLTFShape(src))
      return [gltf]
    default:
      return []
  }
}

function addBillboard(node: TagNode, component: DCL.Shape) {
  const billboardNode = node.attributes.find(attr => attr.key === 'billboard')
  if (billboardNode) {
    component.billboard = parseFloat(billboardNode.value)
  }
  return component
}

function getSrc(node: TagNode) {
  const srcNode = node.attributes.find(attr => attr.key === 'src')
  if (srcNode) {
    return srcNode.value
  }
}
