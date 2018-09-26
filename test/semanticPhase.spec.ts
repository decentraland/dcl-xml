import { expect } from 'chai'

import { ParsingPhaseResult } from '../src/phases/parsingPhase'
import { CanonicalPhaseResult } from '../src/phases/canonicalPhase'
import { SemanticPhaseResult } from '../src/phases/semanticPhase'
import { Node } from '../src/nodes'

const validScene = `
<scene>
  <box id="3" color="#ff00aa" position="1 2 3" />
  <sphere id="2" color="#00aaff" position="1 2 3" scale="4 4 4" />
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
    const { document } = new SemanticPhaseResult(canonicalPhase)
    const errors = getErrors([document])
    expect(errors.length, `Existing errors: [${errors}]`).to.eq(0)
  })

  it(`should add an error if starting tag isn't scene`, () => {
    const parsePhase = new ParsingPhaseResult('file.xml', `<tag><box position="1 2 3" /></tag>`)
    const canonicalPhase = new CanonicalPhaseResult(parsePhase)
    const { document } = new SemanticPhaseResult(canonicalPhase)
    const errors = getErrors([document])
    expect(errors.length, `Existing errors: [${errors}]`).to.eq(2)
    expect(errors[0].message).to.eq('Type error: Invalid document. Scene must start and finish with <scene> tag.')
  })

  it('should add an error to non-existing tag names', () => {
    const parsePhase = new ParsingPhaseResult('file.xml', `<scene><ultrabox /></scene>`)
    const canonicalPhase = new CanonicalPhaseResult(parsePhase)
    const { document } = new SemanticPhaseResult(canonicalPhase)
    const errors = getErrors([document])
    expect(errors.length, `Existing errors: [${errors}]`).to.eq(1)
    expect(errors[0].message).to.eq(`Type error: Tag <ultrabox> does not exist.`)
  })

  it('should add an error to wrong vector values', () => {
    const parsePhase = new ParsingPhaseResult('file.xml', `<scene><box position="hola"/></scene>`)
    const canonicalPhase = new CanonicalPhaseResult(parsePhase)
    const { document } = new SemanticPhaseResult(canonicalPhase)
    const errors = getErrors([document])
    expect(errors.length, `Existing errors: [${errors}]`).to.eq(1)
    expect(errors[0].message).to.eq('Invalid attribute position. Must be Vector3Component type.')
  })

  it('should add an error to wrong color values', () => {
    const parsePhase = new ParsingPhaseResult('file.xml', `<scene><box color="asd" position="1 2 3" /></scene>`)
    const canonicalPhase = new CanonicalPhaseResult(parsePhase)
    const { document } = new SemanticPhaseResult(canonicalPhase)
    const errors = getErrors([document])
    expect(errors.length, `Existing errors: [${errors}]`).to.eq(1)
    expect(errors[0].message).to.eq('Invalid attribute color. Must be hex number color type.')
  })

  it('should add an error to wrong scale values', () => {
    const parsePhase = new ParsingPhaseResult('file.xml', `<scene><sphere color="#00aaff" position="1 2 3" scale="4 4" /></scene>`)
    const canonicalPhase = new CanonicalPhaseResult(parsePhase)
    const { document } = new SemanticPhaseResult(canonicalPhase)
    const errors = getErrors([document])
    expect(errors.length, `Existing errors: [${errors}]`).to.eq(1)
    expect(errors[0].message).to.eq('Invalid attribute scale. Must be as number or a Vector3Component type.')
  })

  it('should add an error to scene with non-uniq IDs', () => {
    const scene = `
      <scene>
        <box id="3" color="#ff00aa" position="1 2 3" />
        <sphere id="3" color="#00aaff" position="1 2 3" scale="4 4 4" />
        <plane color="#00aaff" position="1 2 3" scale="3" rotation="-90 0 0" />
      </scene>`
    const parsePhase = new ParsingPhaseResult('file.xml', scene)
    const canonicalPhase = new CanonicalPhaseResult(parsePhase)
    const { document } = new SemanticPhaseResult(canonicalPhase)
    const errors = getErrors([document])
    expect(errors.length, `Existing errors: [${errors}]`).to.eq(2)
    expect(errors[0].message).to.eq('Invalid attribute id. Value must be uniq and is duplicated on this document.')
  })

  it('should add an error to wrong boolean values', () => {
    const parsePhase = new ParsingPhaseResult(
      'file.xml',
      `<scene><sphere with-collisions="asd" color="#00aaff" position="1 2 3" /></scene>`
    )
    const canonicalPhase = new CanonicalPhaseResult(parsePhase)
    const { document } = new SemanticPhaseResult(canonicalPhase)
    const errors = getErrors([document])
    expect(errors.length, `Existing errors: [${errors}]`).to.eq(1)
    expect(errors[0].message).to.eq('Invalid attribute with-collisions. Must be boolean value.')
  })

  it('should add an error to wrong billboard values', () => {
    const parsePhase = new ParsingPhaseResult('file.xml', `<scene><sphere billboard="9" color="#00aaff" position="1 2 3" /></scene>`)
    const canonicalPhase = new CanonicalPhaseResult(parsePhase)
    const { document } = new SemanticPhaseResult(canonicalPhase)
    const errors = getErrors([document])
    expect(errors.length, `Existing errors: [${errors}]`).to.eq(1)
    expect(errors[0].message).to.eq('Invalid attribute billboard. Must be number between 0 and 7.')
  })

  it('should add an error to wrong alignment values', () => {
    const parsePhase = new ParsingPhaseResult('file.xml', `<scene><text v-align="near" /></scene>`)
    const canonicalPhase = new CanonicalPhaseResult(parsePhase)
    const { document } = new SemanticPhaseResult(canonicalPhase)
    const errors = getErrors([document])
    expect(errors.length, `Existing errors: [${errors}]`).to.eq(1)
    expect(errors[0].message).to.eq('Invalid attribute v-align. Must be `top`, `right`, `bottom` or `left`.')
  })
})
