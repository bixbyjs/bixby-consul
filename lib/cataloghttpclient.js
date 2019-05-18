var EventEmitter = require('events').EventEmitter;
var util = require('util');
var net = require('net');
var schema = require('./schema')


function CatalogHTTPResolver(client) {
  EventEmitter.call(this);
  this._client = client;
}

util.inherits(CatalogHTTPResolver, EventEmitter);

CatalogHTTPResolver.prototype.resolve = function(hostname, rrtype, cb) {
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

CatalogHTTPResolver.prototype.resolve4 = function(hostname, cb) {
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

CatalogHTTPResolver.prototype.resolveCname = function(hostname, cb) {
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

CatalogHTTPResolver.prototype.resolveSrv = function(hostname, cb) {
  var parts = hostname.split('.');
  
  this._client.catalog.service.nodes(parts[0], function(err, result) {
    if (err) { return cb(err); }
    return cb(null, schema.fromServices(result));
  });
};


module.exports = CatalogHTTPResolver;
