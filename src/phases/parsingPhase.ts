import { IToken } from 'ebnf'
import { parser } from '../grammar'

export class ParsingPhaseResult {
  document: IToken

  constructor(public fileName: string, public content: string) {
    this.execute()
  }

  protected execute() {
    this.document = parser.getAST(this.content, 'document')
  }
}
