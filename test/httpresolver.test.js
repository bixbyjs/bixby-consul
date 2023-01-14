var Resolver = require('../lib/httpresolver');
var expect = require('chai').expect;
var sinon = require('sinon');
var consul = require('consul');
var fs = require('fs');


describe.only('ConsulHTTPResolver', function() {
  var _client = sinon.createStubInstance(consul);
  
  describe('#resolve', function() {
    var client = new Resolver(_client);
    
    it('should resolve SRV record of service', function(done) {
      _client.catalog = {};
      _client.catalog.service = {};
      _client.catalog.service.nodes = sinon.stub().yieldsAsync(null, JSON.parse(fs.readFileSync('test/data/http/v1/catalog/service/beep.json', 'utf8')));
      
      client.resolve('_beep._tcp.consul', 'SRV', function(err, addresses) {
        expect(_client.catalog.service.nodes).to.be.calledOnceWith('beep');
        
        expect(err).to.be.null;
        expect(addresses).to.deep.equal([
          { name: 'node1.node.dc1.consul', port: 833 }
        ]);
        done();
      });
    }); // should resolve SRV record of service
    
  });
  
});
