import { expect } from 'chai'
import { ParsingPhaseResult } from '../src/phases/parsingPhase'
import { CanonicalPhaseResult } from '../src/phases/canonicalPhase'
import { validateScene } from '../src/phases/semanticPhase'
import { Node } from '../src/nodes'

const validScene = `
<scene>
  <box color="#ff00aa" position="1 2 3" />
  <sphere color="#00aaff" position="1 2 3" scale="4 4 4" />
  <plane color="#00aaff" position="1 2 3" scale="3" rotation="-90 0 0" />
</scene>
`

function getErrors(nodes: Node[]): Error[] {
  if (nodes.length === 0) {
    return []
  }

  const errors = nodes
    .filter(node => node.errors)
    .map(node => node.errors)
    .reduce((acc, errors) => [...acc, ...errors], [])
  const attributes = nodes
    .filter(node => node['attributes'])
    .map(node => node['attributes'])
    .reduce((acc, nodes) => [...acc, ...nodes], []) as Node[]
  let next = nodes
    .filter(node => !!node['children'])
    .map(node => node['children'])
    .reduce((acc, nodes) => [...acc, ...nodes], []) as Node[]
  next = [...next, ...attributes]
  return [...getErrors(next), ...errors]
}

describe('semanticPhase', () => {
  it('should parse valid scene', () => {
    const parsePhase = new ParsingPhaseResult('file.xml', validScene)
    const canonicalPhase = new CanonicalPhaseResult(parsePhase)
    const { document } = validateScene(canonicalPhase.document)
    const errors = getErrors([document])
    expect(errors.length).to.eq(0)
  })

  it(`should add an error if starting tag isn't scene`, () => {
    const parsePhase = new ParsingPhaseResult('file.xml', `<tag><box position="1 2 3" /></tag>`)
    const canonicalPhase = new CanonicalPhaseResult(parsePhase)
    const { document } = validateScene(canonicalPhase.document)
    const errors = getErrors([document])
    expect(errors.length).to.eq(2)
    expect(errors[0].message).to.eq('Type error: Invalid document. Scene must start and finish with <scene> tag.')
  })

  it('should add an error to non-existing tag names', () => {
    const parsePhase = new ParsingPhaseResult('file.xml', `<scene><ultrabox /></scene>`)
    const canonicalPhase = new CanonicalPhaseResult(parsePhase)
    const { document } = validateScene(canonicalPhase.document)
    const errors = getErrors([document])
    expect(errors.length).to.eq(1)
    expect(errors[0].message).to.eq(`Type error: Tag <ultrabox> does not exist.`)
  })

  it('should add an error to invalid attributes', () => {
    const parsePhase = new ParsingPhaseResult('file.xml', `<scene><box hola="hola"/></scene>`)
    const canonicalPhase = new CanonicalPhaseResult(parsePhase)
    const { document } = validateScene(canonicalPhase.document)
    const errors = getErrors([document])
    expect(errors.length).to.eq(1)
    expect(errors[0].message).to.eq(`Type error: attribute "hola" is not valid.`)
  })

  it('should add an error to wrong vector values', () => {
    const parsePhase = new ParsingPhaseResult('file.xml', `<scene><box position="hola"/></scene>`)
    const canonicalPhase = new CanonicalPhaseResult(parsePhase)
    const { document } = validateScene(canonicalPhase.document)
    const errors = getErrors([document])
    expect(errors.length).to.eq(1)
    expect(errors[0].message).to.eq('Type error: Invalid attribute position. Must be Vector3Component type')
  })

  it('should add an error to wrong color values', () => {
    const parsePhase = new ParsingPhaseResult('file.xml', `<scene><box color="asd" position="1 2 3" /></scene>`)
    const canonicalPhase = new CanonicalPhaseResult(parsePhase)
    const { document } = validateScene(canonicalPhase.document)
    const errors = getErrors([document])
    expect(errors.length).to.eq(1)
    expect(errors[0].message).to.eq('Type error: Invalid attribute color. Must be hex number color type')
  })

  it('should add an error to wrong scale values', () => {
    const parsePhase = new ParsingPhaseResult('file.xml', `<scene><sphere color="#00aaff" position="1 2 3" scale="4 4" /></scene>`)
    const canonicalPhase = new CanonicalPhaseResult(parsePhase)
    const { document } = validateScene(canonicalPhase.document)
    const errors = getErrors([document])
    expect(errors.length).to.eq(1)
    expect(errors[0].message).to.eq('Type error: Invalid attribute scale. Must be 1 digit number or a vector type')
  })
})
