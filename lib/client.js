var EventEmitter = require('events').EventEmitter;
var consul = require('consul');
var util = require('util');


function HTTPClient(url) {
  EventEmitter.call(this);
  this._url = url;
  
  this._client = consul();
}

util.inherits(HTTPClient, EventEmitter);

HTTPClient.prototype.resolve = function(type, cb) {
  console.log('HTTP Consul RESOLVE!');
  
  /*
  this._client.catalog.service.list(function(err, res) {
    console.log(err);
    console.log(res);
    //console.log(x);
  })
  */
  
  this._client.catalog.service.nodes('login', function(err, res, x) {
    console.log(err);
    console.log(res);
    //console.log(x);
  })
}

module.exports = HTTPClient;
