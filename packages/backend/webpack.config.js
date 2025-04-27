const { DefinePlugin } = require('webpack')

module.exports = () => {
  /**
   * @type {import('webpack').Configuration}
   */
  const config = {
    plugins: [
      new DefinePlugin({
        __TEST__: false,
        __DEV__: process.env.NODE_ENV === 'dev',
        __BUILD_AT__: JSON.stringify(new Date().toLocaleString()),
        __COMMIT__: JSON.stringify(process.env.GITHUB_SHA)
      })
    ]
  }
  return config;
}