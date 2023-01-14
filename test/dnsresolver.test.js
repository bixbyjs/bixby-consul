var $require = require('proxyquire');
var Resolver = require('../lib/dnsresolver');
var expect = require('chai').expect;
var sinon = require('sinon');
var dns = require('dns');


describe('DNSResolver', function() {
  var _resolver = sinon.createStubInstance(dns.Resolver);
  var ResolverStub = sinon.stub().returns(_resolver);
  var Resolver = $require('../lib/dnsresolver',
    { 'dns': { Resolver: ResolverStub } }
  );
  
  
  describe('#resolve', function() {
    var resolver = new Resolver();
    
    it('should resolve SRV record of internal service', function(done) {
      _resolver.resolveSrv = sinon.stub().yieldsAsync(null, [ { name: 'node1.node.dc1.consul', port: 833, priority: 1, weight: 1 } ]);
      
      resolver.resolve('_beep._tcp.consul', 'SRV', function(err, addresses) {
        expect(_resolver.resolveSrv.getCall(0).args[0]).to.equal('beep.service.consul');
        
        expect(err).to.be.null;
        expect(addresses).to.deep.equal([
          { name: 'node1.node.dc1.consul', port: 833, priority: 1, weight: 1 }
        ]);
        done();
      });
    }); // should resolve SRV record of internal service
    
  });
  
});