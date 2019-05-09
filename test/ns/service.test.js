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
      
      it('should resolve', function(done) {
        _client.catalog = {};
        _client.catalog.service = {};
        _client.catalog.service.nodes = sinon.stub().yieldsAsync(null, JSON.parse(fs.readFileSync('test/data/http/v1/catalog/service/beep.json', 'utf8')));
        
        client.resolve('beep', function(err, user) {
          expect(_client.catalog.service.nodes.getCall(0).args[0]).to.equal('beep');
          
          expect(err).to.be.null;
          expect(user).to.deep.equal([
            { name: 'node1.node.dc1.consul', port: 833 }
          ]);
          done();
        });
        
      }); // should get user by id
      
    }); // #resolve
    
  });
  
});
