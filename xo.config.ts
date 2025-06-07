import unusedImports from 'eslint-plugin-unused-imports'
import type { FlatXoConfig } from 'xo'

const xoConfig: FlatXoConfig = {
  space: true,
  semicolon: false,
  prettier: true,
  plugins: {
    'unused-imports': unusedImports,
  },
  files: ['xo.config.ts', 'src/**/*.ts'],
  rules: {
    'capitalized-comments': 'off',
    'no-bitwise': 'off',
    'no-warning-comments': 'off',
    '@typescript-eslint/no-extraneous-class': 'off',
    '@typescript-eslint/ban-types': 'off',
    'unicorn/filename-case': [
      'error',
      {
        cases: {
          camelCase: true,
          pascalCase: true,
        },
      },
    ],
    'unicorn/no-array-callback-reference': 'off',
    'unicorn/no-array-for-each': 'off',
    'unicorn/no-static-only-class': 'off',
    'unicorn/prefer-math-trunc': 'off',
    'unicorn/prefer-module': 'off',
    'unicorn/prevent-abbreviations': 'off',
    curly: ['error', 'all'],
    'func-style': ['error', 'declaration'],
    'no-use-before-define': [
      'error',
      {
        functions: true,
        classes: true,
        variables: true,
        allowNamedExports: false,
      },
    ],
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'variable',
        format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
      },
    ],
    '@typescript-eslint/class-literal-property-style': ['error', 'fields'],
    '@typescript-eslint/prefer-literal-enum-member': [
      'error',
      {
        allowBitwiseExpressions: true,
      },
    ],
    '@typescript-eslint/consistent-type-imports': [
      'error',
      {
        fixStyle: 'separate-type-imports',
        prefer: 'type-imports',
      },
    ],
    '@typescript-eslint/explicit-function-return-type': 'error',
    '@typescript-eslint/array-type': [
      'error',
      {
        default: 'array',
      },
    ],
    '@typescript-eslint/parameter-properties': [
      'error',
      {
        prefer: 'class-property',
      },
    ],
    'operator-assignment': ['error', 'never'],
    'logical-assignment-operators': ['error', 'never'],
    '@typescript-eslint/no-inferrable-types': [
      'error',
      {
        ignoreParameters: true,
        ignoreProperties: true,
      },
    ],
    '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'off',
    'unicorn/prefer-ternary': 'off',
    'no-ternary': 'error',
    'no-await-in-loop': 'off',
    '@typescript-eslint/consistent-type-definitions': 'off',
    '@typescript-eslint/non-nullable-type-assertion-style': 'off',
    'unicorn/prefer-number-properties': [
      'error',
      {
        checkInfinity: true,
        checkNaN: true,
      },
    ],
    'unused-imports/no-unused-imports': 'error',
    'guard-for-in': 'off',
    'arrow-body-style': ['error', 'always'],
    '@typescript-eslint/unified-signatures': 'off',
    'unicorn/no-for-loop': 'off',
    // it's impossible to decypher what the real issue is, so I'm disabling every no-unsafe-* messages
    // https://github.com/typescript-eslint/typescript-eslint/issues/9591
    // the case is usually that a lib far away in the list of denendencies has an any somewhere
    // and that causes everything to become unsafe.
    // unsafe arguments being an issue is especially wrong in user-defined type guards, like `isValidMode()`
    '@typescript-eslint/no-unsafe-argument': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    'object-shorthand': [
      'error',
      'always',
      {
        avoidQuotes: true,
      },
    ],
    'no-plusplus': [
      'error',
      {
        allowForLoopAfterthoughts: true,
      },
    ],
    '@typescript-eslint/no-import-type-side-effects': 'error',
    'require-await': 'off',
    '@typescript-eslint/require-await': 'error',
    '@typescript-eslint/only-throw-error': 'off',
  },
}

export default xoConfig
