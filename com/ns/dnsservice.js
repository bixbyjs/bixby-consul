exports = module.exports = function() {
  var Resolver = require('../../lib/dnsresolver');
  
  
  var api = {};
  
  // TODO: add inferType from URL method
  
  api.createConnection = function(options, connectListener) {
    var client = new Resolver();
    //client._creds = creds;
    
    //client.connect(connectListener);
    return client;
  }
  
  return api;
};

exports['@singleton'] = true;
exports['@implements'] = [
  'x-http://i.bixbyjs.org/ns/INameService'
];
exports['@name'] = 'consul-dns';
exports['@port'] = 8600;
exports['@protocol'] = 'udp';
exports['@require'] = [
];
