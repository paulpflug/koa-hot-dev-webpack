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
```

It will add the following plugins:
```js
new webpack.optimize.OccurenceOrderPlugin()
new webpack.NoErrorsPlugin()
new webpack.HotModuleReplacementPlugin()
```

and inject `webpack-hot-middleware/client` to all entries

middlewareOptions defaults are
```js
{
  publicPath: webpackConfig.output.publicPath || "/"
  noInfo: true
  stats: { colors:true }
}
```

##### manual reload
```js
koaHotDevWebpack.reload() // will only work for the last instance created
```
##### close webpack
```js
koaHotDevWebpack.close() // will only work for the last instance created
```
## License
Copyright (c) 2016 Paul Pflugradt
Licensed under the MIT license.
