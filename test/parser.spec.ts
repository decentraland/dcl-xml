import { expect } from 'chai'
import parse from '../src'

const validInput = `
<scene attr="1 &amp; &gt;">
  <!-- comment -->
  <gltf-model />
</scene>
`

describe('parse', () => {
  it('should return the SimplifiedNode tree', () => {
    expect(parse(validInput)).to.deep.equal({
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
    const res = parse(`<scene attr="1`)

    expect(res.errors.length).to.eq(2)
    expect(res.errors[0].message).to.eq('Syntax error: Tag <scene> is not closed')
    expect(res.errors[1].message).to.eq('Syntax error: Invalid attribute "attr"')
  })
})
