module.exports = {
  lintOnSave: false,
  devServer: {
    port: 8080,
    open: true
  },
  publicPath: process.env.NODE_ENV === 'production' ? './' : '/'
}
