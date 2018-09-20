import { IToken } from 'ebnf'

export class Node {
  errors: Error[] = []
  parent: Node
  start: number
  end: number

  constructor(public astNode?: IToken) {}
}

export class DocumentNode extends Node {
  fileName: string // should be just scene.xml for most usecases
  children: Node[] // EntityNode or CommentNode
  getRoot() {
    return this.children.find(child => child instanceof TagNode)
  }
}

export class TagNode extends Node {
  tagName: string
  attributes: Array<AttributeNode>
  children: Node[] // EntityNode or CommentNode
  selfClosed: boolean = false
}

export class AttributeNode extends Node {
  key: string
  value: string
}

export class CommentNode extends Node {
  text: string
}
