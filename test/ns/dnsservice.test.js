var $require = require('proxyquire');
var expect = require('chai').expect;
var sinon = require('sinon');
var factory = require('../../app/ns/dnsservice');
var Resolver = require('../../lib/dnsresolver');
var dns = require('dns');
var fs = require('fs');


describe('ns/dnsservice', function() {
  
  it('should export factory function', function() {
    expect(factory).to.be.a('function');
  });
  
  it('should be annotated', function() {
    expect(factory['@singleton']).to.equal(true);
    expect(factory['@implements']).to.equal('http://i.bixbyjs.org/IService');
    expect(factory['@name']).to.equal('consul-dns');
  });
  
  describe('DNSResolver', function() {
    var _resolver = sinon.createStubInstance(dns.Resolver);
    var ResolverStub = sinon.stub().returns(_resolver);
    var Resolver = $require('../../lib/dnsresolver',
      { 'dns': { Resolver: ResolverStub } }
    );
    
    
    describe('#resolve', function() {
      var resolver = new Resolver();
      
      it('should resolve A record', function(done) {
        _resolver.resolve4 = sinon.stub().yieldsAsync(null, [ '127.0.0.1' ]);
        
        resolver.resolve('node1.consul', 'A', function(err, addresses) {
          expect(_resolver.resolve4.getCall(0).args[0]).to.equal('node1.node.consul');
          
          expect(err).to.be.null;
          expect(addresses).to.deep.equal([
            '127.0.0.1'
          ]);
          done();
        });
      }); // should resolve A record
      
      it('should resolve SRV record', function(done) {
        _resolver.resolveSrv = sinon.stub().yieldsAsync(null, [ { name: 'node1.node.dc1.consul', port: 833, priority: 1, weight: 1 } ]);
        
        resolver.resolve('beep.consul', 'SRV', function(err, addresses) {
          expect(_resolver.resolveSrv.getCall(0).args[0]).to.equal('beep.service.consul');
          
          expect(err).to.be.null;
          expect(addresses).to.deep.equal([
            { name: 'node1.node.dc1.consul', port: 833, priority: 1, weight: 1 }
          ]);
          done();
        });
      }); // should resolve SRV record
      
    }); // #resolve
    
  }); // DNSResolver
  
});
