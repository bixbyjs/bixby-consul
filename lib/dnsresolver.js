var EventEmitter = require('events').EventEmitter;
var util = require('util');
var dns = require('dns');


function DNSResolver(url) {
  EventEmitter.call(this);
  //this._url = url;
  
}

util.inherits(DNSResolver, EventEmitter);

// TODO: Rename to resolveSrv
DNSResolver.prototype.resolve = function(hostname, rrtype, cb) {
  console.log('DNS RESOLVE: ' + hostname + ' ' + rrtype);
};


module.exports = DNSResolver;
