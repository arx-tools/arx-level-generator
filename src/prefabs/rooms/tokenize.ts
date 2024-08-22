type TokenMatcher = {
  expression: RegExp
  storeValue?: boolean
}

const tokenMatchers: Record<string, TokenMatcher> = {
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
  type: keyof typeof tokenMatchers
  value?: string
  at: [number, number]
}

function isWhitespace(str: string): boolean {
  return /^\s+$/.test(str)
}

function numberOfNewlinesIn(input: string): number {
  return input.split('\n').length - 1
}

export function tokenize(input: string, debug: boolean = false): Token[] {
  const tokenMatcherList = Object.entries(tokenMatchers)

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

  let lastMatch: [keyof typeof tokenMatchers, TokenMatcher] | undefined
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
        i--
        if (char === '\n') {
          lineNumber = lineNumber - 1
          charNumber = lastCharNumber
        } else {
          charNumber = charNumber - 1
        }

        continue
      }

      moveBackToBeginningOfToken()
      throw new Error(`[1] syntax error at ${lineNumber}:${charNumber}`)
    }

    if (isWhitespace(char)) {
      moveBackToBeginningOfToken()
      throw new Error(`[2] syntax error at ${lineNumber}:${charNumber}`)
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
    throw new Error(`[3] syntax error at ${lineNumber}:${charNumber}`)
  }

  return tokens
}
