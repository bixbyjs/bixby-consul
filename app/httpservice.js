exports = module.exports = function() {
  var consul = require('consul');
  
  
  var api = {};
  
  api.createConnection = function(options, connectListener) {
    var opts = { host: options.name, port: options.port };
    
    var client = consul(opts);
    if (connectListener) {
      process.nextTick(connectListener.bind(client));
    }
    return client;
  };
  
  return api;
};

exports['@singleton'] = true;
exports['@implements'] = [
  'http://i.bixbyjs.org/consul/http',
];
exports['@name'] = 'consul-http';
exports['@port'] = 8500;
exports['@protocol'] = 'tcp';
exports['@require'] = [];
