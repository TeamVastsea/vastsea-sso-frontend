const { DefinePlugin } = require('webpack')

module.exports = () => {
  /**
   * @type {import('webpack').Configuration}
   */
  const config = {
    plugins: [
      new DefinePlugin({
        __TEST__: false,
      })
    ]
  }
  return config;
}