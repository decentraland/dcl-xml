import parse from '../src'

const validInput = `
<scene attr="1 &amp; &gt;">
  <!-- comment -->
  <gltf-model />
</scene>
`

describe('parse', () => {
  it('should return the SimplifiedNode tree', () => {
    console.log(parse(validInput))
  })
})
