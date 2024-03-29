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
    
    it('should resolve A record of node', function(done) {
      _resolver.resolve4 = sinon.stub().yieldsAsync(null, [ '127.0.0.1' ]);
      
      resolver.resolve('node1.node.consul', 'A', function(err, addresses) {
        expect(_resolver.resolve4.getCall(0).args[0]).to.equal('node1.node.consul');
        
        expect(err).to.be.null;
        expect(addresses).to.deep.equal([
          '127.0.0.1'
        ]);
        done();
      });
    }); // should resolve A record of node
    
    it('should resolve A record of node in datacenter', function(done) {
      _resolver.resolve4 = sinon.stub().yieldsAsync(null, [ '127.0.0.1' ]);
      
      resolver.resolve('node1.node.dc1.consul', 'A', function(err, addresses) {
        expect(_resolver.resolve4.getCall(0).args[0]).to.equal('node1.node.dc1.consul');
        
        expect(err).to.be.null;
        expect(addresses).to.deep.equal([
          '127.0.0.1'
        ]);
        done();
      });
    }); // should resolve A record of node in datacenter
    
    it('should resolve A record of external node', function(done) {
      _resolver.resolve4 = sinon.stub().yieldsAsync(null, []);
      
      resolver.resolve('hashicorp.node.consul', 'A', function(err, addresses) {
        expect(_resolver.resolve4.getCall(0).args[0]).to.equal('hashicorp.node.consul');
        
        expect(err).to.be.null;
        expect(addresses).to.deep.equal([]);
        done();
      });
    }); // should resolve A record of external node
    
    it('should resolve CNAME record of external node', function(done) {
      _resolver.resolveAny = sinon.stub().yieldsAsync(null, [
        { value: 'learn.hashicorp.com', type: 'CNAME' },
        { entries: [ 'external-node=true' ], type: 'TXT' },
        { entries: [ 'external-probe=true' ], type: 'TXT' }
      ]);
      
      resolver.resolve('hashicorp.node.consul', 'CNAME', function(err, addresses) {
        expect(_resolver.resolveAny.getCall(0).args[0]).to.equal('hashicorp.node.consul');
        
        expect(err).to.be.null;
        expect(addresses).to.deep.equal(['learn.hashicorp.com']);
        done();
      });
    }); // should resolve CNAME record of external node
    
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
    
    it('should resolve SRV record of internal service with address', function(done) {
      _resolver.resolveSrv = sinon.stub().yieldsAsync(null, [ { name: 'node1.test', port: 800, priority: 1, weight: 1 } ]);
      
      resolver.resolve('_boop._tcp.consul', 'SRV', function(err, addresses) {
        expect(_resolver.resolveSrv.getCall(0).args[0]).to.equal('boop.service.consul');
        
        expect(err).to.be.null;
        expect(addresses).to.deep.equal([
          { name: 'node1.test', port: 800, priority: 1, weight: 1 }
        ]);
        done();
      });
    }); // should resolve SRV record of internal service with address
    
    it('should resolve SRV record of internal service running on multiple ports with address', function(done) {
      _resolver.resolveSrv = sinon.stub().yieldsAsync(null, [
        { name: 'node1.test', port: 872, priority: 1, weight: 1 },
        { name: 'node1.test', port: 871, priority: 1, weight: 1 }
      ]);
      
      resolver.resolve('_boop._tcp.consul', 'SRV', function(err, addresses) {
        expect(_resolver.resolveSrv.getCall(0).args[0]).to.equal('boop.service.consul');
        
        expect(err).to.be.null;
        expect(addresses).to.deep.equal([
          { name: 'node1.test', port: 872, priority: 1, weight: 1 },
          { name: 'node1.test', port: 871, priority: 1, weight: 1 }
        ]);
        done();
      });
    }); // should resolve SRV record of internal service with address
    
    it('should resolve SRV record of external service', function(done) {
      _resolver.resolveSrv = sinon.stub().yieldsAsync(null, [ { name: 'learn.hashicorp.com', port: 80, priority: 1, weight: 1 } ]);
      
      resolver.resolve('_learn._tcp.consul', 'SRV', function(err, addresses) {
        expect(_resolver.resolveSrv.getCall(0).args[0]).to.equal('learn.service.consul');
        
        expect(err).to.be.null;
        expect(addresses).to.deep.equal([
          { name: 'learn.hashicorp.com', port: 80, priority: 1, weight: 1 }
        ]);
        done();
      });
    }); // should resolve SRV record of external service
    
  });
  
});