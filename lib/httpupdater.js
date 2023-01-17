var uuid = require('uuid').v4;

function HTTPUpdater(client) {
  this._client = client;
}

HTTPUpdater.prototype.register = function(hostname, rrtype, rr, cb) {
  if (typeof rr == 'function') {
    cb = rr;
    rr = rrtype;
    rrtype = undefined;
  }
  rrtype = rrtype || 'A';
  
  switch (rrtype) {
    case 'A':
      return this.register4(hostname, rr, cb);
    case 'CNAME':
      return this.registerCname(hostname, rr, cb);
    case 'SRV':
      return this.registerSrv(hostname, rr, cb);
  }
};

HTTPUpdater.prototype.registerSrv = function(hostname, rr, cb) {
  var labels = hostname.split('.');
  var service = labels[0];
  if (service[0] == '_') {
    service = service.slice(1);
  }
  
  // TODO: Use meta to add URL path?
  
  // The `address` set in the service definition when registering the service
  // corresponds to the `ServiceAddress` property in the response when listing
  // the nodes that provide a service via the `/catalog/service/:service_name`
  // endpoint.  If an address is not set when registering the service,
  // `ServiceAddress` will be empty and the Consul agent's address is used
  // instead.  Using the agent's address, which is within the `.consul` domain,
  // requires additional queries to Consul to resolve the agent's IP address.
  // To avoid these queries, an `address` is always set when using this updater
  // to register a service record.  The address will typically be the hostname
  // of the host, which can be resolved using traditional name resolution
  // infrastructure.
  
  var record = {
    id: uuid(),
    name: service,
    address: rr.name,
    port: rr.port
  };
  this._client.agent.service.register(record, function(err) {
    if (err) { return cb(err); }
    return cb(null, record);
  });
};

HTTPUpdater.prototype.deregister = function(hostname, rrtype, rr, cb) {
  if (typeof rr == 'function') {
    cb = rr;
    rr = rrtype;
    rrtype = undefined;
  }
  rrtype = rrtype || 'A';
  
  switch (rrtype) {
    case 'SRV':
      return this.deregisterSrv(hostname, rr, cb);
  }
};

HTTPUpdater.prototype.deregisterSrv = function(hostname, rr, cb) {
  this._client.agent.service.deregister(rr.id, function(err) {
    if (err) { return cb(err); }
    return cb(null);
  });
};

module.exports = HTTPUpdater;
