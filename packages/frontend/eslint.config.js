import antfu from '@antfu/eslint-config';

export default antfu({
  formatters: true,
  vue: {
    overrides: {
      'antfu/top-level-function': 'off',
    },
  },
  stylistic: {
    semi: true,
  },
});
