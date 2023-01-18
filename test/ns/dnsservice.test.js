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
    expect(factory['@implements']).to.deep.equal([ 'x-http://i.bixbyjs.org/ns/INameService' ]);
    expect(factory['@name']).to.equal('consul-dns');
    expect(factory['@port']).to.equal(8600);
    expect(factory['@protocol']).to.equal('udp');
  });
  
  describe('DNSResolver', function() {
    var _resolver = sinon.createStubInstance(dns.Resolver);
    var ResolverStub = sinon.stub().returns(_resolver);
    var Resolver = $require('../../lib/dnsresolver',
      { 'dns': { Resolver: ResolverStub } }
    );
    
    
    describe('#resolve', function() {
      var resolver = new Resolver();
      
      
      it('should resolve TXT record', function(done) {
        _resolver.resolveTxt = sinon.stub().yieldsAsync(null, [ [ 'consul-network-segment=' ] ]);
        
        resolver.resolve('node1.consul', 'TXT', function(err, records) {
          expect(_resolver.resolveTxt.getCall(0).args[0]).to.equal('node1.node.consul');
          
          expect(err).to.be.null;
          expect(records).to.deep.equal([ [ 'consul-network-segment=' ] ]);
          done();
        });
      }); // should resolve TXT record
      
      it('should resolve TXT record of external service', function(done) {
        _resolver.resolveTxt = sinon.stub().yieldsAsync(null, [ [ 'external-node=true' ], [ 'external-probe=true' ] ]);
        
        resolver.resolve('hashicorp.consul', 'TXT', function(err, records) {
          expect(_resolver.resolveTxt.getCall(0).args[0]).to.equal('hashicorp.node.consul');
          
          expect(err).to.be.null;
          expect(records).to.deep.equal([ [ 'external-node=true' ], [ 'external-probe=true' ] ]);
          done();
        });
      }); // should resolve TXT record of external service
      
    }); // #resolve
    
  }); // DNSResolver
  
});
