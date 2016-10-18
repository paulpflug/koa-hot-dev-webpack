(function() {
  var hotClient;

  require('eventsource-polyfill');

  hotClient = require('webpack-hot-middleware/client?noInfo=true&reload=true');

  hotClient.subscribe(function(event) {
    if (event.action === 'reload') {
      return window.location.reload();
    }
  });

}).call(this);
