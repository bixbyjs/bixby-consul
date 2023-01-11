var Resolver = require('../../lib/httpresolver');

exports = module.exports = function(consul, location) {
  // location:
  // { name: 'localhost', port: 8500, priority: 1, weight: 1 }
  
  // TODO: map location to options?
  var client = consul.createConnection(location);
  var resolver = new Resolver(client);
  return resolver;
};

exports['@singleton'] = true;
exports['@implements'] = 'module:bixby-ns.Resolver';
exports['@service'] = 'consul-catalog-http';
exports['@protocol'] = 'tcp';
exports['@port'] = 8500;
exports['@require'] = [
  'http://i.bixbyjs.org/consul/http',
  '$location'
];
