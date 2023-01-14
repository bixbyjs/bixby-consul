var $require = require('proxyquire');
var expect = require('chai').expect;
var sinon = require('sinon');
var factory = require('../../app/ns/httpresolver');
var Resolver = require('../../lib/httpresolver');
var consul = require('consul');
var fs = require('fs');


describe('ns/httpresolver', function() {
  
  it('should export factory function', function() {
    expect(factory).to.be.a('function');
  });
  
  it('should be annotated', function() {
    expect(factory['@singleton']).to.equal(true);
    expect(factory['@implements']).to.deep.equal('module:bixby-ns.Resolver');
    expect(factory['@service']).to.equal('consul-catalog-http');
    expect(factory['@port']).to.equal(8500);
    expect(factory['@protocol']).to.equal('tcp');
  });
  
  // TODO: Put this back
  describe.skip('API', function() {
    var _consul = { createConnection: function(){} };
    var ResolverStub = sinon.stub().returns(sinon.createStubInstance(Resolver));
    var api = $require('../../app/ns/httpresolver',
      { '../../lib/httpresolver': ResolverStub }
    )(_consul);
    
    
    describe('.createConnection', function() {
      beforeEach(function() {
        sinon.stub(_consul, 'createConnection').returns({ type: 'consul' }).yieldsAsync();
      });
      
      afterEach(function() {
        ResolverStub.resetHistory();
      });
      
      
      it('should construct resolver', function() {
        var resolver = api.createConnection({ name: 'consul.example.com', port: 8500 });
        
        expect(_consul.createConnection).to.have.been.calledOnceWith({ name: 'consul.example.com', port: 8500 });
        expect(ResolverStub).to.have.been.calledOnce.and.calledWithNew;
        expect(ResolverStub.getCall(0).args[0]).to.deep.equal({ type: 'consul' });
        expect(resolver).to.be.an.instanceof(Resolver);
      }); // should construct resolver
      
      it('should construct resolver and invoke callback', function(done) {
        var resolver = api.createConnection({ name: 'consul.example.com', port: 8500 }, function() {
          expect(this).to.be.an.instanceof(Resolver);
          done();
        });
        
        expect(_consul.createConnection).to.have.been.calledOnceWith({ name: 'consul.example.com', port: 8500 });
        expect(ResolverStub).to.have.been.calledOnce.and.calledWithNew;
        expect(ResolverStub.getCall(0).args[0]).to.deep.equal({ type: 'consul' });
        expect(resolver).to.be.an.instanceof(Resolver);
      }); // should construct resolver and invoke callback
      
    }); // .createConnection
    
  }); // API
  
});
