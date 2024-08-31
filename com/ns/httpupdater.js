// Updater
// Named after the Update operation defined by https://www.rfc-editor.org/rfc/rfc2136
// Resolver is the Query operation

var Updater = require('../../lib/httpupdater');

exports = module.exports = function(consul, location) {
  // location:
  // { name: 'localhost', port: 8500, priority: 1, weight: 1 }
  
  // TODO: map location to options?
  var client = consul.createConnection(location);
  var updater = new Updater(client);
  
  return updater;
  
};

exports['@implements'] = 'module:bixby-ns.Updater';
exports['@require'] = [
  'http://i.bixbyjs.org/consul/http',
  '$srv[consul]'
];
