webpack = require "webpack"
devMiddleware = require('webpack-dev-middleware')
hotMiddleware = require("webpack-hot-middleware")

module.exports = (webconf,options) ->
  webconf.plugins ?= []
  webconf.plugins.push new webpack.NoErrorsPlugin()
  webconf.plugins.push new webpack.optimize.OccurenceOrderPlugin()
  webconf.plugins.push new webpack.HotModuleReplacementPlugin()
  webconf.entry ?= {}
  hotReloadPath = require.resolve('./hot-reload')
  for key,val of webconf.entry
    if Array.isArray(val)
      val.unshift(hotReloadPath)
    else
      val = [hotReloadPath,val]
  options ?= {}
  options.publicPath ?= webconf.output.publicPath
  options.publicPath ?= "/"
  options.noInfo ?= true
  options.stats ?= colors:true
  compiler = webpack(webconf)
  wdm = devMiddleware(compiler,options)
  return (next) ->
    ctx = this
    ended = yield (done) ->
      wdm ctx.req, {
        end: (content) ->
          ctx.body = content
          done(null,true)
        setHeader: -> ctx.set.apply(ctx, arguments)
      }, -> done(null,false)
    unless ended
      yield hotMiddleware(compiler).bind(null,@req,@res)
      yield next
