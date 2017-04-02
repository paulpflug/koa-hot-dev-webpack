(function() {
  var PassThrough, compiler, devMiddleware, hotMiddleware, wdm, webpack, whm;

  webpack = require("webpack");

  devMiddleware = require('webpack-dev-middleware');

  hotMiddleware = require("webpack-hot-middleware");

  PassThrough = require("stream").PassThrough;

  whm = null;

  wdm = null;

  compiler = null;

  module.exports = (webconf, options) => {
    var entry, hotReloadPath, key, ref, val;
    if (webconf.plugins == null) {
      webconf.plugins = [];
    }
    if (webpack.optimize.OccurenceOrderPlugin != null) {
      webconf.plugins.push(new webpack.optimize.OccurenceOrderPlugin());
      webconf.plugins.push(new webpack.NoErrorsPlugin());
    } else {
      webconf.plugins.push(new webpack.NoEmitOnErrorsPlugin());
    }
    webconf.plugins.push(new webpack.HotModuleReplacementPlugin());
    entry = webconf.entry != null ? webconf.entry : webconf.entry = {};
    hotReloadPath = require.resolve('./hot-reload');
    if (typeof entry === "string" || entry instanceof String) {
      webconf.entry = [hotReloadPath, entry];
    } else if (Array.isArray(entry)) {
      if (!(entry.indexOf(hotReloadPath) > -1)) {
        entry.unshift(hotReloadPath);
      }
    } else {
      ref = webconf.entry;
      for (key in ref) {
        val = ref[key];
        if (Array.isArray(val)) {
          if (!(val.indexOf(hotReloadPath) > -1)) {
            val.unshift(hotReloadPath);
          }
        } else {
          webconf.entry[key] = [hotReloadPath, val];
        }
      }
    }
    if (options == null) {
      options = {};
    }
    if (options.publicPath == null) {
      options.publicPath = webconf.output.publicPath || "/";
    }
    if (options.noInfo == null) {
      options.noInfo = true;
    }
    if (options.stats == null) {
      options.stats = {
        colors: true
      };
    }
    compiler = webpack(webconf);
    wdm = devMiddleware(compiler, options);
    whm = hotMiddleware(compiler);
    compiler.plugin('compilation', (compilation) => {
      return compilation.plugin('html-webpack-plugin-after-emit', (data, cb) => {
        whm.publish({
          action: 'reload'
        });
        return cb();
      });
    });
    return async function(ctx, next) {
      await new Promise((resolve, reject) => {
        return wdm.waitUntilValid(resolve);
      });
      return (await wdm(ctx.req, {
        end: (content) => {
          return ctx.body = content;
        },
        setHeader: ctx.set.bind(ctx),
        locals: ctx.state
      }, () => {
        var stream;
        stream = new PassThrough();
        return whm(ctx.req, {
          write: stream.write.bind(stream),
          writeHead: (status, headers) => {
            ctx.body = stream;
            ctx.status = status;
            return ctx.set(headers);
          }
        }, next);
      }));
    };
  };

  module.exports.reload = () => {
    return whm != null ? whm.publish({
      action: 'reload'
    }) : void 0;
  };

  module.exports.invalidate = () => {
    return wdm != null ? typeof wdm.invalidate === "function" ? wdm.invalidate() : void 0 : void 0;
  };

  module.exports.close = () => {
    if (compiler != null) {
      if (typeof compiler.close === "function") {
        compiler.close();
      }
    }
    return wdm != null ? typeof wdm.close === "function" ? wdm.close() : void 0 : void 0;
  };

}).call(this);
