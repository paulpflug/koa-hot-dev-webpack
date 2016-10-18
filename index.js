(function() {
  var devMiddleware, hotMiddleware, webpack;

  webpack = require("webpack");

  devMiddleware = require('webpack-dev-middleware');

  hotMiddleware = require("webpack-hot-middleware");

  module.exports = function(webconf, options) {
    var compiler, hotReloadPath, key, ref, val, wdm;
    if (webconf.plugins == null) {
      webconf.plugins = [];
    }
    webconf.plugins.push(new webpack.NoErrorsPlugin());
    webconf.plugins.push(new webpack.optimize.OccurenceOrderPlugin());
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
        val = [hotReloadPath, val];
      }
    }
    if (options == null) {
      options = {};
    }
    if (options.publicPath == null) {
      options.publicPath = webconf.output.publicPath;
    }
    if (options.publicPath == null) {
      options.publicPath = "/";
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
        yield hotMiddleware(compiler).bind(null, this.req, this.res);
        return (yield next);
      }
    };
  };

}).call(this);
