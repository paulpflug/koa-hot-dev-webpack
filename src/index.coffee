# out: ../index.js
webpack = require "webpack"
devMiddleware = require('webpack-dev-middleware')
hotMiddleware = require("webpack-hot-middleware")
PassThrough = require("stream").PassThrough
whm = null
wdm = null
compiler = null
module.exports = (webconf, options) =>
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
        val.unshift(hotReloadPath) unless val.indexOf(hotReloadPath) > -1
      else
        webconf.entry[key] = [hotReloadPath,val]
  
  options ?= {}
  options.publicPath ?= webconf.output.publicPath or "/"
  options.noInfo ?= true
  options.stats ?= colors:true
  if webconf.watchOptions?
    options.watchOptions ?= webconf.watchOptions
  compiler = webpack(webconf)
  wdm = devMiddleware(compiler,options)
  whm = hotMiddleware(compiler, heartbeat: 4000)
  compiler.plugin 'compilation', (compilation) =>
    compilation.plugin 'html-webpack-plugin-after-emit', (data, cb) =>
      #whm.publish action: 'reload'
      cb()
  return (ctx, next) => new Promise (resolve) =>
    prevStatus = ctx.res.statusCode
    ctx.res.statusCode = 200
    wdm ctx.req, {
        end: (content) => 
          ctx.body = content
          resolve(next())
        setHeader: ctx.set.bind(ctx)
        locals: ctx.state
      }, =>
        ctx.res.statusCode = prevStatus
        stream = new PassThrough()
        result = whm ctx.req,{
          write: stream.write.bind(stream)
          writeHead: (status, headers) =>
            ctx.body = stream
            ctx.status = status
            ctx.set(headers)
        }, -> 
          resolve(next())
          return true
        resolve(next()) unless result

module.exports.reload = =>
  whm?.publish action: 'reload'

module.exports.invalidate = => 
  wdm?.invalidate?()

module.exports.close = => 
  compiler?.close?()
  wdm?.close?()