# koa-hot-dev-webpack

## Why?

Because there are not enough webpack middleware for koa out there

## What?

webpack-dev-middleware and webpack-hot-middleware with good defaults for fast setup of koa dev servers.

## How?

### Install

```sh
npm install --save koa-hot-dev-webpack webpack
```

### Usage

```js
koaHotDevWebpack = require("koa-hot-dev-webpack")
koa.use(koaHotDevWebpack(webpackConfig,middlewareOptions))
// webpackConfig is mandatory
```

It will add the following plugins:
```js
// for Webpack 1
new webpack.optimize.OccurenceOrderPlugin()
new webpack.NoErrorsPlugin()
new webpack.HotModuleReplacementPlugin()
// for Webpack 2
new webpack.NoEmitOnErrorsPlugin()
new webpack.HotModuleReplacementPlugin()
```

and inject `webpack-hot-middleware/client` to all entry points

middlewareOptions defaults are
```js
{
  publicPath: webpackConfig.output.publicPath || "/"
  noInfo: true
  stats: { colors:true }
}
```

### API
All only work for the last instance created!
```js
koaHotDevWebpack.invalidate() // to invalidate the bundle
koaHotDevWebpack.reload() // to reload client side
koaHotDevWebpack.close() // to close webpack
```

## License
Copyright (c) 2016 Paul Pflugradt
Licensed under the MIT license.
