import { IToken, TokenError } from 'ebnf'
import * as Nodes from '../nodes'
import { AstNodeError } from './errorHandling'
import { ParsingPhaseResult } from './parsingPhase'

const visitor = {
  document(astNode: IToken) {
    const node = new Nodes.DocumentNode(astNode)
    node.children = astNode.children.map($ => visit($))
    return node
  },
  tag(astNode: IToken) {
    const node = new Nodes.TagNode(astNode)

    const tagBody = findChildrenType(astNode, 'body')
    const tagName = astNode.children[0]
    const isSelfClosed = astNode.children.some($ => $.type === 'selfClosingTag')
    const closingTagName = findChildrenType(astNode, 'closingName')

    node.tagName = tagName.text
    node.attributes = astNode.children.filter($ => $.type === 'attribute').map($ => visit($))
    node.children = tagBody ? tagBody.children.map($ => visit($)) : []
    node.selfClosed = isSelfClosed

    if (!isSelfClosed && (!closingTagName || closingTagName.text !== tagName.text)) {
      node.errors.push(new AstNodeError(`Syntax error: Tag <${tagName.text}> is not closed`, node))
    }

    return node
  },
  attribute(astNode: IToken) {
    const node = new Nodes.AttributeNode(astNode)
    const attributeKey = astNode.children[0].text

    if (findChildrenType(astNode, 'SyntaxError')) {
      // No key-value pair for an attribute means there's a Syntax Error
      node.errors.push(new AstNodeError(`Syntax error: Invalid attribute "${attributeKey || astNode.text}"`, node))
    } else {
      node.key = attributeKey
      node.value = decodeEntities(JSON.parse(astNode.children[1].text))
    }

    return node
  },
  comment(astNode: IToken) {
    const node = new Nodes.CommentNode(astNode)
    node.text = astNode.text

    if (astNode.children.length > 0) {
      // Syntax Errors are the only possible children for a comment
      node.errors = node.errors.concat(extractErrors(astNode, node))
    }

    return node
  },
  SyntaxError(_: IToken) {
    return null
  }
}

function visit<T extends Nodes.Node>(astNode: IToken): T {
  if (!astNode) return null
  if (visitor[astNode.type]) {
    return visitor[astNode.type](astNode)
  } else {
    throw new TokenError(`Visitor not implemented for ${astNode.type}`, astNode)
  }
}

function findChildrenType(token: IToken, type: string) {
  return token.children.find($ => $.type === type)
}

function extractErrors(astNode: IToken, target: Nodes.Node) {
  return findChildrenType(astNode, 'SyntaxError').errors.map(err => {
    return new AstNodeError(`SyntaxError: ${err.message}`, target)
  })
}

function decodeEntities(encodedString) {
  let translateRe = /&(nbsp|amp|quot|lt|gt);/g
  let translate = {
    nbsp: ' ',
    amp: '&',
    quot: '"',
    lt: '<',
    gt: '>'
  }
  return encodedString
    .replace(translateRe, (_, entity) => {
      return translate[entity]
    })
    .replace(/&#(\d+);/gi, (_, numStr) => {
      let num = parseInt(numStr, 10)
      return String.fromCharCode(num)
    })
}

export class CanonicalPhaseResult {
  document: Nodes.DocumentNode

  constructor(public parsingPhaseResult: ParsingPhaseResult) {
    this.execute()
  }

  protected execute() {
    if (!this.parsingPhaseResult.document) {
      throw new SyntaxError('Invalid program')
    }
    this.document = visit(this.parsingPhaseResult.document)
    this.document.fileName = this.parsingPhaseResult.fileName
  }
}
