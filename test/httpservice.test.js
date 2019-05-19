var $require = require('proxyquire');
var expect = require('chai').expect;
var sinon = require('sinon');
var factory = require('../app/httpservice');
var consul = require('consul');


describe('httpservice', function() {
  
  it('should export factory function', function() {
    expect(factory).to.be.a('function');
  });
  
  it('should be annotated', function() {
    expect(factory['@singleton']).to.equal(true);
    expect(factory['@implements']).to.deep.equal([ 'http://i.bixbyjs.org/consul/http', 'http://i.bixbyjs.org/IService' ]);
    expect(factory['@name']).to.equal('consul-http');
    expect(factory['@port']).to.equal(8500);
    expect(factory['@protocol']).to.equal('tcp');
  });
  
  describe('API', function() {
    var _client = sinon.createStubInstance(Object);
    var consulStub = sinon.stub().returns(_client);
    var api = $require('../app/httpservice',
      { 'consul': consulStub }
    )();
    
    
    describe('.createConnection', function() {
      afterEach(function() {
        consulStub.resetHistory();
      });
      
      
      it('should construct client', function() {
        var client = api.createConnection({ name: 'consul.example.com', port: 8500 });
        
        expect(consulStub).to.have.been.calledOnceWithExactly({ host: "consul.example.com", port: 8500 });
        expect(client).to.be.an.instanceof(Object);
      }); // should construct client
      
      it('should construct client and invoke callback', function(done) {
        var client = api.createConnection({ name: 'consul.example.com', port: 8500 }, function() {
          expect(this).to.be.an.instanceof(Object);
          done();
        });
        
        expect(consulStub).to.have.been.calledOnceWithExactly({ host: "consul.example.com", port: 8500 });
        expect(client).to.be.an.instanceof(Object);
      }); // should construct client and invoke callback
      
    }); // .createConnection
    
  }); // API
  
});
