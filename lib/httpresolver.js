// Module dependencies.
var util = require('util');
var net = require('net');
var filterObj = require('filter-obj');
var mapObj = require('map-obj');


var TO_SRV = {
  'Node': [ 'name', function(v, obj, domain) { return obj['ServiceAddress'] || (!net.isIP(obj['Address']) && obj['Address']) || [v, 'node', obj['Datacenter'], domain].join('.'); } ],
  'ServicePort': [ 'port' ]
}


/**
 * Create a new resolver.
 *
 * @classdesc This resolver performs name resolution using the {@link https://www.consul.io Consul}
 * {@link https://developer.hashicorp.com/consul/api-docs HTTP API}.
 *
 * @public
 * @class
 */
function ConsulHTTPResolver(client, domain) {
  this._client = client;
  this._domain = domain || 'consul';
}

/**
 * Uses the Consul HTTP API to resolve a host name (e.g. 'node1.node.consul')
 * into an array of the resource records.  The `callback` function has arguments
 * `(err, records)`.  When successful, records will be an array of resource
 * records.  The type and structure of individual results varies based on
 * `rrtype`.
 *
 * On error, `err` is an `Error` object, where `err.code` is one of the DNS
 * error codes.
 *
 * @public
 * @param {string} hostname
 * @param {string} rrtype
 * @param {Function} callback
 * @param {Error} callback.err
 * @param {string[]|Object[]|Object} callback.records
 */
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
  var labels = hostname.split('.')
    , opts = { node: labels[0] };
  if (labels.length == 4) {
    // NOTE: The underlying `consul` package does not currently support this option.
    // TODO: make a patch.
    opts.dc = labels[2];
  }
  
  // Internally, this makes a request to the [Catalog HTTP API][1] to [retrieve
  // map of services for a node][2].
  //
  // [1]: https://developer.hashicorp.com/consul/api-docs/catalog
  // [2]: https://developer.hashicorp.com/consul/api-docs/catalog#retrieve-map-of-services-for-a-node
  this._client.catalog.node.services(opts, function(err, result) {
    if (err) { return cb(err); }
    if (!result) {
      var error = new Error('queryA ENOTFOUND ' + hostname);
      error.code = 'ENOTFOUND';
      return cb(error);
    }
    
    var node = result['Node']
      , address = node['Address']
      , addrs = [];
    if (net.isIPv4(address)) { addrs.push(address); }
    return cb(null, addrs);
  });
};

/**
 * Uses the Consul HTTP API to resolve `CNAME` records for the `hostname`.  The
 * `addresses` argument passed to the `callback` function will contain an array
 * of canonical name records available for the `hostname` (e.g.
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
ConsulHTTPResolver.prototype.resolveCname = function(hostname, cb) {
  var labels = hostname.split('.')
    , opts = { node: labels[0] };
  if (labels.length == 4) {
    // NOTE: The underlying `consul` package does not currently support this option.
    // TODO: make a patch.
    opts.dc = labels[2];
  }
  
  // Internally, this makes a request to the [Catalog HTTP API][1] to [retrieve
  // map of services for a node][2].
  //
  // [1]: https://developer.hashicorp.com/consul/api-docs/catalog
  // [2]: https://developer.hashicorp.com/consul/api-docs/catalog#retrieve-map-of-services-for-a-node
  this._client.catalog.node.services(opts, function(err, result, x) {
    if (err) { return cb(err); }
    
    var node = result['Node']
      , address = node['Address']
      , hostnames = [];
    if (!net.isIP(address)) { hostnames.push(address); }
    if (hostnames.length == 0) {
      var error = new Error('queryCname ENODATA ' + hostname);
      error.code = 'ENODATA';
      return cb(error);
    }
    return cb(null, hostnames);
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
  
  var self = this;
  // Internally, this makes a request to the [Catalog HTTP API][1] to [list
  // nodes for a service][2].
  //
  // [1]: https://developer.hashicorp.com/consul/api-docs/catalog
  // [2]: https://developer.hashicorp.com/consul/api-docs/catalog#list-nodes-for-service
  this._client.catalog.service.nodes(service, function(err, result) {
    if (err) { return cb(err); }
    if (result.length == 0) {
      var error = new Error('querySrv ENOTFOUND ' + hostname);
      error.code = 'ENOTFOUND';
      return cb(error);
    }
    //console.log(JSON.stringify(result));
    
    // The `ServiceAddress` indicated in the response corresponds to the
    // `Address` property set in the request when registering a service via the
    // `/agent/service/register` endpoint.  If an address is not set when
    // registering a service, `ServiceAddress` will be empty and the Consul node
    // address will be used instead.
    
    var addresses = result.map(function(obj) {
      var o = filterObj(obj, Object.keys(TO_SRV));
      return mapObj(o, function(k, v, o) {
        var map = TO_SRV[k];
        if (!map) { return [ k, v ]; }
        return [ map[0], map[1] ? map[1](v, obj, self._domain) : v ];
      });
    });
    
    // TODO: Add priority and weight
    
    return cb(null, addresses);
  });
};


module.exports = ConsulHTTPResolver;
