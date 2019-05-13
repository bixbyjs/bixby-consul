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
      
      it('should resolve A record of external service', function(done) {
        _resolver.resolve4 = sinon.stub().yieldsAsync(null, []);
        
        resolver.resolve('hashicorp.consul', 'A', function(err, addresses) {
          expect(_resolver.resolve4.getCall(0).args[0]).to.equal('hashicorp.node.consul');
          
          expect(err).to.be.null;
          expect(addresses).to.deep.equal([]);
          done();
        });
      }); // should resolve A record of external service
      
      it('should resolve CNAME record of external service', function(done) {
        _resolver.resolveAny = sinon.stub().yieldsAsync(null, [
          { value: 'learn.hashicorp.com/consul/', type: 'CNAME' },
          { entries: [ 'external-node=true' ], type: 'TXT' },
          { entries: [ 'external-probe=true' ], type: 'TXT' }
        ]);
        
        resolver.resolve('hashicorp.consul', 'CNAME', function(err, addresses) {
          expect(_resolver.resolveAny.getCall(0).args[0]).to.equal('hashicorp.node.consul');
          
          expect(err).to.be.null;
          expect(addresses).to.deep.equal(['learn.hashicorp.com/consul/']);
          done();
        });
      }); // should resolve CNAME record of external service
      
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
      
      it('should resolve SRV record of external service', function(done) {
        _resolver.resolveSrv = sinon.stub().yieldsAsync(null, [ { name: 'hashicorp.node.dc1.consul', port: 80, priority: 1, weight: 1 } ]);
        
        resolver.resolve('learn.consul', 'SRV', function(err, addresses) {
          expect(_resolver.resolveSrv.getCall(0).args[0]).to.equal('learn.service.consul');
          
          expect(err).to.be.null;
          expect(addresses).to.deep.equal([
            { name: 'hashicorp.node.dc1.consul', port: 80, priority: 1, weight: 1 }
          ]);
          done();
        });
      }); // should resolve SRV record of external service
      
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
