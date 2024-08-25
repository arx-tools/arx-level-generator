/**
 * GRAMMAR:
 *
 * <all> => <declaration or operation> + ((token:newLine)+ + <declaration or operation>)*
 *
 * <declaration or operation> =>
 *   | <variable declaration>
 *   | <room texture declaration>
 *   | <room operation>
 *   | <cursor operation>
 *
 * <variable declaration> => token:variable + token:symbolEquals + <value>
 *
 * <value> => token:integer
 *
 * <string> =>
 *   | token:string
 *   | <keyword without default>
 *
 * <keyword without default> =>
 *   | token:keywordRoom
 *   | token:keywordAdd
 *   | token:keywordDefine
 *   | token:keywordCeiling
 *   | token:keywordWall
 *   | token:keywordWallNorth
 *   | token:keywordWallSouth
 *   | token:keywordWallEast
 *   | token:keywordWallWest
 *   | token:keywordFloor
 *   | token:keywordCustom
 *   | token:keywordArx
 *   | token:keywordWith
 *   | token:keywordLight
 *   | token:keywordCursor
 *   | token:keywordSave
 *   | token:keywordRestore
 *   | token:keywordOff
 *   | token:keywordFitX
 *   | token:keywordFitY
 *   | token:keywordStretch
 *   | token:keywordDim
 *
 * <room texture definition> =>
 *   token:keywordDefine
 *   + <room texture id>
 *   + token:symbolCurlyOpen
 *   + (token:newLine)+
 *   + <wall texture definition>
 *   + ((token:newLine)+ + <wall texture definition>)*
 *   + (token:newLine)+
 *   + token:symbolCurlyClose
 *
 * <room texture id> => <string>
 *
 * <wall texture definition> => <wall face> + <texture definition> + (<texture fit>)?
 *
 * <wall face> =>
 *   | token:keywordCeiling
 *   | token:keywordWall
 *   | token:keywordWallNorth
 *   | token:keywordWallSouth
 *   | token:keywordWallEast
 *   | token:keywordWallWest
 *   | token:keywordFloor
 *
 * <texture definition> =>
 *   | token:keywordOff
 *   | token:keywordDefault
 *   | (token:keywordArx + <filename>)
 *   | (token:keywordCustom + <folder name> + <filename>)
 *
 * <folder name> => <string>
 *
 * <filename> => <string>
 *
 * <texture fit> =>
 *   | token:keywordFitX
 *   | token:keywordFitY
 *   | token:keywordStretch
 *
 * <room operation> =>
 *     token:keywordRoom
 *   + token:keywordAdd
 *   + <room dimensions>
 *   + (<room texture id> | token:keywordDefault)*
 *   + (token:alignment)*
 *   (+ (token:newLine)+ + <light statement>)?
 *
 * <room dimensions> => <number> + <number> + <number>
 *
 * <number> => token:integer | token:variable
 *
 * <light statement> => token:keywordWith + token:keywordLight + (token:percentage | token:keywordDim)?
 *
 * <cursor operation> => token:keywordCursor + (token:keywordSave | token:keywordRestore) + <string>
 */
