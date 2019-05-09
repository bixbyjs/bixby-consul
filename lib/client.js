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

// TODO: Rename to resolveSrv
HTTPClient.prototype.resolve = function(hostname, rrtype, cb) {
  if (typeof rrtype == 'function') {
    cb = rrtype;
    rrtype = undefined;
  }
  rrtype = rrtype || 'A';
  
  console.log('HTTP Consul RESOLVE!');
  
  /*
  dns.resolveSrv('_xmpp-client._tcp.gmail.com', function(err, x) {
    console.log(err);
    console.log(x);
  })
  */
  
  dns.resolve4('gmail.com', function(err, x) {
    console.log(err);
    console.log(x);
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
  
  switch (rrtype) {
    case 'A':
      return this.resolve4(hostname, cb);
    case 'SRV':
      return this.resolveSrv(hostname, cb);
  }
}

HTTPClient.prototype.resolve4 = function(hostname, cb) {
  this._client.catalog.node.services('imac', function(err, result) {
    if (err) { return cb(err); }
    
    var node = result['Node']
      , addrs = [];
    addrs.push(node['Address']);
    return cb(null, addrs);
  });
};

HTTPClient.prototype.resolveSrv = function(hostname, cb) {
  this._client.catalog.service.nodes('beep', function(err, result) {
    if (err) { return cb(err); }
    return cb(null, schema.fromServices(result));
  });
};

module.exports = HTTPClient;
