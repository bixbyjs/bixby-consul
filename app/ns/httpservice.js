exports = module.exports = function(consul) {
  var Resolver = require('../../lib/httpresolver');
  
  
  var api = {};
  
  api.createConnection = function(options, connectListener) {
    // options:
    // { name: 'localhost', port: 8500, priority: 1, weight: 1 }
    
    var client = consul.createConnection(options, connectListener);
    var resolver = new Resolver(client);
    return resolver;
  };
  
  return api;
};

exports['@singleton'] = true;
exports['@implements'] = [
  'http://i.bixbyjs.org/IService',
  'http://i.bixbyjs.org/ns/INameService'
];
exports['@name'] = 'consul-catalog-http';
exports['@port'] = 8500;
exports['@protocol'] = 'tcp';
exports['@require'] = [
  'http://i.bixbyjs.org/consul/http'
];
