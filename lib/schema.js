var filterObj = require('filter-obj');
var mapObj = require('map-obj');

var SERVICE_FROM = {
  'ServicePort': [ 'port' ]
}

function from(obj, schema) {
  var o = filterObj(obj, Object.keys(schema));
  return mapObj(o, function(k, v) {
    var map = schema[k];
    if (!map) { return [ k, v ]; }
    return [ map[0], map[1] ? map[1](v) : v ];
  });
}



exports.fromService = function(service) {
  return from(service, SERVICE_FROM);
};

exports.fromServices = function(services) {
  return services.map(exports.fromService);
}
