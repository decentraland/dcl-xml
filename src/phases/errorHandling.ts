import * as Nodes from '../nodes'

export interface IPositionCapable {
  readonly start: number
  readonly end: number
}

export interface IErrorPositionCapable extends IPositionCapable {
  readonly message: string
}

export class AstNodeError extends Error implements IErrorPositionCapable {
  get start() {
    return this.node.astNode.start
  }

  get end() {
    return this.node.astNode.end
  }

  constructor(public message: string, public node: Nodes.Node, public warning: boolean = false) {
    super(message)
  }
}
