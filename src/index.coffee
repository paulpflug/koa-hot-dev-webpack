webpack = require "webpack"
devMiddleware = require('webpack-dev-middleware')
hotMiddleware = require("webpack-hot-middleware")
whm = null
module.exports = (webconf,options) ->
  webconf.plugins ?= []
  webconf.plugins.push new webpack.optimize.OccurenceOrderPlugin()
  webconf.plugins.push new webpack.NoErrorsPlugin()
  webconf.plugins.push new webpack.HotModuleReplacementPlugin()
  webconf.entry ?= {}
  hotReloadPath = require.resolve('./hot-reload')
  for key,val of webconf.entry
    if Array.isArray(val)
      val.unshift(hotReloadPath)
    else
      webconf.entry[key] = [hotReloadPath,val]
  options ?= {}
  options.publicPath ?= webconf.output.publicPath or "/"
  options.noInfo ?= true
  options.stats ?= colors:true
  compiler = webpack(webconf)
  wdm = devMiddleware(compiler,options)
  whm = hotMiddleware(compiler)
  compiler.plugin 'compilation', (compilation) ->
    compilation.plugin 'html-webpack-plugin-after-emit', (data, cb) ->
      whm.publish action: 'reload'
      cb()
  return (next) ->
    ctx = this
    ended = yield (done) ->
      wdm ctx.req, {
        end: (content) ->
          ctx.body = content
          done(null,true)
        setHeader: ->
          ctx.set.apply(ctx, arguments)
      }, ->
        done(null,false)
    unless ended
      yield whm.bind(null,ctx.req,ctx.res)
      yield next

module.exports.reload = ->
  whm?.publish action: 'reload'
