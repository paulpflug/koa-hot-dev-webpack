(function() {
  var devMiddleware, hotMiddleware, webpack, whm;

  webpack = require("webpack");

  devMiddleware = require('webpack-dev-middleware');

  hotMiddleware = require("webpack-hot-middleware");

  whm = null;

  module.exports = function(webconf, options) {
    var compiler, hotReloadPath, key, ref, val, wdm;
    if (webconf.plugins == null) {
      webconf.plugins = [];
    }
    webconf.plugins.push(new webpack.optimize.OccurenceOrderPlugin());
    webconf.plugins.push(new webpack.NoErrorsPlugin());
    webconf.plugins.push(new webpack.HotModuleReplacementPlugin());
    if (webconf.entry == null) {
      webconf.entry = {};
    }
    hotReloadPath = require.resolve('./hot-reload');
    ref = webconf.entry;
    for (key in ref) {
      val = ref[key];
      if (Array.isArray(val)) {
        val.unshift(hotReloadPath);
      } else {
        webconf.entry[key] = [hotReloadPath, val];
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
    compiler.plugin('compilation', function(compilation) {
      return compilation.plugin('html-webpack-plugin-after-emit', function(data, cb) {
        whm.publish({
          action: 'reload'
        });
        return cb();
      });
    });
    return function*(next) {
      var ctx, ended;
      ctx = this;
      ended = (yield function(done) {
        return wdm(ctx.req, {
          end: function(content) {
            ctx.body = content;
            return done(null, true);
          },
          setHeader: function() {
            return ctx.set.apply(ctx, arguments);
          }
        }, function() {
          return done(null, false);
        });
      });
      if (!ended) {
        yield whm.bind(null, ctx.req, ctx.res);
        return (yield next);
      }
    };
  };

  module.exports.reload = function() {
    return whm != null ? whm.publish({
      action: 'reload'
    }) : void 0;
  };

}).call(this);
