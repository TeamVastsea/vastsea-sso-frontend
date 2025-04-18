import antfu from '@antfu/eslint-config';

export default antfu({
  formatters: true,
  vue: {
    overrides: {
      'antfu/top-level-function': 'off',
      'vue/component-name-in-template-casing': ['error', 'kebab-case'],
    },
  },
  typescript: {
    overrides: {
      'antfu/top-level-function': 'off',
    },
  },
  javascript: {
    overrides: {
      'antfu/top-level-function': 'off',
    },
  },
  stylistic: {
    semi: true,
  },
});
