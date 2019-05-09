var EventEmitter = require('events').EventEmitter;
var util = require('util');
var dns = require('dns');


function DNSResolver(url) {
  EventEmitter.call(this);
  //this._url = url;
  
  var resolver = new dns.Resolver();
  resolver.setServers(['127.0.0.1:8600']);
  
  this._resolver = resolver;
}

util.inherits(DNSResolver, EventEmitter);

// TODO: Rename to resolveSrv
DNSResolver.prototype.resolve = function(hostname, rrtype, cb) {
  if (typeof rrtype == 'function') {
    cb = rrtype;
    rrtype = undefined;
  }
  rrtype = rrtype || 'A';
  
  console.log('DNS RESOLVE: ' + hostname + ' ' + rrtype);
  
  switch (rrtype) {
    case 'A':
      return this.resolve4(hostname, cb);
      //case 'SRV':
      //return this.resolveSrv(hostname, cb);
  }
};

DNSResolver.prototype.resolve4 = function(hostname, cb) {
  console.log('DNS RESOLVE 4: ' + hostname);
};


module.exports = DNSResolver;
