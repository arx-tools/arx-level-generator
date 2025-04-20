/**
 * TOKENS:
 *
 * keywordRoom      - "room"
 * keywordAdd       - "add"
 * keywordDefine    - "define"
 * keywordCeiling   - "ceiling"
 * keywordWall      - "wall"
 * keywordWallNorth - "wall-north"
 * keywordWallSouth - "wall-south"
 * keywordWallEast  - "wall-east"
 * keywordWallWest  - "wall-west"
 * keywordFloor     - "floor"
 * keywordCustom    - "custom"
 * keywordArx       - "arx"
 * keywordWith      - "with"
 * keywordLight     - "light"
 * keywordCursor    - "cursor"
 * keywordSave      - "save"
 * keywordRestore   - "restore"
 * keywordOff       - "off"
 * keywordFitX      - "fit-x"
 * keywordFitY      - "fit-y"
 * keywordStretch   - "stretch"
 * keywordDim       - "dim"
 * keywordDefault   - "default"
 * comment          - "# any character"
 * symbolCurlyOpen  - "{"
 * symbolCurlyClose - "}"
 * symbolEquals     - "="
 * alignment        - "x++", "y--", "z+", etc
 * variable         - "$asdf"
 * newLine          - "\n"
 * integer          - "100"
 * percentage       - "300%"
 * string           - string without whitespace
 */
import { SyntaxError } from '@src/errors.js'

type TokenMatcher = {
  expression: RegExp
  storeValue?: boolean
}

type TokenType =
  | 'keywordRoom'
  | 'keywordAdd'
  | 'keywordDefine'
  | 'keywordCeiling'
  | 'keywordWall'
  | 'keywordWallNorth'
  | 'keywordWallSouth'
  | 'keywordWallEast'
  | 'keywordWallWest'
  | 'keywordFloor'
  | 'keywordCustom'
  | 'keywordArx'
  | 'keywordWith'
  | 'keywordLight'
  | 'keywordCursor'
  | 'keywordSave'
  | 'keywordRestore'
  | 'keywordOff'
  | 'keywordFitX'
  | 'keywordFitY'
  | 'keywordStretch'
  | 'keywordDim'
  | 'keywordDefault'
  | 'comment'
  | 'symbolCurlyOpen'
  | 'symbolCurlyClose'
  | 'symbolEquals'
  | 'alignment'
  | 'variable'
  | 'newLine'
  | 'integer'
  | 'percentage'
  | 'string'

const tokenMatchers: Record<TokenType, TokenMatcher> = {
  keywordRoom: {
    expression: /^room$/,
  },
  keywordAdd: {
    expression: /^add$/,
  },
  keywordDefine: {
    expression: /^define$/,
  },
  keywordCeiling: {
    expression: /^ceiling$/,
  },
  keywordWall: {
    expression: /^wall$/,
  },
  keywordWallNorth: {
    expression: /^wall-north$/,
  },
  keywordWallSouth: {
    expression: /^wall-south$/,
  },
  keywordWallEast: {
    expression: /^wall-east$/,
  },
  keywordWallWest: {
    expression: /^wall-west$/,
  },
  keywordFloor: {
    expression: /^floor$/,
  },
  keywordCustom: {
    expression: /^custom$/,
  },
  keywordArx: {
    expression: /^arx$/,
  },
  keywordWith: {
    expression: /^with$/,
  },
  keywordLight: {
    expression: /^light$/,
  },
  keywordCursor: {
    expression: /^cursor$/,
  },
  keywordSave: {
    expression: /^save$/,
  },
  keywordRestore: {
    expression: /^restore$/,
  },
  keywordOff: {
    expression: /^off$/,
  },

  keywordFitX: {
    expression: /^fit-x$/,
  },
  keywordFitY: {
    expression: /^fit-y$/,
  },
  keywordStretch: {
    expression: /^stretch$/,
  },
  keywordDim: {
    expression: /^dim$/,
  },
  keywordDefault: {
    expression: /^default$/,
  },

  comment: {
    expression: /^#.*$/,
  },

  symbolCurlyOpen: {
    expression: /^{$/,
  },
  symbolCurlyClose: {
    expression: /^}$/,
  },
  symbolEquals: {
    expression: /^=$/,
  },

  alignment: {
    expression: /^[xyz](--|-|\+|\+\+)?$/,
  },

  variable: {
    expression: /^\$[a-zA-Z_]\w+$/,
    storeValue: true,
  },

  newLine: {
    expression: /^\r?\n$/,
  },

  integer: {
    expression: /^([1-9]\d*|0)$/,
    storeValue: true,
  },
  percentage: {
    expression: /^([1-9]\d*|0)%$/,
    storeValue: true,
  },
  string: {
    expression: /^\S+$/,
    storeValue: true,
  },
}

