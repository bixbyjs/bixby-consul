var EventEmitter = require('events').EventEmitter;
var consul = require('consul');
var util = require('util');
var schema = require('./schema')
var dns = require('dns');


function HTTPClient(url) {
  EventEmitter.call(this);
  this._url = url;
  
  this._client = consul();
}

util.inherits(HTTPClient, EventEmitter);

HTTPClient.prototype.resolve = function(type, cb) {
  console.log('HTTP Consul RESOLVE!');
  
  dns.resolveSrv('_xmpp-client._tcp.gmail.com', function(err, x) {
    //console.log(err);
    //console.log(x);
  })
  
  /*
[ { name: 'alt3.xmpp.l.google.com',
    port: 5222,
    priority: 20,
    weight: 0 },
  { name: 'alt4.xmpp.l.google.com',
    port: 5222,
    priority: 20,
    weight: 0 },
  { name: 'alt2.xmpp.l.google.com',
    port: 5222,
    priority: 20,
    weight: 0 },
  { name: 'xmpp.l.google.com', port: 5222, priority: 5, weight: 0 },
  { name: 'alt1.xmpp.l.google.com',
    port: 5222,
    priority: 20,
    weight: 0 } ]
  */
  
  
  /*
  this._client.catalog.service.list(function(err, res) {
    console.log(err);
    console.log(res);
    //console.log(x);
  })
  */
  
  this._client.catalog.service.nodes('beep', function(err, res, x) {
    console.log(err);
    console.log(res);
    console.log(JSON.stringify(res))
    //console.log(x);
    
    if (err) { return cb(err); }
    return cb(null, schema.fromServices(res));
  });
}

module.exports = HTTPClient;
