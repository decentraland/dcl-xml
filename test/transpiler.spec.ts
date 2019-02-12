import { expect } from 'chai'

import { ParsingPhaseResult } from '../src/phases/parsingPhase'
import { CanonicalPhaseResult } from '../src/phases/canonicalPhase'
import { SemanticPhaseResult } from '../src/phases/semanticPhase'
import transpile from '../src/transpiler'

describe('transpiler', () => {
  it('should transpile valid scene with 2 cubes and sphere', () => {
    const scene = `
<scene>
  <box position="1 2 3" />
  <box position="1 4 3" />
  <sphere rotation="45 45 45" />
</scene>
`

    const parsePhase = new ParsingPhaseResult('file.xml', scene)
    const canonicalPhase = new CanonicalPhaseResult(parsePhase)
    const semanticPhase = new SemanticPhaseResult(canonicalPhase)
    const ecsCode = transpile(semanticPhase)

    expect(ecsCode).to.eq(
      `const box = new Entity()
box.set(new BoxShape())
box.set(new Transform({ position: new Vector3(1, 2, 3), rotation: new Quaternion(0, 0, 0, 1), scale: new Vector3(1, 1, 1) }))

const box1 = new Entity()
box1.set(new BoxShape())
box1.set(new Transform({ position: new Vector3(1, 4, 3), rotation: new Quaternion(0, 0, 0, 1), scale: new Vector3(1, 1, 1) }))

const sphere = new Entity()
sphere.set(new SphereShape())
sphere.set(new Transform({ position: new Vector3(0, 0, 0), rotation: new Quaternion(0.46193976625564337, 0.1913417161825449, 0.1913417161825449, 0.8446231986207332), scale: new Vector3(1, 1, 1) }))

`
    )
  })

  it('should transpile valid scene with 2 cubes and sphere', () => {
    const scene = `
<scene>
  <gltf-model src="./asd.gltf" rotation="45 45 45" />
</scene>
`

    const parsePhase = new ParsingPhaseResult('file.xml', scene)
    const canonicalPhase = new CanonicalPhaseResult(parsePhase)
    const semanticPhase = new SemanticPhaseResult(canonicalPhase)
    const ecsCode = transpile(semanticPhase)

    expect(ecsCode).to.eq(
      `const gltf = new Entity()
gltf.set(new GLTFShape('./asd.gltf'))
gltf.set(new Transform({ position: new Vector3(0, 0, 0), rotation: new Quaternion(0.46193976625564337, 0.1913417161825449, 0.1913417161825449, 0.8446231986207332), scale: new Vector3(1, 1, 1) }))

`
    )
  })
})
