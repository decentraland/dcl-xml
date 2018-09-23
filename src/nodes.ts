import { IToken } from 'ebnf'

export abstract class Node {
  abstract type: string
  errors: Error[] = []
  start: number = 0
  end: number = 0

  constructor(public astNode?: IToken) {}
}

export class DocumentNode extends Node {
  type = 'DocumentNode'
  fileName: string // should be just scene.xml for most usecases
  children: Node[] // EntityNode or CommentNode
  getRoot() {
    return this.children.find(child => child instanceof TagNode)
  }
}

export class TagNode extends Node {
  type = 'TagNode'
  tagName: string
  attributes: Array<AttributeNode>
  children: Node[] // EntityNode or CommentNode
  selfClosed: boolean = false
}

export class AttributeNode extends Node {
  type = 'AttributeNode'
  key: string
  value: string
}

export class CommentNode extends Node {
  type = 'CommentNode'
  text: string
}
