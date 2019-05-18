exports = module.exports = function() {
  var Client = require('../../lib/cataloghttpclient');
  
  
  var api = {};
  
  // TODO: add inferType from URL method
  
  api.createConnection = function(options, connectListener) {
    var client = new Client(options.url);
    //client._creds = creds;
    
    //client.connect(connectListener);
    return client;
  }
  
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
];
