var EventEmitter = require('events').EventEmitter;
var util = require('util');
var consul = require('consul');
var schema = require('./schema')


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
  var parts = hostname.split('.');
  
  this._client.catalog.node.services(parts[0], function(err, result) {
    if (err) { return cb(err); }
    
    var node = result['Node']
      , addrs = [];
    addrs.push(node['Address']);
    return cb(null, addrs);
  });
};

CatalogHTTPClient.prototype.resolveSrv = function(hostname, cb) {
  var parts = hostname.split('.');
  
  this._client.catalog.service.nodes(parts[0], function(err, result) {
  //this._client.catalog.service.nodes('learn', function(err, result) {
    //console.log(JSON.stringify(result));
    //return;
    if (err) { return cb(err); }
    return cb(null, schema.fromServices(result));
  });
};


module.exports = CatalogHTTPClient;
