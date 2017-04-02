# out: ../index.js
webpack = require "webpack"
devMiddleware = require('webpack-dev-middleware')
hotMiddleware = require("webpack-hot-middleware")
whm = null
compiler = null
module.exports = (webconf, options) ->
  webconf.plugins ?= []
  if webpack.optimize.OccurenceOrderPlugin?
    webconf.plugins.push new webpack.optimize.OccurenceOrderPlugin()
    webconf.plugins.push new webpack.NoErrorsPlugin()
  else
    #webconf.plugins.push new webpack.optimize.OccurrenceOrderPlugin()
    webconf.plugins.push new webpack.NoEmitOnErrorsPlugin()
  webconf.plugins.push new webpack.HotModuleReplacementPlugin()
  entry = webconf.entry ?= {}
  hotReloadPath = require.resolve('./hot-reload')
  if typeof entry == "string" or entry instanceof String
    webconf.entry = [hotReloadPath, entry]
  else if Array.isArray(entry)
    entry.unshift(hotReloadPath) unless entry.indexOf(hotReloadPath) > -1
  else
    for key,val of webconf.entry
      if Array.isArray(val)
        val.unshift(hotReloadPath) unless entry.indexOf(hotReloadPath) > -1
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

module.exports.invalidate = -> compiler?.invalidate?()

module.exports.close = -> compiler?.close?()