type Token = {
  type: TokenType
  value?: string
  at: [lineNumber: number, charNumber: number]
}

function isWhitespace(str: string): boolean {
  return /^\s+$/.test(str)
}

function numberOfNewlinesIn(input: string): number {
  return input.split('\n').length - 1
}

/**
 * @throws SyntaxError
 */
export function tokenize(input: string, debug: boolean = false): Token[] {
  const tokenMatcherList = Object.entries(tokenMatchers) as [TokenType, TokenMatcher][]

  const tokens: Token[] = []

  let lineNumber = 1
  let charNumber = 0
  let lastCharNumber = 0

  let buffer = ''
  let prevLineNumber = lineNumber
  let prevCharNumber = charNumber

  function moveBackToBeginningOfToken(): void {
    charNumber = charNumber - buffer.length - 1
    if (buffer.includes('\n')) {
      lineNumber = lineNumber - numberOfNewlinesIn(buffer)
      charNumber = charNumber + lastCharNumber + numberOfNewlinesIn(buffer)
    }
  }

  let lastMatch: [TokenType, TokenMatcher] | undefined
  let newlineToken: Token | undefined

  for (let i = 0; i < input.length; i++) {
    const char = input[i]
    buffer = buffer + char

    if (char === '\n') {
      newlineToken = {
        type: 'newLine',
        at: [lineNumber, charNumber],
      }

      lineNumber = lineNumber + 1
      lastCharNumber = charNumber
      charNumber = 0
    } else {
      newlineToken = undefined
      charNumber = charNumber + 1
    }

    if (isWhitespace(buffer)) {
      buffer = ''
      prevLineNumber = lineNumber
      prevCharNumber = charNumber
      continue
    }

    if (debug) {
      console.log(`${lineNumber}:${charNumber}: "${buffer}"`)
    }

    const puffer = buffer
    const currentMatch = tokenMatcherList.find(([, { expression }]) => {
      return expression.test(puffer)
    })

    if (currentMatch) {
      lastMatch = currentMatch
      continue
    }

    if (lastMatch) {
      if (isWhitespace(char)) {
        if (debug) {
          console.log('----------')
        }

        const token: Token = {
          type: lastMatch[0],
          at: [prevLineNumber, prevCharNumber + 1],
        }

        if (lastMatch[1].storeValue) {
          token.value = buffer.slice(0, -1)
        }

        tokens.push(token)
        if (newlineToken) {
          tokens.push(newlineToken)
        }

        buffer = ''
        prevLineNumber = lineNumber
        prevCharNumber = charNumber

        lastMatch = undefined
        i = i - 1
        if (char === '\n') {
          lineNumber = lineNumber - 1
          charNumber = lastCharNumber
        } else {
          charNumber = charNumber - 1
        }

        continue
      }

      moveBackToBeginningOfToken()
      throw new SyntaxError(lineNumber, charNumber)
    }

    if (isWhitespace(char)) {
      moveBackToBeginningOfToken()
      throw new SyntaxError(lineNumber, charNumber)
    }
  }

  if (lastMatch) {
    const token: Token = {
      type: lastMatch[0],
      at: [prevLineNumber, prevCharNumber + 1],
    }

    if (lastMatch[1].storeValue) {
      token.value = buffer
    }

    if (newlineToken) {
      tokens.push(newlineToken)
    }

    tokens.push(token)
    buffer = ''
    prevLineNumber = lineNumber
    prevCharNumber = charNumber
  } else if (buffer !== '') {
    moveBackToBeginningOfToken()
    throw new SyntaxError(lineNumber, charNumber)
  }

  return tokens.filter(({ type }) => {
    return type !== 'comment'
  })
}
