module.exports = {
  env: {
    browser: true,
    node: true,
    mocha: true,
    es6: true
  },
  parser: '@typescript-eslint/parser',
  plugins: ['react-hooks'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
  ],
  parserOptions: {
    ecmaFeatures: {
      legacyDecorators: true
    }
  },
  rules: {
    'react/prop-types': 0,
    'react/display-name': 0,
    'react/jsx-no-target-blank': 0, // 允许 target 等于 blank
    'react/jsx-key': 1, // jsx 中的遍历，需要加 key 属性，没有会提示警告
    'react/no-find-dom-node': 0,
    'comma-dangle': [2, 'always-multiline'], // IE8 及以下，尾部逗号会报错，根据项目的兼容性选择开启或关闭
    'indent': [2, 2, { SwitchCase: 1 }], // 缩进 2 格，jquery 项目可忽略。switch 和 case 之间缩进两个
    'jsx-quotes': [2, 'prefer-double'], // jsx 属性统一使用双引号
    'max-len': [1, { code: 140 }],  // 渐进式调整，先设置最大长度为 140，同时只是警告
    'no-mixed-spaces-and-tabs': 2,
    'no-tabs': 2,
    'no-trailing-spaces': 2, // 语句尾部不能出现空格
    'quotes': [2, 'single'], // 统一使用单引号
    'semi': [2, 'never'], // 语句尾部不加分号
    'space-before-blocks': 2, // if 和函数等，大括号前需要空格
    'space-in-parens': 2, // 括号内前后不加空格
    'space-infix-ops': 2, // 中缀（二元）操作符前后加空格
    'spaced-comment': 2, // 注释双斜杠后保留一个空格
    '@typescript-eslint/explicit-function-return-type': 0,
    '@typescript-eslint/no-explicit-any': 0,
    '@typescript-eslint/no-non-null-assertion': 0,
    '@typescript-eslint/ban-ts-ignore': 0,
    '@typescript-eslint/interface-name-prefix': 0,
    '@typescript-eslint/no-use-before-define': 0,
    "react-hooks/rules-of-hooks": 'error',
    "react-hooks/exhaustive-deps": 'warn'
  },
  overrides: [
    {
      files: ['*.js', '*.jsx'],
      rules: {
        '@typescript-eslint/no-var-requires': 0,
      }
    }
  ]
}