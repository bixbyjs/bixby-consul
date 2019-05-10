var EventEmitter = require('events').EventEmitter;
var consul = require('consul');
var util = require('util');
var schema = require('./schema')
var dns = require('dns');


function CatalogHTTPClient(url) {
  EventEmitter.call(this);
  this._url = url;
  
  this._client = consul();
}

util.inherits(CatalogHTTPClient, EventEmitter);

CatalogHTTPClient.prototype.resolve = function(hostname, rrtype, cb) {
  if (typeof rrtype == 'function') {
    cb = rrtype;
    rrtype = undefined;
  }
  rrtype = rrtype || 'A';
  
  switch (rrtype) {
    case 'A':
      return this.resolve4(hostname, cb);
    case 'SRV':
      return this.resolveSrv(hostname, cb);
  }
};

CatalogHTTPClient.prototype.resolve4 = function(hostname, cb) {
  this._client.catalog.node.services(hostname, function(err, result) {
    if (err) { return cb(err); }
    
    var node = result['Node']
      , addrs = [];
    addrs.push(node['Address']);
    return cb(null, addrs);
  });
};

CatalogHTTPClient.prototype.resolveSrv = function(hostname, cb) {
  this._client.catalog.service.nodes('beep', function(err, result) {
    if (err) { return cb(err); }
    return cb(null, schema.fromServices(result));
  });
};


module.exports = CatalogHTTPClient;
