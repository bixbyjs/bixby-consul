exports = module.exports = function(consul, location) {
  var Resolver = require('../../lib/httpresolver');
  
  console.log('CREATED CONSUL WITH LOCATION!');
  console.log(location);
  
  
  var api = {};
  
  api.createConnection = function(options, connectListener) {
    
    console.log('CREATE CONNECTION!');
    console.log(options);
    
    // options:
    // { name: 'localhost', port: 8500, priority: 1, weight: 1 }
    
    var client = consul.createConnection(options, function() {
      if (connectListener) { connectListener.apply(resolver); }
    });
    var resolver = new Resolver(client);
    return resolver;
  };
  
  return api;
};

exports['@singleton'] = true;
exports['@implements'] = [
  'http://i.bixbyjs.org/ns/INameService'
];
exports['@service'] = 'consul-catalog-http';
exports['@protocol'] = 'tcp';
exports['@port'] = 8500;
exports['@require'] = [
  'http://i.bixbyjs.org/consul/http',
  '$location'
];
