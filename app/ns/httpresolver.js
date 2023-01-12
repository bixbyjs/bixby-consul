var Resolver = require('../../lib/httpresolver');

exports = module.exports = function(consul, location) {
  // location:
  // { name: 'localhost', port: 8500, priority: 1, weight: 1 }
  
  // TODO: map location to options?
  var client = consul.createConnection(location);
  var resolver = new Resolver(client);
  
  
  console.log('*** DOING CONSUL OPERATIONS *****');
  /*
  
  console.log('MEMBERS');
  client.agent.members(function(err, result) {
    console.log('AGENT MEMBERS RESULT');
    console.log(err);
    console.log(result);
  });
  
  client.agent.self(function(err, result) {
    //console.log('SELF RESULT');
    //console.log(err);
    //console.log(result);
  });
  
  
  var serviceDefinition = {
      name: "test-service",
      tags: ['test', 'nonprod']
  }

  // Register the 'test-service' with the local agent
  client.agent.service.register(serviceDefinition, function (err, result) {
    console.log('AGENT SERVICE REGISTER RESULT');
    console.log(err);
    console.log(result);
      //if (err) throw err;
  });
  
  client.agent.service.list(function(err, result) {
    console.log('AGENT SERVICE LIST RESULT');
    console.log(err);
    console.log(result);
  });
  
  client.catalog.datacenters(function(err, result) {
    console.log('CATALOG DATACENTERS RESULT');
    console.log(err);
    console.log(result);
  });
  
  client.catalog.node.list(function(err, result) {
    console.log('CATALOG NODE LIST RESULT');
    console.log(err);
    console.log(result);
  });
  
  client.catalog.node.services('node1', function(err, result) {
    console.log('CATALOG NODE SERVICES RESULT');
    console.log(err);
    console.log(result);
  });
  
  client.catalog.service.list(function(err, result) {
    console.log('CATALOG SERVICE LIST RESULT');
    console.log(err);
    console.log(result);
  });
  
  client.catalog.service.nodes('test-service', function(err, result) {
    console.log('CATALOG SERVICE NODES RESULT');
    console.log(err);
    console.log(result);
  });
  
  
  //resolver.resolve('foo.consul', 'A', function(err, recs) {
  //resolver.resolve('foo.consul', 'CNAME', function(err, recs) {
  resolver.resolve('foo.consul', 'SRV', function(err, recs) {
    
    console.log('** CONSUL RESULTS ***');
    console.log(err);
    console.log(recs);
  });
  
  */
  
  
  
  return resolver;
};

exports['@singleton'] = true;
exports['@implements'] = 'module:bixby-ns.Resolver';
exports['@service'] = 'consul-catalog-http';
exports['@protocol'] = 'tcp';
exports['@port'] = 8500;
exports['@require'] = [
  'http://i.bixbyjs.org/consul/http',
  '$location'
];
