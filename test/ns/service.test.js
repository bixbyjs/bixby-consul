var $require = require('proxyquire');
var expect = require('chai').expect;
var sinon = require('sinon');
var factory = require('../../app/ns/service');
var Client = require('../../lib/client');
var consul = require('consul');
var fs = require('fs');


describe('ns/service', function() {
  
  it('should export factory function', function() {
    expect(factory).to.be.a('function');
  });
  
  it('should be annotated', function() {
    expect(factory['@singleton']).to.equal(true);
    expect(factory['@implements']).to.equal('http://i.bixbyjs.org/IService');
    expect(factory['@name']).to.equal('consul-sd');
  });
  
  describe('DirectoryClient', function() {
    var _client = sinon.createStubInstance(consul);
    var ClientStub = sinon.stub().returns(_client);
    var Client = $require('../../lib/client',
      { 'consul': ClientStub }
    );
    
    
    describe('#resolve', function() {
      var client = new Client('https://hansonhq.auth0.com');
      
      //before(function(done) {
        //sinon.stub(client._creds, 'get').yieldsAsync(null, { username: 'wvaTP5EkEjKxGyLAIzUnsnG6uhyRUTkX', password: 'keyboard cat' });
        //client.connect(done);
      //});
      
      it('should resolve A record', function(done) {
        _client.catalog = {};
        _client.catalog.node = {};
        _client.catalog.node.services = sinon.stub().yieldsAsync(null, JSON.parse(fs.readFileSync('test/data/http/v1/catalog/node/node1.json', 'utf8')));
        
        client.resolve('node1', 'A', function(err, user) {
          expect(_client.catalog.node.services.getCall(0).args[0]).to.equal('node1');
          
          expect(err).to.be.null;
          expect(user).to.deep.equal([
            '127.0.0.1'
          ]);
          done();
        });
        
      }); // should resolve A record
      
      it('should resolve SRV record', function(done) {
        _client.catalog = {};
        _client.catalog.service = {};
        _client.catalog.service.nodes = sinon.stub().yieldsAsync(null, JSON.parse(fs.readFileSync('test/data/http/v1/catalog/service/beep.json', 'utf8')));
        
        client.resolve('beep', 'SRV', function(err, user) {
          expect(_client.catalog.service.nodes.getCall(0).args[0]).to.equal('beep');
          
          expect(err).to.be.null;
          expect(user).to.deep.equal([
            { name: 'node1.node.dc1.consul', port: 833 }
          ]);
          done();
        });
        
      }); // should resolve SRV record
      
    }); // #resolve
    
  });
  
});
