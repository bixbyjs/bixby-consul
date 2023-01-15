// Module dependencies.
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var net = require('net');
var schema = require('./schema')


/**
 * Create a new resolver.
 *
 * @classdesc This resolver performs name resolution using the {@link https://www.consul.io Consul}
 * {@link https://developer.hashicorp.com/consul/api-docs HTTP API}.
 *
 * @public
 * @class
 */
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

/**
 * Uses the Consul HTTP API to resolve IPv4 addresses (`A` records) for the
 * `hostname`.  The `addresses` argument passed to the `callback` function will
 * contain an array of IPv4 addresses (e.g. `['74.125.79.104', '74.125.79.105',
 * '74.125.79.106']`).
 *
 * @public
 * @param {string} hostname
 * @param {Function} callback
 * @param {Error} callback.err
 * @param {string[]} callback.addresses
 *
 * @example
 * resolver.resolve4('node1.node.consul', function(err, addresses) {
 *   // ...
 * });
 */
ConsulHTTPResolver.prototype.resolve4 = function(hostname, cb) {
  var parts = hostname.split('.')
    , opts = { node: parts[0] };
  if (parts.length == 4) {
    // NOTE: The underlying `consul` package does not currently support this option.
    // TODO: make a patch.
    opts.dc = parts[2];
  }
  
  this._client.catalog.node.services(opts, function(err, result) {
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

/**
 * Uses the Consul HTTP API to resolve service records (`SRV` records) for the
 * `hostname`.  The `addresses` argument passed to the `callback` function will
 * be an array of objects with the following properties:
 *
 * - `priority`
 * - `weight`
 * - `port`
 * - `name`
 *
 * ```js
 * {
 *   priority: 10,
 *   weight: 5,
 *   port: 21223,
 *   name: 'node1.node.dc1.consul'
 * }
 * ```
 *
 * @public
 * @param {string} hostname
 * @param {Function} callback
 * @param {Error} callback.err
 * @param {Object[]} callback.addresses
 *
 * @example
 * resolver.resolveSrv('_example._tcp.consul', function(err, addresses) {
 *   // ...
 * });
 */
ConsulHTTPResolver.prototype.resolveSrv = function(hostname, cb) {
  var labels = hostname.split('.');
  var service = labels[0];
  if (service[0] == '_') {
    service = service.slice(1);
  }
  
  // TODO: Add datacenter support
  
  this._client.catalog.service.nodes(service, function(err, result) {
    if (err) { return cb(err); }
    if (result.length == 0) {
      var error = new Error('querySrv ENOTFOUND ' + hostname);
      error.code = 'ENOTFOUND';
      return cb(error);
    }
    console.log(JSON.stringify(result));
    
    // The `ServiceAddress` indicated in the response corresponds to the
    // `Address` property set in the request when registering a service via the
    // `/agent/service/register` endpoint.  If an address is not set when
    // registering a service, `ServiceAddress` will be empty and the Consul node
    // address will be used instead.
    
    // TODO: Add priority and weight
    return cb(null, schema.fromServices(result));
  });
};


module.exports = ConsulHTTPResolver;
