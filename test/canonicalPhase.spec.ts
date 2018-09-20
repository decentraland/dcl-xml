import { expect } from 'chai'
import { ParsingPhaseResult } from '../src/phases/parsingPhase'
import { CanonicalPhaseResult } from '../src/phases/canonicalPhase'
import { TagNode, DocumentNode, AttributeNode, CommentNode } from '../src/nodes'

const validInput = `
<scene attr="1">
  <!-- comment -->
  <gltf-model />
</scene>
`

describe('canonicalPhase', () => {
  it('should parse DocumentNode', () => {
    const parsePhase = new ParsingPhaseResult('file.xml', validInput)
    const canonicalPhase = new CanonicalPhaseResult(parsePhase)
    const documentNode = canonicalPhase.document
    expect(documentNode.constructor.name).to.eq('DocumentNode')
  })

  it('should parse TagNode', () => {
    const parsePhase = new ParsingPhaseResult('file.xml', validInput)
    const canonicalPhase = new CanonicalPhaseResult(parsePhase)
    const documentNode = canonicalPhase.document
    expect(documentNode.children[0].constructor.name).to.eq('TagNode')
    expect((documentNode.children[0] as TagNode).tagName).to.eq('scene')
  })

  it('should parse AttributeNode', () => {
    const parsePhase = new ParsingPhaseResult('file.xml', validInput)
    const canonicalPhase = new CanonicalPhaseResult(parsePhase)
    const documentNode = canonicalPhase.document
    const tagNode = documentNode.children[0] as TagNode
    expect(tagNode.attributes[0].constructor.name).to.eq('AttributeNode')
  })

  it('should parse CommentNode', () => {
    const parsePhase = new ParsingPhaseResult('file.xml', validInput)
    const canonicalPhase = new CanonicalPhaseResult(parsePhase)
    const documentNode = canonicalPhase.document
    const tagNode = documentNode.children[0] as TagNode
    expect(tagNode.children[0].constructor.name).to.eq('CommentNode')
  })

  it('should parse nested TagNodes', () => {
    const parsePhase = new ParsingPhaseResult('file.xml', validInput)
    const canonicalPhase = new CanonicalPhaseResult(parsePhase)
    const documentNode = canonicalPhase.document
    const tagNode = documentNode.children[0] as TagNode
    expect(tagNode.children[1].constructor.name).to.eq('TagNode')
    expect((tagNode.children[1] as TagNode).tagName).to.eq('gltf-model')
  })

  it('should add an error to a TagNode if not closed', () => {
    const parsePhase = new ParsingPhaseResult('file.xml', `<scene>`)
    const canonicalPhase = new CanonicalPhaseResult(parsePhase)
    const documentNode = canonicalPhase.document
    const tagNode = documentNode.children[0] as TagNode
    expect(tagNode.errors.length).to.eq(1)
    expect(tagNode.errors[0].message).to.eq('Syntax error: Tag <scene> is not closed')
  })

  it('should add an error to a TagNode if not closing tag does not match the opening tag', () => {
    const parsePhase = new ParsingPhaseResult('file.xml', `<scene></test>`)
    const canonicalPhase = new CanonicalPhaseResult(parsePhase)
    const documentNode = canonicalPhase.document
    const tagNode = documentNode.children[0] as TagNode
    expect(tagNode.errors.length).to.eq(1)
    expect(tagNode.errors[0].message).to.eq('Syntax error: Tag <scene> is not closed')
  })

  it('should add an error to a AttributeNode if not properly formed (with quotes)', () => {
    const parsePhase = new ParsingPhaseResult('file.xml', `<scene a="></scene>`)
    const canonicalPhase = new CanonicalPhaseResult(parsePhase)
    const documentNode = canonicalPhase.document
    const tagNode = documentNode.children[0] as TagNode
    const attributeNode = tagNode.attributes[0] as AttributeNode
    expect(attributeNode.errors.length).to.eq(1)
    expect(attributeNode.errors[0].message).to.eq('Syntax error: Invalid attribute "a"')
  })

  it('should add an error to a AttributeNode if not properly formed (no quotes)', () => {
    const parsePhase = new ParsingPhaseResult('file.xml', `<scene a=></scene>`)
    const canonicalPhase = new CanonicalPhaseResult(parsePhase)
    const documentNode = canonicalPhase.document
    const tagNode = documentNode.children[0] as TagNode
    const attributeNode = tagNode.attributes[0] as AttributeNode
    expect(attributeNode.errors.length).to.eq(1)
    expect(attributeNode.errors[0].message).to.eq('Syntax error: Invalid attribute "a"')
  })

  it('should add an error to a AttributeNode if no value is preset', () => {
    const parsePhase = new ParsingPhaseResult('file.xml', `<scene a></scene>`)
    const canonicalPhase = new CanonicalPhaseResult(parsePhase)
    const documentNode = canonicalPhase.document
    const tagNode = documentNode.children[0] as TagNode
    const attributeNode = tagNode.attributes[0] as AttributeNode
    expect(attributeNode.errors.length).to.eq(1)
    expect(attributeNode.errors[0].message).to.eq('Syntax error: Invalid attribute "a"')
  })

  it('should add an error to a CommentNode if not properly formed', () => {
    const parsePhase = new ParsingPhaseResult('file.xml', `<!-- comment`)
    const canonicalPhase = new CanonicalPhaseResult(parsePhase)
    const documentNode = canonicalPhase.document
    const commentNode = documentNode.children[0] as CommentNode
    expect(commentNode.errors.length).to.eq(1)
    expect(commentNode.errors[0].message).to.eq(`SyntaxError: Unexpected end of input. Missing '-->'`)
  })

  it('should fail to handle invalid inputs', () => {
    const parsePhase = new ParsingPhaseResult('file.xml', `<a</b>`)
    expect(() => new CanonicalPhaseResult(parsePhase)).to.throw('Invalid program')
  })
})
