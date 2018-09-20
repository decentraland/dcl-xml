import { Parser, Grammars, IRule } from 'ebnf'

export const grammar = `
document     ::= WS* comment* commentOrTag? WS* comment?
commentOrTag ::= &'<!--' comment | !'</' tag {fragment=true}

tag          ::= '<' name (WS+ attribute)* WS* (&'/>' selfClosingTag | '>' (WS* body)? WS* ('</' closingName '>')?) WS* {pin=3,recoverUntil=TAG_RECOVERY}
comment      ::= '<!--' (!'-->' [#x00-#xFFFF])* '-->' WS* {pin=1}
name         ::= [a-zA-Z][a-zA-Z0-9-]* {pin=1}
closingName  ::= [a-zA-Z][a-zA-Z0-9-]* {pin=1}
selfClosingTag ::= '/>'
body         ::= (commentOrTag WS*)* {recoverUntil=TAG_RECOVERY}
attribute    ::= name (WS*'=' WS* string) {pin=1}

TAG_RECOVERY ::= &('<')


/* STRINGS */

string       ::= '"' (([#x20-#x21] | [#x23-#x5B] | [#x5D-#xFFFF]) | #x5C (#x22 | #x5C | #x2F | #x62 | #x66 | #x6E | #x72 | #x74 | #x75 HEXDIG HEXDIG HEXDIG HEXDIG))* '"'
HEXDIG       ::= [a-fA-F0-9]
WS           ::= [#x20#x09#x0A#x0D]+
`

export const RULES: IRule[] = Grammars.Custom.getRules(grammar)

export const parser = new Parser(RULES, {})
