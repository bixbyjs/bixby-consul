var EventEmitter = require('events').EventEmitter;
var util = require('util');
var dns = require('dns');


function DNSResolver(url) {
  EventEmitter.call(this);
  
  var resolver = new dns.Resolver();
  resolver.setServers(['127.0.0.1:8600']);
  this._resolver = resolver;
}

util.inherits(DNSResolver, EventEmitter);

DNSResolver.prototype.resolve = function(hostname, rrtype, cb) {
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

DNSResolver.prototype.resolve4 = function(hostname, cb) {
  var parts = hostname.split('.');
  parts.splice(1, 0, 'node');
  
  this._resolver.resolve4(parts.join('.'), function(err, addresses) {
    if (err) { return cb(err); }
    return cb(null, addresses);
  });
};

DNSResolver.prototype.resolveCname = function(hostname, cb) {
  var parts = hostname.split('.');
  parts.splice(1, 0, 'node');
  
  // NOTE: The DNS resolver built into Consul does not return CNAME records, but
  // does return them with an ANY query
  this._resolver.resolveAny(parts.join('.'), function(err, ret) {
    if (err) { return cb(err); }
    var addresses = []
      , i, len;
    for (i = 0, len = ret.length; i < len; ++i) {
      if (ret[i].type == 'CNAME') { addresses.push(ret[i].value); }
    }
    return cb(null, addresses);
  });
};

DNSResolver.prototype.resolveSrv = function(hostname, cb) {
  var parts = hostname.split('.');
  parts.splice(1, 0, 'service');
  
  this._resolver.resolveSrv(parts.join('.'), function(err, addresses) {
    if (err) { return cb(err); }
    return cb(null, addresses);
  });
};


module.exports = DNSResolver;
