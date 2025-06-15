import antfu from '@antfu/eslint-config';

export default antfu({
  stylistic: {
    semi: true,
  },
  vue: {
    overrides: {
      'style/brace-style': ['warn', '1tbs'],
      'antfu/top-level-function': 'off',
    },
  },
  typescript: {
    overrides: {
      'antfu/top-level-function': 'off',
    },
  },
});
