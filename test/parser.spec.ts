import { expect } from 'chai'
import { parse, getSimplifiedNode } from '../src'

const validInput = `
<scene attr="1 &amp; &gt;">
  <!-- comment -->
  <gltf-model />
</scene>
`

describe('parse', () => {
  it('should return the SimplifiedNode tree', () => {
    const ast = parse(validInput)
    const res = getSimplifiedNode(ast)

    expect(res).to.deep.equal({
      nodes: {
        tag: 'scene',
        attrs: { attr: '1 & >' },
        children: [
          {
            tag: 'gltf-model',
            attrs: {},
            children: []
          }
        ]
      },
      errors: []
    })
  })

  it('should return the errors for an invalid XML', () => {
    const ast = parse(`<scene attr="1`)
    const res = getSimplifiedNode(ast)

    expect(res.errors.length).to.eq(2)
    expect(res.errors[0].message).to.eq('Syntax error: Invalid attribute "attr"')
    expect(res.errors[1].message).to.eq('Syntax error: Tag <scene> is not closed')
  })
})
