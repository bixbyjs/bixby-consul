var filterObj = require('filter-obj');
var mapObj = require('map-obj');

var SERVICE_FROM = {
  'Node': [ 'name', function(v, o) { return [v, o['Datacenter'], 'consul'].join('.'); } ],
  'ServicePort': [ 'port' ]
}

function from(obj, schema) {
  var o = filterObj(obj, Object.keys(schema));
  return mapObj(o, function(k, v, o) {
    var map = schema[k];
    if (!map) { return [ k, v ]; }
    return [ map[0], map[1] ? map[1](v, obj) : v ];
  });
}



exports.fromService = function(service) {
  return from(service, SERVICE_FROM);
};

exports.fromServices = function(services) {
  return services.map(exports.fromService);
}
