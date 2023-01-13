var uuid = require('uuid').v4;

function HTTPUpdater(client) {
  this._client = client;
}

HTTPUpdater.prototype.register = function(hostname, rrtype, rr, cb) {
  console.log('CONSUL UPDATE!');
  if (typeof rr == 'function') {
    cb = rr;
    rr = rrtype;
    rrtype = undefined;
  }
  rrtype = rrtype || 'A';
  
  console.log('UPDATE IT!');
  console.log(hostname);
  console.log(rrtype);
  console.log(rr);
  
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
  console.log('CONSUL UPDATE SRV');
  console.log(hostname);
  console.log(rr);
  
  // TODO: Add ID?
  // TODO: Specify address to override agent?
  // TODO: Use meta to add URL path?
  // TODO: add port
  
  var rec = {
    id: uuid(),
    name: "test-service",
    //tags: ['test', 'nonprod'],
    //address: '192.16.0.25',
    //address: '127.0.0.1',
    address: rr.name, // FIXME: not working?
    port: rr.port
  }

  console.log(rec);

  this._client.agent.service.register(rec, function (err, result) {
    console.log('AGENT SERVICE REGISTER RESULT');
    console.log(err);
    console.log(result);
    
    if (err) { return cb(err); }
    return cb(null, rec);
  });
  
  
  
  //return cb(null);
  
}

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
  console.log('CONSUL DEREGISTER SRV');
  console.log(hostname);
  console.log(rr);

  try {
    
  

  this._client.agent.service.deregister(rr.id, function (err, result) {
    console.log('AGENT SERVICE DEREGISTER RESULT');
    console.log(err);
    console.log(result);
    
    if (err) { return cb(err); }
    return cb(null);
  });
  
  } catch (ex) {
    console.log(ex);
  }
  
  //return cb(null);
  
}

module.exports = HTTPUpdater;
