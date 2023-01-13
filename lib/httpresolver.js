var EventEmitter = require('events').EventEmitter;
var util = require('util');
var net = require('net');
var schema = require('./schema')


function ConsulHTTPResolver(client) {
  EventEmitter.call(this);
  this._client = client;
}

util.inherits(ConsulHTTPResolver, EventEmitter);

ConsulHTTPResolver.prototype.resolve = function(hostname, rrtype, cb) {
  if (typeof rrtype == 'function') {
    cb = rrtype;
    rrtype = undefined;
  }
  rrtype = rrtype || 'A';
  
  switch (rrtype) {
    case 'A':
      return this.resolve4(hostname, cb);
    case 'CNAME':
      return this.resolveCname(hostname, cb);
    case 'SRV':
      return this.resolveSrv(hostname, cb);
  }
};

ConsulHTTPResolver.prototype.resolve4 = function(hostname, cb) {
  var parts = hostname.split('.')
    , opts = { node: parts[0] };
  if (parts.length == 4) {
    // NOTE: The underlying `consul` package does not currently support this option.
    // TODO: make a patch.
    opts.dc = parts[2];
  }
  
  this._client.catalog.node.services(opts, function(err, result, x) {
    if (err) { return cb(err); }
    
    var node = result['Node']
      , address = node['Address']
      , addrs = [];
    if (net.isIPv4(address)) { addrs.push(address); }
    return cb(null, addrs);
  });
};

ConsulHTTPResolver.prototype.resolveCname = function(hostname, cb) {
  var parts = hostname.split('.')
    , opts = { node: parts[0] };
  if (parts.length == 4) {
    // NOTE: The underlying `consul` package does not currently support this option.
    // TODO: make a patch.
    opts.dc = parts[2];
  }
  
  this._client.catalog.node.services(opts, function(err, result, x) {
    if (err) { return cb(err); }
    
    var node = result['Node']
      , address = node['Address']
      , addrs = [];
    if (!net.isIP(address)) { addrs.push(address); }
    return cb(null, addrs);
  });
};

ConsulHTTPResolver.prototype.resolveSrv = function(hostname, cb) {
  var labels = hostname.split('.');
  var service = labels[0];
  if (service[0] == '_') {
    service = service.slice(1);
  }
  
  this._client.catalog.service.nodes(service, function(err, result) {
    if (err) { return cb(err); }
    if (result.length == 0) {
      var error = new Error('querySrv ENOTFOUND ' + hostname);
      error.code = 'ENOTFOUND';
      return cb(error);
    }
    console.log(result);
    
    return cb(null, schema.fromServices(result));
  });
};


module.exports = ConsulHTTPResolver;
