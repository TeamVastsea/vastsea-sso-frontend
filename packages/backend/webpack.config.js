const { DefinePlugin } = require('webpack')

module.exports = () => {
  /**
   * @type {import('webpack').Configuration}
   */
  const config = {
    plugins: [
      new DefinePlugin({
        __TEST__: false,
        __DEV__: process.env.NODE_ENV === 'dev'
      })
    ]
  }
  return config;
}