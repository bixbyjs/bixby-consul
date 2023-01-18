// Module dependencies.
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var dns = require('dns');


/**
 * Create a new resolver.
 *
 * @classdesc This resolver performs name resolution using the {@link https://www.consul.io Consul}
 * {@link https://developer.hashicorp.com/consul/docs/discovery/dns DNS interface}.
 *
 * @public
 * @class
 */
function DNSResolver() {
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
    case 'TXT':
      return this.resolveTxt(hostname, cb);
  }
};

/**
 * Uses the Consul DNS interface to resolve IPv4 addresses (`A` records) for the
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
DNSResolver.prototype.resolve4 = function(hostname, cb) {
  // An equivalent DNS query can be executed from the command line:
  //
  //   $ dig @127.0.0.1 -p 8600 node1.node.consul A
  //
  //   $ dig @127.0.0.1 -p 8600 node1.node.dc1.consul A
  this._resolver.resolve4(hostname, function(err, addresses) {
    if (err) { return cb(err); }
    return cb(null, addresses);
  });
};

/**
 * Uses the Consul DNS interface to resolve `CNAME` records for the `hostname`.
 * The `addresses` argument passed to the `callback` function will contain an
 * array of canonical name records available for the `hostname` (e.g.
 * `['bar.example.com']`).
 *
 * @public
 * @param {string} hostname
 * @param {Function} callback
 * @param {Error} callback.err
 * @param {string[]} callback.addresses
 *
 * @example
 * resolver.resolveCname('example.node.consul', function(err, addresses) {
 *   // ...
 * });
 */
DNSResolver.prototype.resolveCname = function(hostname, cb) {
  // Consul's DNS server does not respond to `CNAME` queries, but it does
  // respond with `CNAME` records for `ANY` queries.  As such, this
  // implementation makes an `ANY` query and filters the response to contain
  // only `CNAME` records.
  //
  // An equivalent DNS query can be executed from the command line:
  //
  //   $ dig @127.0.0.1 -p 8600 example.node.consul ANY
  //
  //   $ dig @127.0.0.1 -p 8600 example.node.dc1.consul ANY
  this._resolver.resolveAny(hostname, function(err, ret) {
    if (err) { return cb(err); }
    var addresses = []
      , i, len;
    for (i = 0, len = ret.length; i < len; ++i) {
      if (ret[i].type == 'CNAME') { addresses.push(ret[i].value); }
    }
    return cb(null, addresses);
  });
};

/**
 * Uses the Consul DNS interface to resolve service records (`SRV` records) for
 * the `hostname`.  The `addresses` argument passed to the `callback` function
 * will be an array of objects with the following properties:
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
DNSResolver.prototype.resolveSrv = function(hostname, cb) {
  var labels = hostname.split('.');
  var service = labels[0];
  if (service[0] == '_') {
    service = service.slice(1);
  }
  
  // An equivalent DNS query can be executed from the command line:
  //
  //   $ dig @127.0.0.1 -p 8600 beep.service.consul SRV
  //
  //   $ dig @127.0.0.1 -p 8600 beep.service.dc1.consul SRV
  var hostname = service + '.service.' + labels.slice(2).join('.');
  this._resolver.resolveSrv(hostname, function(err, addresses) {
    if (err) { return cb(err); }
    return cb(null, addresses);
  });
};

DNSResolver.prototype.resolveTxt = function(hostname, cb) {
  var parts = hostname.split('.');
  parts.splice(1, 0, 'node');
  
  // TODO: should this resolve in services, by default?  To match mdns?
  this._resolver.resolveTxt(parts.join('.'), function(err, records) {
    if (err) { return cb(err); }
    return cb(null, records);
  });
};


module.exports = DNSResolver;
